import AWS from 'aws-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const execPromise = promisify(exec);
const VIDEO_BUCKET = process.env.VIDEO_BUCKET;
const VIDEO_TABLE = process.env.VIDEO_TABLE;
const FFMPEG_PATH = '/opt/bin/ffmpeg';

export const handler = async (event) => {
  try {
    console.log('Processing S3 Event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      let s3Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
      const s3Bucket = record.s3.bucket.name;

      const pathParts = s3Key.split('/');
      if (pathParts.length < 3) {
        console.error('Invalid S3 key format:', s3Key);
        continue;
      }

      const sellerId = pathParts[1];
      const videoId = pathParts[2].split('.')[0];

      const tempInputFile = `/tmp/input-video`;
      const tempOutputFile = `/tmp/output-video.mp4`;

      const metadata = await s3.headObject({ Bucket: s3Bucket, Key: s3Key }).promise();
      console.log('Metadata:', metadata);
      const videoRecipeName = metadata.Metadata?.videorecipename || 'Unknown Recipe';
      const thumbnailUrl = metadata.Metadata?.thumbnailurl || null;

      console.log("video recipe", videoRecipeName, thumbnailUrl);

      // **Download the original video from S3**
      const s3Object = await s3.getObject({ Bucket: s3Bucket, Key: s3Key }).promise();
      fs.writeFileSync(tempInputFile, s3Object.Body);

      const { stdout } = await execPromise('/opt/bin/ffmpeg -version');
      console.log('FFmpeg version:', stdout);

      // **Convert video to MP4 using FFmpeg**
      console.log("Converting video to MP4...");
      await execPromise(`${FFMPEG_PATH} -i ${tempInputFile} -c:v libx264 -preset fast -c:a aac ${tempOutputFile}`);

      // **Upload the converted video back to S3**
      const convertedKey = `videos/${sellerId}/${videoId}.mp4`;
      await s3.putObject({
        Bucket: VIDEO_BUCKET,
        Key: convertedKey,
        Body: fs.readFileSync(tempOutputFile),
        ContentType: 'video/mp4',
        Metadata: { originalKey: s3Key }
      }).promise();

      console.log("Uploaded converted video:", convertedKey);

      // **Store metadata in DynamoDB**
      const params = {
        TableName: VIDEO_TABLE,
        Item: {
          SellerId: sellerId,
          VideoId: videoId,
          VideoRecipeName: videoRecipeName,
          videoUrl: `https://${VIDEO_BUCKET}.s3.amazonaws.com/${convertedKey}`,
          objectKey: convertedKey,
          originalFormat: s3Key.split('.').pop(),
          thumbnailUrl: thumbnailUrl,
          likeCount: 0,
          videoViews: 0,
          timestamp: Date.now(),
        },
      };

      await dynamodb.put(params).promise();
      console.log('Successfully saved metadata:', params.Item);

      // Clean up temp files
      fs.unlinkSync(tempInputFile);
      fs.unlinkSync(tempOutputFile);
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Processing complete' }) };
  } catch (error) {
    console.error('Error processing video:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to process video' }) };
  }
};