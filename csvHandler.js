import * as dynamoDbLib from "./libs/dynamodb-lib";
import uuid from "uuid";
import promiseCSV from "./promiseCSV";

export async function main(event, context) {
  const bucket = event['Records'][0]['s3']['bucket']['name'];
  const key = event['Records'][0]['s3']['object']['key'];
  const s3Params = {
    Bucket: bucket,
    Key: key
  };
  const s3Stream = s3.getObject(s3Params).createReadStream();
  const mergedMetrics = await promiseCSV(s3Stream, {headers: true});
  try {
    let allDynamoParams = [];
    for (const earId in mergedMetrics) {
      allDynamoParams.push({
        TableName: 'farms',
        Item: {
          userId: event.requestContext.identity.cognitoIdentityId,
          animalId: uuid.v1(),
          earId: earId,
          sire: mergedMetrics[earId].sire,
          dam: mergedMetrics[earId].dam,
          weights: mergedMetrics[earId].weight,
          collectionTimes: mergedMetrics[earId].collectionTime
        }
      });
    }
    await dynamoDbLib.call("put", allDynamoParams);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}