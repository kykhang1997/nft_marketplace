import mongoose from 'mongoose';

export const mongoConnect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI as string, {});
		console.log('Mongo connect succeeful');
	} catch (e) {
		throw new Error('Error in connecting to mongodb');
	}
};
