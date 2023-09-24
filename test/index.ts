import { expect } from 'chai';
import { Contract, EventLog, ZeroAddress } from 'ethers';
import { ethers } from 'hardhat';
import { NFTMarket } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('NFTMarket', () => {
	let nftMarket: NFTMarket;
	let signers: SignerWithAddress[];

	before(async () => {
		// Deploy the NFTMarket contract
		nftMarket = await ethers.deployContract('NFTMarket');
		await nftMarket.waitForDeployment();
		signers = await ethers.getSigners();
	});

	const createNFT = async (tokenURI: string) => {
		const transaction = await nftMarket.createNFT(tokenURI);
		const receipt = await transaction.wait();
		const logs = receipt?.logs?.[0] as EventLog;
		const tokenID = logs.args[2];
		return tokenID;
	};

	const createAndListNFT = async (price: number) => {
		const tokenID = await createNFT('some token uri');
		const transaction = await nftMarket.listNFT(tokenID, price);
		const receipt = await transaction.wait();
		return { tokenID, receipt };
	};

	describe('createNFT', () => {
		it('Should do something', async () => {
			// Call the createNFT function
			const tokenURI = 'https://some-token.uri';
			const transaction = await nftMarket.createNFT(tokenURI);
			const receipt = await transaction.wait();
			const logs = receipt?.logs;
			const log0 = logs?.[0] as EventLog;
			const tokenID = log0.args[2]; // get tokenID

			// Assert that the newly created NFT's token uri is the same one sent to the createNFT function
			const mintedTokenURI = await nftMarket.tokenURI(tokenID);
			expect(mintedTokenURI).to.equal(tokenURI);

			// Assert that the owner of the newly createdNFT is the address that started the transaction
			const ownerAddress = await nftMarket.ownerOf(tokenID);
			const currentAddress = await signers[0].getAddress();
			expect(ownerAddress).to.equal(currentAddress);

			// Assert that NFTTransfer event has the correct args
			const log1 = logs?.[2] as EventLog;
			const args = log1?.args;
			expect(args[0]).to.equal(tokenID);
			expect(args[1]).to.equal(ZeroAddress);
			expect(args[2]).to.equal(ownerAddress);
			expect(args[3]).to.equal(tokenURI);
			expect(args[4]).to.equal(0);
		});
	});

	describe('listNFT', () => {
		const tokenURI = 'some token uri';
		it('should revert if price is zero', async () => {
			const tokenId = await createNFT(tokenURI);
			// const transaction = await nftMarket.listNFT(tokenId, 0);
			// await expect(transaction).to.be.revertedWith(
			// 	'NFTMarket: price must be greater than 0'
			// );
		});
		it('should revert if not called by the owner', async () => {
			const tokenId = await createNFT(tokenURI);
			// const transaction = await nftMarket
			// 	.connect(signers[1])
			// 	.listNFT(tokenId, 12);
			// await expect(transaction).to.be.revertedWith(
			// 	'ERC721: approve caller is not owner nor approved for all'
			// );
		});
		it('should list the token for sale if all requirements are met', async () => {
			const price = 123;
			const { tokenID, receipt } = await createAndListNFT(price);
			const logs = receipt?.logs?.[1] as EventLog;
			const args = logs?.args;
			expect(args[0]).to.equal(tokenID);
			expect(args[2]).to.equal(nftMarket.target);
			expect(args[3]).to.equal('');
			expect(args[4]).to.equal(price);
		});
	});

	describe('buyNFT', () => {
		it('should revert if NFT is not listed for sale', async () => {
			// const transaction = await nftMarket.buyNFT(999);
			// await expect(transaction).to.be.revertedWith(
			// 	'NFTMarket: NFT not listed for sale'
			// );
		});
		it('should revert if the amount of wei sent is not equal to the NFT price', async () => {
			const { tokenID } = await createAndListNFT(123);
			const transaction = nftMarket.buyNFT(tokenID, { value: 124 });
			await expect(transaction).to.be.revertedWith(
				'NFTMarket: incorrect price'
			);
		});
		it('should transfer ownership to the buyer and send the price to the seller', async () => {
			const price = 123;
			const sellerProfit = Math.floor((price * 95) / 100);
			const fee = price - sellerProfit;
			const initialContractBalance = await ethers.provider.getBalance(
				await nftMarket.getAddress()
			);
			const { tokenID } = await createAndListNFT(price);
			await new Promise((r) => setTimeout(r, 100));
			const oldSellerBalance = await ethers.provider.getBalance(
				signers[0].address
			);
			const transaction = await nftMarket
				.connect(signers[1])
				.buyNFT(tokenID, { value: price });
			const receipt = await transaction.wait();
			const logs = receipt?.logs as EventLog[];
			// 95% of the price was added to the seller balance
			await new Promise((r) => setTimeout(r, 100));
			const newSellerBalance = await signers[0].provider.getBalance(
				signers[0].address
			);
			const diff = newSellerBalance.sub(oldSellerBalance);
			expect(diff).to.equal(sellerProfit);
			// 5% of the price was kept in the contract balance
			const newContractBalance = await ethers.provider.getBalance(
				await nftMarket.getAddress()
			);
			const contractBalanceDiff =
				Number(newContractBalance) - Number(initialContractBalance);
			expect(contractBalanceDiff).to.equal(fee);
			// NFT ownership was transferred to the buyer
			const ownerAddress = await nftMarket.ownerOf(tokenID);
			expect(ownerAddress).to.equal(signers[1].address);
			// NFTTransfer event has the correct arguments
			const args = logs?.[2]?.args;
			expect(args.tokenID).to.equal(tokenID);
			expect(args.from).to.equal(await nftMarket.getAddress());
			expect(args.to).to.equal(signers[1].address);
			expect(args.tokenURI).to.equal('');
			expect(args.price).to.equal(0);
		});
	});
});
