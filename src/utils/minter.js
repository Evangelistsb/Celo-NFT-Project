import { create as ipfsHttpClient } from "ipfs-http-client";
import BigNumber from "bignumber.js";
import axios from "axios";

// initialize IPFS
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (contract, index) => {
  try {
    return await contract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

// mint an NFT
export const mintToken = async (
  contract,
  performActions,
  { name, description, ipfsImage, attributes }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      description,
      image: ipfsImage,
      createdBy: defaultAccount,
      attributes,
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);
      // IPFS url for uploaded metadata
      const uri = `https://ipfs.infura.io/ipfs/${added.path}`;
      // mint the NFT and save the IPFS url to the blockchain
      await contract.methods.safeMint(uri).send({ from: defaultAccount });
    } catch (error) {
      console.log("Error occured while minting NFT: ", error);
    }
  });
};

// fetch all my tokens
export const getMyTokens = async (contract) => {
  try {
    const res = await contract.methods.myNfts().call();
    const tokens = await Promise.all(
      res.map(async (tokenId) => {
        const tokenUri = await contract.methods.tokenURI(tokenId).call();
        const meta = await fetchNftMeta(tokenUri);
        return {
          tokenId: Number(tokenId),
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          attributes: meta.data.attributes,
        };
      })
    );    
    return tokens;
  } catch (e) {
    console.log(e);
  }
};

// fetch all NFTs on the smart contract
export const getActiveDeals = async (sealsContract, minterContract) => {
  try {
    const data = await sealsContract.methods.activeDeals().call();
    const deals = await Promise.all(
      data.map(async (deal) => {
        const tokenUri = await minterContract.methods
          .tokenURI(deal.tokenId)
          .call();
        const meta = await fetchNftMeta(tokenUri);
        return {
          dealId: deal.id,
          tokenId: deal.tokenId,
          createdBy: deal.createdBy,
          minBid: deal.minBid,
          highestBidder: deal.highestBidder,
          highestBid: deal.highestBid,
          bidsCount: deal.bidsCount,
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          attributes: meta.data.attributes,
        };
      })
    );
    return deals;
  } catch (e) {
    console.log(e);
  }
};

export const createDeal = async (
  performActions,
  minterContract,
  sealsContract,
  sealsAddress,
  tokenId,
  minBid
) => {
  await performActions(async (kit) => {
    const { defaultAccount } = kit;
    const _minBid = BigNumber(minBid).shiftedBy(18).toString();
    // first approve seals contract to use "tokenId"
    try {
      await minterContract.methods
        .approve(sealsAddress, tokenId)
        .send({ from: defaultAccount });
    } catch (e) {
      console.log(e);
    }
    // Create a deal with the "tokenId"
    try {
      const platformPrice = await sealsContract.methods.platformPrice().call();
      await sealsContract.methods
        .createDeal(tokenId, _minBid)
        .send({ from: defaultAccount, value: platformPrice });
    } catch (e) {
      console.log( e);
    }
  });
};

export const closeDeal = async (
  performActions,
  sealsContract,
  dealId,
  bidsCount
) => {
  if (bidsCount < 1) {
    alert("You must have atleast one bid before closing a deal");
    return;
  }
  // close a deal
  await performActions(async (kit) => {
    const { defaultAccount } = kit;
    try {
      await sealsContract.methods
        .closeDeal(dealId)
        .send({ from: defaultAccount });
    } catch (e) {
      console.log(e);
    }
  });
};

export const placeBid = async (
  performActions,
  sealsContract,
  dealId,
  highestBid,
  minBid,
  bidAmount
) => {
  await performActions(async (kit) => {
    const _value = BigNumber(bidAmount).shiftedBy(18).toString();
    const _minBid =
      highestBid == 0
        ? minBid
        : highestBid + Number(BigNumber(1).shiftedBy(18));
    if (bidAmount < _minBid) {
      alert(
        "Bid amount too low. It must be equal to the min bid or higher than the highest bid"
      );
      return;
    }
    const { defaultAccount } = kit; 
    try {
      await sealsContract.methods
        .placeBid(dealId)
        .send({
          from: defaultAccount,
          value: _value,
        });
    } catch (e) {
      console.log(e);
    }
  });
};
