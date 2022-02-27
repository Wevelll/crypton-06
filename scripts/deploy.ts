import { ethers } from "hardhat";
import { tokenAddr } from "../hardhat.config";

async function main() {
  const [me] = await ethers.getSigners();

  const votingFactory = await ethers.getContractFactory("VotingToken");
  const vt = await votingFactory.deploy();
  await vt.deployed();
  console.log("VT deployed to: ", vt.address);
  const DAOFactory = await ethers.getContractFactory("DAO");
  const DAO = await DAOFactory.deploy(
    me.address, vt.address, 500, 3600*24*3
  );

  await DAO.deployed();

  console.log("DAO deployed to:", DAO.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
