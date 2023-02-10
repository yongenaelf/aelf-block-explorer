/**
 * @file addressFormat
 */
import { SYMBOL, CHAIN_ID } from "../../config/config";

export default function addressFormat(address, prefix, chainId) {
  if (!address) return "";
  return `${prefix || SYMBOL}_${address}_${chainId || CHAIN_ID}`;
}
export const getOriginAddress = (address) => {
  if (address.indexOf("_") > -1) {
    return address.split("_")[1];
  }
  return address;
};
