import { ethers } from "hardhat";

async function main() {
  // Get the deployer's signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const PeerToPeerLending = await ethers.getContractFactory("PeerToPeerLending");

  // Deploy the contract
  const p2pLending = await PeerToPeerLending.deploy();

  // Wait for the deployment to be mined
  await p2pLending.deployed();

  console.log("PeerToPeerLending contract deployed to:", p2pLending.address);
}

// Execute the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
