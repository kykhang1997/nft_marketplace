/* eslint-disable @next/next/no-img-element */
import classNames from 'classnames';
import { BigNumberish, TransactionResponse, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { ipfsToHTTPS } from '../helpers';
import AddressAvatar from './AddressAvatar';
import SellPopup from './SellPopup';
import { NFT } from '@/state/nft-market/interface';
import { useGlobalContext } from '@/state/global.context';

type NFTMetadata = {
	name: string;
	description: string;
	imageURL: string;
};

type NFTCardProps = {
	nft: NFT;
	className?: string;
	callback?(): void;
};

const NFTCard = (props: NFTCardProps) => {
	let { nft, className, callback } = props;
	const { address, contract } = useGlobalContext();
	const [meta, setMeta] = useState<NFTMetadata>();
	const [loading, setLoading] = useState(false);
	const [sellPopupOpen, setSellPopupOpen] = useState(false);

	useEffect(() => {
		const fetchMetadata = async () => {
			const metadataResponse = await fetch(ipfsToHTTPS(nft.tokenURI));
			if (metadataResponse.status != 200) return;
			const json = await metadataResponse.json();
			setMeta({
				name: json.name,
				description: json.description,
				imageURL: ipfsToHTTPS(json.image),
			});
		};
		void fetchMetadata();
	}, [nft.tokenURI]);

	const onButtonClick = async () => {
		if (owned) {
			if (forSale) onCancelClicked();
			else setSellPopupOpen(true);
		} else {
			if (forSale) onBuyClicked();
			else {
				throw new Error(
					'onButtonClick called when NFT is not owned and is not listed, should never happen'
				);
			}
		}
	};

	const onBuyClicked = async () => {
		setLoading(true);
		try {
			const tx = await contract?.buyNFT(nft.id, {
				value: ethers.parseEther(nft.price),
			});
			const repceit = await tx.wait();
			console.log('onBuyClicked', tx, repceit);
			if (repceit) {
				const resp = await fetch('/api/nft-market/buy', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ ...nft, newAddress: address }),
				});
				if (resp.status === 200) {
					callback?.();
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const onCancelClicked = async () => {
		// TODO: cancel listing
	};

	const onSellConfirmed = async (price: BigNumberish) => {
		// TODO: list NFT
		setSellPopupOpen(false);
		setLoading(true);
		console.log('nft.id', nft.id, price);
		try {
			const transaction: TransactionResponse = await contract?.listNFT(
				nft.id.toString(),
				price
			);
			const repceit = await transaction.wait();
			if (repceit) {
				const data = { ...nft };
				data.price = price.toString();
				const resp = await fetch('/api/nft-market', {
					method: 'PUT',
					body: JSON.stringify(data),
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (resp.status === 200) {
					callback && callback();
				}
			}
		} catch (error) {
			console.log('onSellConfirmed', error);
		}
		setLoading(false);
	};

	const forSale = nft.price != '0';
	const owned = nft.owner?.toLowerCase() == address?.toLowerCase();

	return (
		<div
			className={classNames(
				'flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-xl border font-semibold shadow-sm',
				className
			)}
		>
			{meta ? (
				<img
					src={meta?.imageURL}
					alt={meta?.name}
					className="h-80 w-full object-cover object-center"
				/>
			) : (
				<div className="flex h-80 w-full items-center justify-center">
					loading...
				</div>
			)}
			<div className="flex flex-col p-4">
				<p className="text-lg">{meta?.name ?? '...'}</p>
				<span className="text-sm font-normal">
					{meta?.description ?? '...'}
				</span>
				<AddressAvatar address={nft.owner} />
			</div>
			<button
				className="group flex h-16 items-center justify-center bg-black text-lg font-semibold text-white"
				onClick={onButtonClick}
				disabled={loading}
			>
				{loading && 'Busy...'}
				{!loading && (
					<>
						{!forSale && 'SELL'}
						{forSale && owned && (
							<>
								<span className="group-hover:hidden">
									{nft.price} ETH
								</span>
								<span className="hidden group-hover:inline">
									CANCEL
								</span>
							</>
						)}
						{forSale && !owned && (
							<>
								<span className="group-hover:hidden">
									{nft.price} ETH
								</span>
								<span className="hidden group-hover:inline">
									BUY
								</span>
							</>
						)}
					</>
				)}
			</button>
			<SellPopup
				open={sellPopupOpen}
				onClose={() => setSellPopupOpen(false)}
				onSubmit={onSellConfirmed}
			/>
		</div>
	);
};

export default NFTCard;
