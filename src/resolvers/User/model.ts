import { AppMetadata, User, UserMetadata } from "auth0";
import { z } from "zod";

import { ResolverDeps } from "../types.js";

export class UserModel {
  private constructor(private readonly entity: { id: string; name: string; displayName: string; icon: string }) {}

  public static async fromAuth0User({ logger }: Pick<ResolverDeps, "logger">, user: User<AppMetadata, UserMetadata>) {
    const parsed = z
      .object({
        user_id: z.string(),
        username: z.string(),
        nickname: z.string(),
        picture: z.string(),
      })
      .safeParse(user);
    if (!parsed.success) {
      logger.error({ payload: user, error: parsed.error }, "Payload of fetchd user from Auth0 is invalid");
      throw new Error("Invalid Auth0 user payload");
    }

    return new UserModel({
      id: parsed.data.user_id,
      name: parsed.data.username,
      displayName: parsed.data.nickname,
      icon: parsed.data.picture,
    });
  }

  public static async fromAuth0(
    { auth0Management, logger }: Pick<ResolverDeps, "auth0Management" | "logger">,
    userId: string
  ) {
    try {
      const auth0user = await auth0Management.getUser({ id: userId });
      const user = UserModel.fromAuth0User({ logger }, auth0user);
      return user;
    } catch (error) {
      logger.error({ error }, "Failed to fetch user from Auth0");
      throw new Error("Failed to fetch user from Auth0");
    }
  }

  get id() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get displayName() {
    return this.entity.displayName;
  }

  get icon() {
    return this.entity.icon;
  }
}
