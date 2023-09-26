'use client';
import classNames from 'classnames';
import CreationForm, { CreationValues } from './CreationForm';
import { useGlobalContext } from '@/state/global.context';
import { TransactionResponse } from 'ethers';
import { toastSuc } from '@/helpers';

const CreationPage = () => {
	const { signer, contract } = useGlobalContext();

	const onSubmit = async (values: CreationValues) => {
		console.log('value', values);
		const data = new FormData();
		data.append('name', values.name);
		data.append('image', values.image!);
		data.append('description', values.description);
		try {
			const response = await fetch(`/api/nft-market/image`, {
				method: 'POST',
				body: data,
			});
			if (response.status == 201) {
				const json = await response.json();
				const transaction: TransactionResponse =
					await contract?.createNFT(json.uri);
				const rep = await transaction.wait();
				console.log('json', rep, ' - ', transaction);
				const dataPost = {
					tokenURI: json.uri,
					from: rep?.to,
					to: rep?.from,
				};
				const respCreate = await fetch('/api/nft-market', {
					method: 'POST',
					body: JSON.stringify(dataPost),
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (respCreate.status == 201) {
					toastSuc('Creatting success!');
				}
			}
		} catch (e) {
			console.log('onSubmit', e);
		}
	};

	return (
		<div
			className={classNames('flex h-full w-full flex-col', {
				'items-center justify-center': !signer,
			})}
		>
			{signer ? (
				<CreationForm onSubmit={onSubmit} />
			) : (
				'Connect your wallet'
			)}
		</div>
	);
};

export default CreationPage;
