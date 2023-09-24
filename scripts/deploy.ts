import { ethers } from 'hardhat';

async function main() {
	const currentTimestampInSeconds = Math.round(Date.now() / 1000);
	const unlockTime = currentTimestampInSeconds + 60;

	const lockedAmount = ethers.parseEther('0.001');

	const nftMarket = await ethers.deployContract('NFTMarket');

	await nftMarket.waitForDeployment();

	console.log(
		`NFTMarket with ${ethers.formatEther(
			lockedAmount
		)}ETH and unlock timestamp ${unlockTime} deployed to ${
			nftMarket.target
		}`
	);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
