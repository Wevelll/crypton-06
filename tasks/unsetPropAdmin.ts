import { task } from "hardhat/config";
import { tokenAddr, DAOAddr } from "../hardhat.config";

task("unsetPropAdmin", "Remove address from prop admins")
.addParam("address", "Whom to unset")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const myDAO = await hre.ethers.getContractAt("DAO", DAOAddr);
    await myDAO.unsetPropAdmin(
        taskArgs.address
        );
    console.log("OK");
});