/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { toastEr, toastSuc } from '@/helpers';
import { Contract, JsonRpcSigner, ethers } from 'ethers';
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react';
import Web3Modal from 'web3modal';
import NFTMarket from '../../../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

type TGlobalContext = {
	signer?: JsonRpcSigner;
	address?: string;
	loading?: boolean;
	contract?: Contract;

	connectWallet: () => Promise<void>;
};

const GlobalContext = createContext<TGlobalContext>({} as any);

export const useGlobalContext = () => useContext(GlobalContext);

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

export const GlobalContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [signer, setSigner] = useState<JsonRpcSigner>();
	const [address, setAddress] = useState<string>();
	const [loading, setLoading] = useState<boolean>(false);
	const [contract, setContract] = useState<Contract>();

	const connectWallet = async () => {
		setLoading(true);
		try {
			const web3modal = new Web3Modal({ cacheProvider: true });
			const instantice = await web3modal.connect();
			const provider = new ethers.BrowserProvider(instantice);
			const signer = await provider.getSigner();
			const address = await signer.getAddress();
			const contract = new Contract(
				contractAddress,
				NFTMarket.abi,
				signer
			);
			setSigner(signer);
			setAddress(address);
			setContract(contract);
			toastSuc(`${address?.substring(0, 10)} login success`);
		} catch (error) {
			console.log('error', error);
			toastEr('Please login account MetaMask');
		}
		setLoading(false);
	};

	useEffect(() => {
		const web3modal = new Web3Modal();
		if (web3modal.cachedProvider && !signer) {
			connectWallet();
		}
		window.ethereum.on('accountsChanged', connectWallet);
	}, []);

	const valueContext = { signer, address, loading, connectWallet, contract };

	return (
		<GlobalContext.Provider value={valueContext}>
			{children}
		</GlobalContext.Provider>
	);
};
