import { GraphQLError } from "graphql";
import { GrpcClient } from "grpc/client.ts";
import { GrpcError } from "grpc/error.ts";
import { Authenticator } from "../proto/authenticator.d.ts";

export class SigninPayload {
  public accessToken;

  constructor({ accessToken }: { accessToken: string }) {
    this.accessToken = accessToken;
  }
}

export const signin = async (
  { name, password }: { name: string; password: string },
  { authenticator }: { authenticator: GrpcClient & Authenticator },
) => {
  try {
    const { accessToken } = { accessToken: "?" }; // await authenticator.Signin({ name, password });

    if (!accessToken) throw new GraphQLError("something wrong");

    return new SigninPayload({ accessToken });
  } catch (e) {
    if (e instanceof GrpcError) {
      switch (e.grpcCode) {
        default: {
          throw new GraphQLError("Something wrong");
        }
      }
    } else {
      throw new GraphQLError("Something wrong");
    }
  }
};
