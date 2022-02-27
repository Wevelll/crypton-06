import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("setDebateDuration", "Set default debate duration")
.addParam("duration", "New default duration")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.setDebateDuration(
        taskArgs.duration
        );
    console.log("OK");
});