import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("vote", "Vote in proposal by id")
.addParam("id", "Proposal ID")
.addParam("supportAgainst", "true/false, pretty self-explanatory")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    const sa = taskArgs.supportAgainst == "true" ? true : false;
    await myDAO.vote(
        taskArgs.id, sa
        );
    console.log("OK");
});