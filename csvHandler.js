import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import promiseCSV from "./promiseCSV";
import { S3 } from "aws-sdk";

export async function main(event, context) {
  console.log(JSON.stringify(event));
  const bucket = event['Records'][0]['s3']['bucket']['name'];
  const key = decodeURIComponent(event['Records'][0]['s3']['object']['key']);
  const s3Params = {
    Bucket: bucket,
    Key: key
  };
  const s3 = new S3();
  const s3Stream = s3.getObject(s3Params).createReadStream();
  const rows = await promiseCSV(s3Stream, {headers: true});
  console.log("After promiseCSV: ");
  console.log(rows);
  const userId = key.split('/')[1].split(':')[1];
  try {
    const dynamoPromises = [];
    for (const row of rows) {
      const record = {
        TableName: process.env.tableName,
        Item: {
          userId: userId,
          animalId: uuid.v1(),
          // sire: mergedMetrics[earId].sire,
          // dam: mergedMetrics[earId].dam,
          earId: row.earId,
          weight: row.weight,
          collectionTime: row.collectionTime
        }
      };
      dynamoPromises.push(dynamoDbLib.call("put", record));
      console.log(record);
    }
    await Promise.all(dynamoPromises);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}