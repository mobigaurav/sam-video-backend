// utils/db.mjs
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const queryTable = async (params) => {
  try {
    const result = await dynamodb.query(params).promise();
    return result.Items;
  } catch (err) {
    console.error('DynamoDB Query Error:', err);
    throw err;
  }
};

export const putItem = async (params) => {
  try {
    await dynamodb.put(params).promise();
  } catch (err) {
    console.error('DynamoDB Put Error:', err);
    throw err;
  }
};

export const deleteItem = async (params) => {
  try {
    await dynamodb.delete(params).promise();
  } catch (err) {
    console.error('DynamoDB Delete Error:', err);
    throw err;
  }
};
