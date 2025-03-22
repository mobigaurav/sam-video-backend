import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    try {
      const { sellerId, videoId, fileType, videoName } = JSON.parse(event.body);
  
      if (!sellerId || !videoId || !fileType) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields' }),
        };
      }
  
      const bucketName = process.env.VIDEO_BUCKET;
      const videoKey = `videos/${sellerId}/${videoId}.mp4`;
      const thumbnailKey = `thumbnails/${sellerId}/${videoId}.jpg`;
      const thumbnailUrl = `https://${bucketName}.s3.amazonaws.com/${thumbnailKey}`;
      // Generate pre-signed URL
      const videoCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: videoKey,
        ContentType: "video/mp4",
        Metadata: {
          videorecipename: videoName,
          thumbnailurl: thumbnailUrl,
        },
      });

      const thumbnailCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: thumbnailKey,
        ContentType: "image/jpeg",
      });
      
      console.log('Generating pre-signed URL for video upload');
      console.log("video COmmand", videoCommand);
      console.log("thumbnail Command", thumbnailCommand);
      
      const thumbnailUploadUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 2000 });
      const videoUploadUrl = await getSignedUrl(s3, videoCommand, { expiresIn: 2000 });

      return {
        statusCode: 200,
         body: JSON.stringify({
          videoUploadUrl,
          thumbnailUploadUrl,
          videoKey,
          thumbnailKey,
      }),
      };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to generate pre-signed URL' }),
      };
    }
  };
