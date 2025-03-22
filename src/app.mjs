import { handler as getVideoHandler } from './handlers/getVideo.mjs';
import { handler as getPreSignedUrlHandler } from './handlers/getPreSignedUrl.mjs';
import { handler as deleteVideoHandler } from './handlers/deleteVideo.mjs';
import { handler as processVideoHandler } from './handlers/processVideo.mjs';

export const handler = async (event) => {
  console.log('Received Event:', JSON.stringify(event, null, 2));

  const { httpMethod, path } = event;

  try {
    if (httpMethod === 'GET' && path === '/videos') {
      return await getVideoHandler(event);
    } else if (httpMethod === 'POST' && path === '/presigned-url') {
      return await getPreSignedUrlHandler(event);
    } else if (httpMethod === 'DELETE' && path.startsWith('/videos')) {
      return await deleteVideoHandler(event);
    } else if (event.Records && event.Records[0].eventSource === 'aws:s3') {
      // This is an S3 event triggered when a new video is uploaded
      return await processVideoHandler(event);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request' }),
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
