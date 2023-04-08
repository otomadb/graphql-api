import { AppMetadata, User, UserMetadata } from "auth0";
import { z } from "zod";

import { ResolverDeps } from "../types.js";

export class UserModel {
  private constructor(private readonly entity: { id: string; name: string; displayName: string; icon: string }) {}

  public static async fromAuth0User(
    { logger, cache }: Pick<ResolverDeps, "logger" | "cache">,
    auth0user: User<AppMetadata, UserMetadata>
  ) {
    const parsed = z
      .object({
        user_id: z.string(),
        username: z.string(),
        nickname: z.string(),
        picture: z.string(),
      })
      .safeParse(auth0user);
    if (!parsed.success) {
      logger.error({ payload: auth0user, error: parsed.error }, "Payload of fetchd user from Auth0 is invalid");
      throw new Error("Invalid Auth0 user payload");
    }

    const user = new UserModel({
      id: parsed.data.user_id,
      name: parsed.data.username,
      displayName: parsed.data.nickname,
      icon: parsed.data.picture,
    });
    await cache.set(`auth0:${user.id}`, JSON.stringify(user.entity), { ttl: 60 * 10 });
    return user;
  }

  public static async fromAuth0(
    { auth0Management, logger, cache }: Pick<ResolverDeps, "auth0Management" | "logger" | "cache">,
    userId: string
  ) {
    const cached = await cache.get(`auth0:${userId}`);

    if (cached) {
      const parsedCached = z
        .object({ id: z.string(), name: z.string(), displayName: z.string(), icon: z.string() })
        .safeParse(JSON.parse(cached));

      if (parsedCached.success) return new UserModel(parsedCached.data);

      cache.delete(`auth0:${userId}`);
    }

    try {
      const auth0user = await auth0Management.getUser({ id: userId });
      const user = await UserModel.fromAuth0User({ logger, cache }, auth0user);
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
