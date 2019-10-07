import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import promiseCSV from "./promiseCSV";
import { S3 } from "aws-sdk";

export async function main(event, context) {
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
  console.log("Before try / catch");
  try {
    console.log("Before DynamoDB stuff n things");
    let allDynamoParams = [];
    for (const earId in mergedMetrics) {
      console.log("After for loop");
      allDynamoParams.push({
        TableName: process.env.tableName,
        Item: {
          userId: event.requestContext.identity.cognitoIdentityId,
          animalId: uuid.v1(),
          earId: {
            sire: mergedMetrics[earId].sire,
            dam: mergedMetrics[earId].dam,
            weights: mergedMetrics[earId].weight,
            collectionTime: mergedMetrics[earId].collectionTime
          }
        }
      });
      console.log("After allDynamoParams");
    }
    console.log("After DynamoDB stuff n things");
      // allDynamoParams.push({
      //   TableName: process.env.tableName,
      //   Item: {
      //     userId: event.requestContext.identity.cognitoIdentityId,
      //     animalId: uuid.v1(),
      //     earId: earId,
      //     sire: mergedMetrics[earId].sire,
      //     dam: mergedMetrics[earId].dam,
      //     weights: mergedMetrics[earId].weight,
      //     collectionTimes: mergedMetrics[earId].collectionTime
      //   }
      // });
    await dynamoDbLib.call("put", allDynamoParams);
    return success({ status: true });
    console.log("success!");
  } catch (e) {
    return failure({ status: false });
    console.log('failure :(');
  }
  console.log("After try / catch");
}