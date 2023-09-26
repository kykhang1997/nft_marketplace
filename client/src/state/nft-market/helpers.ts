import { ethers } from 'ethers';
import { NFT } from './interface';

interface INFT {
	id: number;
	to: any;
	from: any;
	price: string;
	tokenURI: string;
}

export const parseRawNFT = (raw: INFT): NFT => {
	return {
		id: raw.id,
		owner: raw.price == '0' ? raw.to : raw.from,
		price: raw.price == '0' ? '0' : ethers.formatEther(raw.price),
		tokenURI: raw.tokenURI,
	};
};
