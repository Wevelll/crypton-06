import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("finisgProposal", "Finish proposal with id")
.addParam("id", "ID of proposal")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.finishProposal(taskArgs.id);
    console.log("OK");
});