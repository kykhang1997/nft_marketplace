'use client';
import OwnedPage from '@/modules/OwnerPage';
import { useOwnedNFTs } from '@/state/nft-market/useOwnedNFTs';
import type { NextPage } from 'next';

const Owned: NextPage = () => {
	return <OwnedPage />;
};

export default Owned;
