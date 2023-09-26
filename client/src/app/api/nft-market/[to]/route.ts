import { mongoConnect } from '@/lib/mongo-connect';
import nft_maketplace from '@/models/nft_maketplace';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	try {
		await mongoConnect();
		const slug = req.nextUrl;
		const to = slug.pathname.replace('/api/nft-market/', '') as string;
		const list = await nft_maketplace.find({ to }).lean();
		return NextResponse.json({ result: list }, { status: 200 });
	} catch (e) {
		throw new NextResponse('Error in fetching nft marketplace' + e, {
			status: 500,
		});
	}
}
