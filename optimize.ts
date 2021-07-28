import * as AWS from 'aws-sdk';
import sharp from 'sharp';
import { basename, extname} from 'path';

const S3 = new AWS.S3();

export const handler = async ({ Records: records }) => {
	try {
		await Promise.all(
			records.map(async record => {
				const { key } = record.s3.object;

				const image = await S3.getObject({
					Bucket: 'davi-007-storage',
					Key: key,
				}).promise();

				const optimized = await sharp(image.Body)
					.resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
					.toFormat('jpeg', { progressive: true, quality: 50 })
					.toBuffer();

				await S3.putObject({
					Body: optimized,
					Bucket: 'davi-007-storage',
					ContentType: 'image/jpeg',
					Key: `compressed/${basename(key, extname(key))}.jpg`,
				}).promise();
			})
		);

		return {
			statusCode: 301,
			body: { ok: true },
		};
	} catch (err) {
		return err;
	}
};
