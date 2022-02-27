import { task } from "hardhat/config";
import { DAOAddr } from "../hardhat.config";

task("addProposal", "Create new proposal")
.addParam("callData", "Bytes of callData (encoded func sig with params)")
.addParam("recepient", "Receiver of the callData")
.addParam("desc", "Description of the proposal")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    const id = await myDAO.addProposal(
        taskArgs.callData, taskArgs.recepient, taskArgs.desc
    );
    console.log("Created proposal id: ", id);
});