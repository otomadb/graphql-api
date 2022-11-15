import { GrpcError, Status } from "grpc/error.ts";
import { RouterMiddleware } from "oak/mod.ts";

import { grpcClient } from "./grpc_client.ts";

export const routeWhoAmI = (): RouterMiddleware<"/whoami"> => async ({ request, response }) => {
  const authHeader = request.headers.get("Authorization");
  const accessToken = authHeader?.split("Bearer ")?.[1];

  if (!accessToken) {
    response.status = 401;
    return;
  }

  try {
    const { userId } = await grpcClient.Validate({ accessToken });
    response.body = { userId };
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
    } else {
      response.status = 500;
      return;
    }
  }
};
