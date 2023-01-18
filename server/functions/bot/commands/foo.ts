import AWS from "aws-sdk";
import { Command } from "../runner";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

const sendMessageToClient = (url: string, connectionId: string, payload: any) =>
  new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
      // apiVersion: "2018-11-29",
      endpoint: url,
    });

    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId, // connectionId of the receiving ws-client
        Data: JSON.stringify(payload),
      },

      (err, data) => {
        if (err) {
          console.log("err is", err);
          reject(err);
        }

        resolve(data);
      }
    );
  });

export const foo: Command = {
  handler: async () => {
    const connectionIds = await model.entities.ConnectionEntity.scan
      .go()
      .then((e) => e.data.map((e) => e.connectionId));

    await Promise.all(
      connectionIds.map((connectionId) =>
        sendMessageToClient(
          "15hiut6zyb.execute-api.us-east-1.amazonaws.com/wgoettsch",
          connectionId,
          { message: "test test test" }
        )
      )
    );

    return genericResponse("bar");
  },
};
