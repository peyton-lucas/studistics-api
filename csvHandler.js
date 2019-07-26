import * as dynamoDbLib from "./libs/dynamodb-lib";
import uuid;
const csv = require('fast-csv');

export async function main(event, context) {
  const bucket = event['Records'][0]['s3']['bucket']['name'];
  const key = event['Records'][0]['s3']['object']['key'];
  const s3Params = {
    Bucket: bucket,
    Key: key
  };
  const s3Stream = s3.getObject(s3Params).createReadStream();

  csv.fromStream(s3Stream, {headers: true})
    .on('data', (data) => {
        TableName: process.env.tableName,
        Item: {
          userId: event.requestContext.identity.cognitoIdentityId,
          animalId: uuid.v1(),
          species: species,
          earId: ear_id,
          scrapieId: scrapie_id,
          dob: dob,
          birthType: birth_type,
          rearedAs: reared_as,
          bottleBaby: bottle_baby,
          onFarm: on_farm,
          comments: comments,
          sire: sire,
          dam: dam,
          weights: [{
            weight: integer,
            collectionTime: timestamp
          },
          {
            weight: integer,
            collectionTime: timestamp
          },
          {
            weight: integer,
            collectionTime: timestamp
          }],
          attachment: data.attachment,
          createdAt: Date.now()
        }
      };

      try {
        await dynamoDbLib.call("put", dynamoParams);
        return success(dynamoParams.Item);
      } catch (e) {
        // Further console.log what is broken, why and how to fix it
        return failure({ status: false });
      }
    });
}
