import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface INFTMarketplace {
	id: number;
	to: string;
	from: string;
	tokenURI: string;
	price: string;
}

const NFTMarketplaceSchema = new Schema(
	{
		id: {
			type: Number,
			default: 1,
			required: true,
			unique: true,
		},
		to: {
			type: String,
			required: true,
		},
		from: {
			type: String,
			required: true,
		},
		tokenURI: {
			type: String,
			required: true,
		},
		price: {
			type: String,
			default: '0',
		},
	},
	{ timestamps: true }
);

export default mongoose.models.NFTMarketplace ??
	mongoose.model('NFTMarketplace', NFTMarketplaceSchema);
