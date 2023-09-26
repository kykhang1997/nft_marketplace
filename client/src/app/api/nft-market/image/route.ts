import { unlinkSync } from 'fs';
import { writeFile } from 'fs/promises';
import { NextResponse, NextRequest } from 'next/server';
import { File, NFTStorage } from 'nft.storage';
import path from 'path';

const client = new NFTStorage({ token: `${process.env.NFT_STORAGE_KEY}` });

export async function POST(req: NextRequest) {
	try {
		const form = await req.formData();
		const data: Record<string, any> = {};
		data.image = form.get('image');
		data.name = form.get('name');
		data.description = form.get('description');
		const buffer = Buffer.from(await data.image.arrayBuffer());
		const filename = data.image.name.replaceAll(' ', '_');
		await writeFile(
			path.join(process.cwd(), 'public/uploads/' + filename),
			buffer
		);

		const arraybuffer = Uint8Array.from(buffer).buffer;
		const blob = new File([arraybuffer], 'image', {
			type: 'image/*',
		});
		// Upload data to nft.storage
		const metadata = await client.store({
			name: data.name,
			description: data.description,
			image: blob,
		});

		// // Delete tmp image
		unlinkSync(process.cwd() + '/public/uploads/' + filename);
		return NextResponse.json({ uri: metadata.url }, { status: 201 });
	} catch (e) {
		console.log(e);
		return NextResponse.json(e, { status: 401 });
	}
}
