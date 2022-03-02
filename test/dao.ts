import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { DAO, DAO__factory, VotingToken, VotingToken__factory } from "../typechain";

describe("DAO contract", function () {
    let owner: SignerWithAddress;
    let propAdmin: SignerWithAddress;
    let voter1: SignerWithAddress;
    let voter2: SignerWithAddress;
    let voter3: SignerWithAddress;
    let user: SignerWithAddress;
    let DAOfactory: DAO__factory;
    let votingTokenFactory: VotingToken__factory;
    let myDAO: DAO;
    let votingToken: VotingToken;

    before(async function () {
        [owner, propAdmin, voter1, voter2, voter3, user] = await ethers.getSigners();

        votingTokenFactory = await ethers.getContractFactory(
            "VotingToken", owner
        ) as VotingToken__factory;
        DAOfactory = await ethers.getContractFactory(
            "DAO", owner
        ) as DAO__factory;
    });

    describe("Deployment and utility functions", function () {
        it("Deploy contracts", async function () {
            let numVotes = ethers.utils.parseEther("500");
            votingToken = await votingTokenFactory.deploy();
            await votingToken.deployed();
            myDAO = await DAOfactory.deploy(
                owner.address, votingToken.address, 
                numVotes, 3600 * 24 * 3
            );
            await votingToken.mint(voter1.address, numVotes);
            await votingToken.mint(voter2.address, numVotes);
            await votingToken.mint(voter3.address, numVotes);
       });

       it("Admin management", async function () {
           expect (
               await myDAO.setPropAdmin(propAdmin.address)
           ).to.satisfy;
           expect(
               myDAO.connect(propAdmin).setPropAdmin(user.address)
           ).to.be.reverted;
           expect (
               await myDAO.unsetPropAdmin(user.address)
           ).to.satisfy;
           expect(
               myDAO.connect(propAdmin).unsetPropAdmin(user.address)
           ).to.be.reverted;
       });

       it("Debate time and quorum management", async function () {
           expect (
               await myDAO.setQuorum(
                   ethers.utils.parseEther("250")
               )
           ).to.satisfy;
           expect (
               myDAO.setQuorum(2)
           ).to.be.reverted;
           expect (
               myDAO.connect(propAdmin).setQuorum(1337)
           ).to.be.reverted;


           expect(
               await myDAO.setDebateDuration(3600 * 36)
           ).to.satisfy;
           expect(
               myDAO.setDebateDuration(3600)
           ).to.be.reverted;
           expect(
               myDAO.connect(propAdmin).setDebateDuration(3600 * 72)
           ).to.be.reverted;
       });
    });

    describe("Core features", function () {
        it("Deposit", async function () {
            let b0 = ethers.utils.parseEther("100");
            let b1 = ethers.utils.parseEther("200");
            let b2 = ethers.utils.parseEther("300");
            await votingToken.connect(voter1).increaseAllowance(
                myDAO.address, b1
                );
            await votingToken.connect(voter2).increaseAllowance(
                myDAO.address, b1
                );
            await votingToken.connect(voter3).increaseAllowance(myDAO.address, b2);
            expect (
                await myDAO.connect(voter1).deposit(b0)
            ).to.satisfy;
            expect (
                await myDAO.connect(voter1).deposit(b0)
            ).to.satisfy;

            expect (
                await myDAO.connect(voter2).deposit(b1)
            ).to.satisfy;

            expect (
                await myDAO.connect(voter3).deposit(b2)
            ).to.satisfy;
        });
        it("Proposals creation", async function () {
            let abi = [
                "function mint(address to, uint256 amount)"
            ];
            let iface0 = new ethers.utils.Interface(abi);
            let callData0 = iface0.encodeFunctionData("mint", [user.address, ethers.utils.parseEther("1337")]);
            let abi1 = [
                "function addDebateTime(uint256 id, uint256 value)"
            ];
            let iface1 = new ethers.utils.Interface(abi1);
            let callData1 = iface1.encodeFunctionData("addDebateTime", [0, 3600*24*7]);
            expect (
                await myDAO.connect(propAdmin).addProposal(
                    callData0, votingToken.address, "Mint 1337 tokens to user"
                )
            ).to.emit(myDAO, "ProposalEvent").withArgs(0, true, false);
            expect (
                myDAO.connect(user).addProposal(
                    callData0, votingToken.address, "Mint 1337 tokens to user"
                )
            ).to.be.reverted;
            expect (
                await myDAO.connect(propAdmin).addProposal(
                    callData1, myDAO.address, "Add debate time for prop 0"
                )
            ).to.emit(myDAO, "ProposalEvent").withArgs(1, true, false);
        });

        it("Proposal modification", async function () {
            let q = ethers.utils.parseEther("250");
            expect (
                await myDAO.connect(propAdmin).setPropQuorum(0,q)
            ).to.satisfy;


            expect (
                myDAO.connect(propAdmin).setPropQuorum(0,2)
            ).to.be.reverted;
        });

        it("Voting", async function () {
            expect (
                await myDAO.connect(voter1).vote(1, true)
            ).to.emit(myDAO, "Vote").withArgs(1, voter1.address, true);
            expect (
                await myDAO.connect(voter2).vote(1, true)

            ).to.emit(myDAO, "Vote").withArgs(1, voter2.address, true);
            expect (
                await myDAO.connect(voter3).vote(1, true)

            ).to.emit(myDAO, "Vote").withArgs(1, voter3.address, true);

            expect (
                await myDAO.connect(voter1).vote(0, true)

            ).to.emit(myDAO, "Vote").withArgs(0, voter1.address, true);
            expect (
                await myDAO.connect(voter2).vote(0, true)

            ).to.emit(myDAO, "Vote").withArgs(0, voter2.address, true);
            expect (
                await myDAO.connect(voter3).vote(0, false)

            ).to.emit(myDAO, "Vote").withArgs(0, voter3.address, false);
            expect (
                myDAO.connect(voter1).vote(0, true)
            ).to.be.reverted;
        });

        it("Proposal finish & withdraw", async function () {
            //cannot finish proposals until debate period has passed
            await expect (
                myDAO.connect(user).finishProposal(1)
            ).to.be.reverted;
            //also cannot withdraw until user has unfinished proposals
            await expect(
                myDAO.connect(voter1).withdraw(ethers.utils.parseEther("200"))
            ).to.be.reverted;

            await network.provider.send("evm_increaseTime", [3600*24*3]);
            await network.provider.send("evm_mine"); //now we can finish proposal 1 which sets proposal 0 debate period +7 days

            expect (
                await myDAO.connect(user).finishProposal(1)
            ).to.emit(myDAO, "ProposalEvent").withArgs(1, false, true);

            //still cannot withdraw due to prop 0
            expect(
                myDAO.connect(voter1).withdraw(ethers.utils.parseEther("200"))
            ).to.be.reverted;

            await network.provider.send("evm_increaseTime", [3600*24*7]);
            await network.provider.send("evm_mine"); //now we can finish proposal 0
            
            expect (
                await myDAO.connect(user).finishProposal(0)
            ).to.emit(myDAO, "ProposalEvent").withArgs(0, false, true);

            expect(
                myDAO.connect(voter1).withdraw(ethers.utils.parseEther("500"))
            ).to.be.reverted;

            expect(
                await myDAO.connect(voter1).withdraw(ethers.utils.parseEther("200"))
            ).to.satisfy;
            expect(
                await myDAO.connect(voter3).withdraw(ethers.utils.parseEther("200"))
            ).to.satisfy;
        });
    });
})