enum TAddressType {
  walletAddress,
  contractAddress,
}

export enum TTransactionStatus {
  Success = 'Success',
  fail = 'Fail',
}

export interface IToken {
  name: string;
  symbol: string;
  imageUrl: string;
}

export interface IAddress {
  name: string;
  address: string;
  addressType: TAddressType;
  isManager: false;
  isProducer: true;
}