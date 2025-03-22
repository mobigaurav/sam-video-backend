import { queryTable } from '../utils/db.mjs';
import { getSignedUrl } from '../utils/s3.mjs';

const BUCKET_NAME = process.env.VIDEO_BUCKET;
const BUCKET_NAME_THUMB = process.env.THUMBNAIL_BUCKET;

export const handler = async (event) => {
  console.log('Received Event:', JSON.stringify(event, null, 2));

  // Validate input
  const sellerId = event.queryStringParameters?.sellerId;
  if (!sellerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'SellerId is required' }),
    };
  }

  // Query DynamoDB for videos
  const params = {
    TableName: 'VideoTable',
    KeyConditionExpression: 'SellerId = :sellerId',
    ExpressionAttributeValues: {
      ':sellerId': sellerId,
    },
  };

  console.log('Executing DynamoDB query with params:', params);

  try {
    const videos = await queryTable(params);

    for (const video of videos) {
      // Get pre-signed URLs for video and thumbnail
      if (video.objectKey) {
        video.videoUrl = await getSignedUrl(BUCKET_NAME, video.objectKey, 300);
      } else {
        console.warn(`No objectKey found for videoId: ${video.VideoId}`);
        video.videoUrl = null;
      }

      // Check if thumbnailKey exists before fetching signed URL
      if (video.thumbnailKey) {
        video.thumbnailUrl = await getSignedUrl(BUCKET_NAME_THUMB, video.thumbnailKey, 300);
      } else {
        console.warn(`No thumbnailKey found for videoId: ${video.VideoId}`);
        video.thumbnailUrl = null;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve videos' }),
    };
  }
};

