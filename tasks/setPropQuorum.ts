import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("setPropQuorum", "Set minimum quorum for proposal")
.addParam("id", "ID of proposal")
.addParam("quorum", "New value")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.setPropQuorum(
        taskArgs.id, taskArgs.quorum
        );
    console.log("OK");
});