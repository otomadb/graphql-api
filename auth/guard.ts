import { RouterMiddleware } from "oak/mod.ts";
import { GrpcError, Status } from "grpc/error.ts";
import { grpcClient } from "./grpc_client.ts";

export const guard = (): RouterMiddleware<"/signin"> => async ({ state, request, response }, next) => {
  const authHeader = request.headers.get("Authorization");
  const accessToken = authHeader?.split("Bearer ")?.[1];

  if (!accessToken) {
    response.status = 401;
    return;
  }

  try {
    const { userId } = await grpcClient.Validate({ accessToken });
    if (!userId) {
      response.status = 500;
      return;
    }

    state.userId = userId;

    await next();
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
    } else {
      response.status = 500;
      return;
    }
  }
};
