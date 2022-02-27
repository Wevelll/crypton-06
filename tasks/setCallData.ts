import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("setCallData", "Finish proposal with id")
.addParam("id", "ID of proposal")
.addParam("recepient", "Address where call data to be called")
.addParam("callData", "New call data")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.setCallData(
        taskArgs.id, taskArgs.recepient, 
        taskArgs.callData
        );
    console.log("OK");
});