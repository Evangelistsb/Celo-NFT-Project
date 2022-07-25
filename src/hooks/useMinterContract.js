import { useContract } from "./useContract";
import Minter from "../contracts/Minter.json";
import MinterAddress from "../contracts/Minter-address.json";

// export interface for NFT contract
export const useMinterContract = () =>
  useContract(Minter.abi, MinterAddress.Minter);
