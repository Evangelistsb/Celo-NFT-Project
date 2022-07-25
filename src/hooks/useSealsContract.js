import { useContract } from "./useContract";
import Seals from "../contracts/Seals.json";
import SealsAddress from "../contracts/Seals-address.json";

// export interface for NFT contract
export const useSealsContract = () =>
  useContract(Seals.abi, SealsAddress.Seals);
