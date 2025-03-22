// handlers/deleteVideo.mjs
import { deleteItem } from '../utils/db.mjs';
import { deleteFile } from '../utils/s3.mjs';
const BUCKET_NAME = 'foodvideobucketnew'

export const handler = async (event) => {
  console.log('Received Event for delete:', JSON.stringify(event, null, 2));
  const { SellerId, VideoId } = JSON.parse(event.body);

  if (!SellerId || !VideoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  const videoKey = `videos/${SellerId}/${VideoId}.mp4`;

  try {
    await deleteFile(BUCKET_NAME, videoKey);
    await deleteItem({
      TableName: 'VideoTable',
      Key: { SellerId: SellerId, VideoId: VideoId },
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Video deleted successfully' }),
    };
  } catch (err) {
    console.error('Error deleting video:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete video' }),
    };
  }
};
