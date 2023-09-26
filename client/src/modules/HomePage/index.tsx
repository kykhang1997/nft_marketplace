/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import NFTCard from '@/components/NFTCard';
import { useGlobalContext } from '@/state/global.context';
import { parseRawNFT } from '@/state/nft-market/helpers';
import { useEffect, useState } from 'react';

const HomePage = () => {
	const { address } = useGlobalContext();
	const [list, setList] = useState([]);

	const getData = async () => {
		try {
			const res = await fetch(`/api/nft-market?owner=${address}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			});
			const json = await res.json();
			const data = json.result.map(parseRawNFT);
			setList(data);
		} catch (error) {
			console.log('getData HomePage', error);
		}
	};

	useEffect(() => {
		address && getData();
	}, [address]);

	return (
		<div className="flex w-full flex-col">
			{/* TODO: display listed NFTs */}
			<div className="flex flex-wrap">
				{list?.map((nft, i) => (
					<NFTCard
						nft={nft}
						className="mr-2 mb-2"
						key={i}
						callback={getData}
					/>
				))}
			</div>
		</div>
	);
};

export default HomePage;
