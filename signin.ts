import { getClient } from "grpc/client.ts";
import { GrpcError, Status } from "grpc/error.ts";
import { RouterMiddleware } from "oak/mod.ts";
import { z } from "zod/mod.ts";
import { Authenticator } from "./proto/authenticator.d.ts";

const protoPath = new URL("./proto/authenticator.proto", import.meta.url);
const protoFile = await Deno.readTextFile(protoPath);

const payloadSchema = z.object({ name: z.string(), password: z.string() });

export const routeSignin = (): RouterMiddleware<"/signin"> => async ({ request, response }) => {
  const payload = await request.body({ type: "json" }).value;
  const parsedPayload = payloadSchema.safeParse(payload);
  if (!parsedPayload.success) {
    response.status = 400;
    return;
  }

  const { name, password } = parsedPayload.data;
  const grpcClient = getClient<Authenticator>({
    port: 50051,
    root: protoFile,
    serviceName: "Authenticator",
  });

  try {
    const { accessToken } = await grpcClient.Signin({ name, password });
    response.body = { accessToken };
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
  } finally {
    grpcClient.close();
  }
};
