import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import promiseCSV from "./promiseCSV";
import { S3 } from "aws-sdk";

export async function main(event, context) {
  console.log(event);
  console.log(context);
  const bucket = event['Records'][0]['s3']['bucket']['name'];
  const key = decodeURIComponent(event['Records'][0]['s3']['object']['key']);
  const s3Params = {
    Bucket: bucket,
    Key: key
  };
  console.log(s3Params);
  const s3 = new S3();
  const s3Stream = s3.getObject(s3Params).createReadStream();
  const mergedMetrics = await promiseCSV(s3Stream, {headers: true});
  const userId = key.split('/')[1].split(':')[1];
  console.log(userId);

  // console.log(userId);
  // console.log("Before DynamoDB stuff n things");
  // let allDynamoParams = [];
  // for (const earId in mergedMetrics) {
  //   console.log("Inside for loop");
  //   allDynamoParams.push({
  //     TableName: process.env.tableName,
  //     Item: {
  //       userId: event['Records'][0]['userIdentity']['principalId'],
  //       animalId: uuid.v1(),
  //       earId: {
  //         sire: mergedMetrics[earId].sire,
  //         dam: mergedMetrics[earId].dam,
  //         weights: mergedMetrics[earId].weight,
  //         collectionTime: mergedMetrics[earId].collectionTime
  //       }
  //     }
  //   });
  // }
  // console.log("After allDynamoParams");
  // console.log("Before try / catch");
  try {
    console.log("Before DynamoDB stuff n things");
    for (const earId in mergedMetrics) {
      const record = {
        TableName: process.env.tableName,
        Item: {
          userId: userId,
          animalId: uuid.v1(),
          earId: {
            sire: mergedMetrics[earId].sire,
            dam: mergedMetrics[earId].dam,
            weights: mergedMetrics[earId].weight,
            collectionTime: mergedMetrics[earId].collectionTime
          }
        }
      };
      console.log(record);
      await dynamoDbLib.call("put", record);
    }
    console.log("After DynamoDB stuff n things");
    //await dynamoDbLib.call("put", allDynamoParams);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
    console.log('failure :(');
  }
  console.log("After try / catch");
}