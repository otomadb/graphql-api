import { getClient } from "grpc/client.ts";
import { Authenticator } from "~/proto/authenticator.d.ts";
import { authenticatorProtoFile } from "~/proto/protos.ts";

export const grpcClient = getClient<Authenticator>({
  port: 50051,
  root: authenticatorProtoFile,
  serviceName: "Authenticator",
});
