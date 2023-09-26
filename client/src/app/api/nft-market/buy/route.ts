import { mongoConnect } from '@/lib/mongo-connect';
import nft_maketplace, { INFTMarketplace } from '@/models/nft_maketplace';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		await mongoConnect();
		const data = await req.json();
		const nft: INFTMarketplace | null = await nft_maketplace
			.findOne({
				id: data.id,
			})
			.lean();
		if (!nft) throw new NextResponse('Data Not found', { status: 500 });
		const newData = await nft_maketplace.findOneAndUpdate(
			{ id: nft.id },
			{ $set: { price: '0', to: data.newAddress } },
			{ new: true }
		);
		return NextResponse.json({ result: newData }, { status: 200 });
	} catch (e) {
		throw new NextResponse('Error in fetching nft marketplace' + e, {
			status: 500,
		});
	}
}
