const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Minter", function () {
  this.timeout(50000);

  let minter;
  let owner;
  let acc1;
  let acc2;
  let contractAddress;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    const Minter = await ethers.getContractFactory("Minter");
    [owner, acc1, acc2] = await ethers.getSigners();

    minter = await Minter.deploy();
    await minter.deployed();
    contractAddress = minter.address;
  });

  it("Should set the right owner", async function () {
    expect(await minter.owner()).to.equal(owner.address);
  });

  it("Should mint one NFT", async function () {
    expect(await minter.balanceOf(owner.address)).to.equal(0);    
    const tokenURI = "https://example.com";
    const tx = await minter.connect(owner).safeMint(tokenURI);
    await tx.wait();

    expect(await minter.balanceOf(owner.address)).to.equal(1);
  });

  it("Should set the correct tokenURI", async function () {
    const tokenURI_1 = "https://example.com/1";
    const tokenURI_2 = "https://example.com/2";

    const tx1 = await minter.connect(owner).safeMint(tokenURI_1);
    await tx1.wait();
    const tx2 = await minter.connect(owner).safeMint(tokenURI_2);
    await tx2.wait();

    expect(await minter.tokenURI(0)).to.equal(tokenURI_1);
    expect(await minter.tokenURI(1)).to.equal(tokenURI_2);
  });
});
