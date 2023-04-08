import type { AppMetadata, ManagementClient, User, UserMetadata } from "auth0";
import type { Redis } from "ioredis";
import type { Logger } from "pino";
import { z } from "zod";

export class UserModel {
  private constructor(private readonly entity: { id: string; name: string; displayName: string; icon: string }) {}

  public static makeRepository({
    logger,
    redis,
    auth0Management,
  }: {
    auth0Management: ManagementClient<AppMetadata, UserMetadata>;
    logger: Logger;
    redis: Redis;
  }) {
    return {
      async getById(id: string) {
        return UserModel.getByIdFromAuth0({ logger, redis, auth0Management }, id);
      },
      async findByName(name: string) {
        return UserModel.findByNameFromAuth0({ logger, redis, auth0Management }, name);
      },
    };
  }

  private static async fromAuth0User(
    { logger, redis }: Pick<Parameters<(typeof UserModel)["makeRepository"]>[0], "logger" | "redis">,
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
    await redis.setex(`auth0:${user.id}`, 60 * 3, JSON.stringify(user.entity));
    return user;
  }

  private static async getByIdFromAuth0(
    {
      auth0Management,
      logger,
      redis,
    }: Pick<Parameters<(typeof UserModel)["makeRepository"]>[0], "auth0Management" | "logger" | "redis">,
    userId: string
  ) {
    const cached = await redis.get(`auth0:${userId}`);

    if (cached) {
      const parsedCached = z
        .object({ id: z.string(), name: z.string(), displayName: z.string(), icon: z.string() })
        .safeParse(JSON.parse(cached));

      if (parsedCached.success) return new UserModel(parsedCached.data);

      await redis.del(`auth0:${userId}`);
    }

    try {
      const auth0user = await auth0Management.getUser({ id: userId });
      const user = await UserModel.fromAuth0User({ logger, redis }, auth0user);
      return user;
    } catch (error) {
      logger.error({ error }, "Failed to fetch user from Auth0");
      throw new Error("Failed to fetch user from Auth0");
    }
  }

  private static async findByNameFromAuth0(
    {
      auth0Management,
      logger,
      redis,
    }: Pick<Parameters<(typeof UserModel)["makeRepository"]>[0], "auth0Management" | "logger" | "redis">,
    name: string
  ) {
    const auth0user = (await auth0Management.getUsers({ q: `username:"${name}"` })).at(0);
    if (!auth0user) {
      logger.info({ userName: name }, "User not found");
      return null;
    }
    return UserModel.fromAuth0User({ logger, redis }, auth0user);
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
