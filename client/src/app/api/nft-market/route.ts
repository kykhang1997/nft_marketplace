import { mongoConnect } from '@/lib/mongo-connect';
import nft_maketplace from '@/models/nft_maketplace';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		await mongoConnect();
		let dataPost: Record<string, any> = (await req.json()) || {};
		const exitId = await nft_maketplace
			.find()
			.sort({ id: 'desc' })
			.limit(1)
			.lean();
		if (exitId.length > 0) {
			dataPost.id = exitId[0].id + 1;
		} else {
			dataPost.id = 1;
		}
		const newData = new nft_maketplace(dataPost);
		await newData.save();
		return NextResponse.json({ result: newData }, { status: 201 });
	} catch (e) {
		throw new NextResponse('Error in fetching nft marketplace' + e, {
			status: 500,
		});
	}
}

export async function PUT(req: NextRequest) {
	try {
		await mongoConnect();
		let dataPost: Record<string, any> = (await req.json()) || {};
		const exitId = await nft_maketplace
			.findOne({
				id: dataPost.id,
				to: dataPost.owner,
			})
			.lean();
		if (!exitId) throw new NextResponse('Data Not found', { status: 500 });
		const newData = await nft_maketplace
			.findOneAndUpdate(
				{
					id: dataPost.id,
					to: dataPost.owner,
				},
				{ $set: { price: dataPost.price } },
				{ new: true }
			)
			.lean();
		return NextResponse.json({ result: newData }, { status: 201 });
	} catch (e) {
		throw new NextResponse('Error in fetching nft marketplace' + e, {
			status: 500,
		});
	}
}

export async function GET(req: NextRequest) {
	try {
		await mongoConnect();
		const searchParam: any = req.nextUrl.searchParams;
		const data = await nft_maketplace
			.find({
				to: { $ne: searchParam.get('owner') },
				price: { $ne: '0' },
			})
			.lean();

		return NextResponse.json({ result: data }, { status: 200 });
	} catch (e) {
		throw new NextResponse('Error in fetching nft marketplace' + e, {
			status: 500,
		});
	}
}
