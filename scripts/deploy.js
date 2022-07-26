const hre = require("hardhat");

async function main() {
  const Minter = await hre.ethers.getContractFactory("Minter");
  const minter = await Minter.deploy();
  await minter.deployed();
  console.log("Minter contract deployed to:", minter.address);
  storeContractData(minter, "Minter");

  const Seals = await hre.ethers.getContractFactory("Seals");
  const seals = await Seals.deploy(minter.address);
  await seals.deployed();
  console.log("Seals contract deployed to:", seals.address);
  storeContractData(seals, "Seals");
  
}

function storeContractData(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ [name]: contract.address }, undefined, 2)
  );

  const Artifacts = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(Artifacts, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
