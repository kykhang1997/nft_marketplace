'use client';
import { gql, useQuery } from '@apollo/client';
import { useGlobalContext } from '../global.context';
import {
	GetOwnedNFTs,
	GetOwnedNFTsVariables,
} from './__generated__/GetOwnedNFTs';
import { parseRawNFT } from './helpers';

export const useOwnedNFTs = async () => {
	try {
	} catch (e) {}
};

export const GET_OWNED_NFTS = gql`
	query GetOwnedNFTs($owner: String!) {
		nfts(where: { to: $owner }) {
			id
			from
			to
			tokenURI
			price
		}
	}
`;
