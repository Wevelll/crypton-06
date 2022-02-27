import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("setPropAdmin", "Set address as prop admin")
.addParam("address", "Address of new admin")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.setPropAdmin(
        taskArgs.address
        );
    console.log("OK");
});