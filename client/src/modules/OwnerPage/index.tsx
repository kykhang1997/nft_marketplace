/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import NFTCard from '@/components/NFTCard';
import { useGlobalContext } from '@/state/global.context';
import { parseRawNFT } from '@/state/nft-market/helpers';
import { useEffect, useState } from 'react';

const OwnedPage = () => {
	const { address } = useGlobalContext();

	const [ownedNFTs, setOwnedNFTs] = useState<any>([]);
	const [ownedListedNFTs, setOwnedListedNFTs] = useState<any>([]);

	const getData = async () => {
		try {
			const resp = await fetch(`/api/nft-market/${address}`);
			if (resp.status === 200) {
				const json = await resp.json();
				const data = json.result.map(parseRawNFT);
				const dataOwner = [];
				const dataList = [];
				for (const nft of data) {
					if (nft.owner == address) {
						dataOwner.push(nft);
					} else {
						dataList.push(nft);
					}
				}
				setOwnedNFTs(dataOwner);
				setOwnedListedNFTs(dataList);
			}
		} catch (e) {
			console.log('getData OwnedPage', e);
		}
	};

	useEffect(() => {
		if (address) {
			getData();
		}
	}, [address]);

	return (
		<div className="flex w-full flex-col">
			{/* Display owned (listed or not) NFTs */}
			<div className="flex flex-wrap">
				{ownedNFTs?.map((nft: any, i: number) => (
					<NFTCard nft={nft} key={i} className="ml-2" />
				))}
			</div>
			{/* Divider, only shown if there are owned listed NFTs*/}
			{ownedListedNFTs && ownedListedNFTs.length > 0 && (
				<div className="relative my-2 h-[1px] w-full flex-shrink-0 bg-black">
					<div className="absolute right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2 transform bg-white px-2 font-mono font-semibold">
						LISTED
					</div>
				</div>
			)}
			{/* Owned Listed NFTs*/}
			<div className="flex flex-wrap">
				{ownedListedNFTs?.map((nft: any, i: number) => {
					return (
						<NFTCard
							nft={nft}
							className="mr-2 mb-2"
							key={i + nft.id}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default OwnedPage;
