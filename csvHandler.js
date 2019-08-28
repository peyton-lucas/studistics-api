import * as dynamoDbLib from "./libs/dynamodb-lib";
import uuid;
const csv = require('fast-csv');
const fs = require('fs');

// Use earId to map weights + collectionTime
// a) Ignore redundant earIds from both [Item][userId] && [Item][earId]
// b) forEach earId, associate each weight + collectionTime w/ same earId

export async function main(event, context) {
  const bucket = event['Records'][0]['s3']['bucket']['name'];
  const key = event['Records'][0]['s3']['object']['key'];
  const s3Params = {
    Bucket: bucket,
    Key: key
  };
  const s3Stream = s3.getObject(s3Params).createReadStream();
  // const s3Stream = fs.createReadStream('/Users/plucas/sandbox/upload.csv');

  csv.parseStream(s3Stream, {headers: true})
    // Create an object w/ const to initiate the item creation process
    .on('error', error => console.error(error))
    .on('data', (data) => {
      console.log(data);
      let mergedMetrics = {};
      if(Object.keys(data).length > 0) {
        let idColumn = Object.keys(data)[0];
        if(!(data[idColumn] in mergedMetrics)) mergedMetrics[data[idColumn]] = {};
        for(key in data) {
          if(key !== idColumn) {
            if(!(key in mergedMetrics[data[idColumn]])) mergedMetrics[data[idColumn]][key] = [];
            mergedMetrics[data[idColumn]][key].push(data[key]);
          }
        }
      }
      const dynamoParams = {
        TableName: process.env.tableName,
        Item: {
          userId: event.requestContext.identity.cognitoIdentityId,
          animalId: uuid.v1(),
          species: data.species,
          earId: data.earId,
          scrapieId: data.scrapieId,
          dob: data.dob,
          birthType: data.birthType,
          rearedAs: data.rearedAs,
          bottleBaby: data.bottleBaby,
          onFarm: data.onFarm,
          comments: data.comments,
          sire: data.sire,
          dam: data.dam,
          weights: [data.weight],
          collectionTimes: [data.collectionTimes]
          attachment: data.attachment,
          createdAt: Date.now()
        }
      };

      try {
        await dynamoDbLib.call("put", dynamoParams);
        return success(dynamoParams.Item);
      } catch (e) {
        return failure({ status: false });
      }
    });
}
