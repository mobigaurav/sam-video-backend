// utils/s3.mjs
import AWS from 'aws-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const s3 = new AWS.S3();

export const uploadFile = async (Bucket, Key, Body) => {
  try {
    const params = { Bucket, Key, Body };
    await s3.upload(params).promise();
  } catch (err) {
    console.error('S3 Upload Error:', err);
    throw err;
  }
};

export const getSignedUrl = async (Bucket, Key, Expires = 3600) => {
  try {
    const params = { Bucket, Key, Expires };
    return s3.getSignedUrlPromise('getObject', params);
  } catch (err) {
    console.error('S3 Signed URL Error:', err);
    throw err;
  }
};

export const deleteFile = async (Bucket, Key) => {
  try {
    const params = { Bucket, Key };
    await s3.deleteObject(params).promise();
  } catch (err) {
    console.error('S3 Delete Error:', err);
    throw err;
  }
};
