import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const PeerToPeerLending = await ethers.getContractFactory("PeerToPeerLending");
 
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);

  let p2pLending;

  if (network.chainId === 1337) {
    console.log("Network is ganache")
    p2pLending = await PeerToPeerLending.deploy({
      gasLimit: 5000000, 
    });
  } else if (network.name === "sepolia") {
    p2pLending = await PeerToPeerLending.deploy({
      gasPrice: ethers.utils.parseUnits('20', 'gwei'),  
      gasLimit: 5000000, 
    });
  } else {
    throw new Error("Unsupported network");
  }

  await p2pLending.deployed();

  console.log("PeerToPeerLending contract deployed to:", p2pLending.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });