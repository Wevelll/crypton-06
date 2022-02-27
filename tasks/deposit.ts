import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("deposit", "Deposit votingTokens to DAO contract")
.addParam("amount", "Amount of tokens to deposit")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    const votingToken = await hre.ethers.getContractAt("VotingToken", tokenAddr);
    await votingToken.approve(myDAO.address, taskArgs.amount);
    await myDAO.deposit(taskArgs.amount);
    console.log("OK");
});