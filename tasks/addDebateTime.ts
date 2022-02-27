import { task } from "hardhat/config";
import { DAOAddr } from "../hardhat.config";

task("addDebateTime", "Adds debate time to proposal if got permission")
.addParam("id", "Proposal ID")
.addParam("time", "Time in seconds")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.addDebateTime(taskArgs.id, taskArgs.time);
    console.log("OK");
});