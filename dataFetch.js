import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  console.log(event);
  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'userId': Identity Pool identity id of the authenticated user
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId.split(':')[1],
      animalId: event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    console.log(result);
    // if (result.Item) {
    if (result) {
      // Return the retrieved item
      // return success(result.Item);
      return success(result);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
