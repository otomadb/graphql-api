import { GrpcError, Status } from "grpc/error.ts";
import { Database } from "mongo/mod.ts";
import { MongoError } from "mongo/src/error.ts";
import { RouterMiddleware } from "oak/mod.ts";
import { getUsersCollections } from "~/collections.ts";
import { grpcClient } from "./grpc_client.ts";

export const routeWhoAmI = (db: Database): RouterMiddleware<"/whoami"> => async ({ request, response }) => {
  const usersColl = getUsersCollections(db);

  const authHeader = request.headers.get("Authorization");
  const accessToken = authHeader?.split("Bearer ")?.[1];

  if (!accessToken) {
    response.status = 401;
    return;
  }

  try {
    const { userId: tokenUserId } = await grpcClient.Validate({ accessToken });
    if (!tokenUserId) {
      response.status = 500;
      return;
    }

    const dbUser = await usersColl.findOne({ _id: tokenUserId }, {
      projection: { "name": true, "display_name": true },
    });

    if (!dbUser) {
      response.status = 404;
      return;
    }
    const { name, display_name } = dbUser;
    response.body = { name, displayName: display_name };
    return;
  } catch (e) {
    if (e instanceof GrpcError) {
      switch (e.grpcCode) {
        case Status.UNAUTHENTICATED: {
          response.status = 401;
          response.body = e.grpcMessage;
          return;
        }
        case Status.NOT_FOUND: {
          response.status = 404;
          response.body = e.grpcMessage;
          return;
        }
        default: {
          response.status = 500;
          response.body = e.grpcMessage;
          return;
        }
      }
    } else if (e instanceof MongoError) {
      response.status = 500;
      return;
    } else {
      response.status = 500;
      return;
    }
  }
};
