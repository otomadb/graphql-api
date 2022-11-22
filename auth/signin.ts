import { compare as compareBCrypt } from "bcrypt/mod.ts";
import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getAccountsCollection } from "~/common/collections.ts";
import { signAccessJWT, signRefreshJWT } from "./jwt.ts";
import { getUserById } from "~/users/mod.ts";

export class SigninPayload {
  protected accessToken;
  protected refreshToken;
  private userId;

  constructor({ accessToken, refreshToken, userId }: { accessToken: string; refreshToken: string; userId: string }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
  }

  user(_: unknown, ctx: { mongo: MongoClient }) {
    return getUserById(this.userId, ctx);
  }
}

export const signin = async (
  { input: { name, password } }: { input: { name: string; password: string } },
  context: { mongo: MongoClient },
) => {
  const accountsColl = await getAccountsCollection(context.mongo);
  const account = await accountsColl.findOne({ name: name });
  if (!account) {
    throw new GraphQLError("Not found user");
  }

  // TODO: email confirm check

  if (!await compareBCrypt(password, account.password)) {
    throw new GraphQLError("Not matched password");
  }

  const accessToken = await signAccessJWT({
    userId: account.user_id,
  });
  const refreshToken = await signRefreshJWT({
    userId: account.user_id,
  });

  return new SigninPayload({
    accessToken: accessToken,
    refreshToken: refreshToken,
    userId: account.user_id,
  });
};
