import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("withdraw", "Withdraw voting tokens from DAO")
.addParam("amount", "Amount of tokens to withdraw")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.withdraw(
        taskArgs.amount
        );
    console.log("OK");
});