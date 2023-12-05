import { PrismaClient } from "@prisma/client";
import type { AppMetadata, ManagementClient, User, UserMetadata } from "auth0";
import type { Redis } from "ioredis";
import type { Logger } from "pino";
import { z } from "zod";

import { UserDTO } from "./dto.js";

export class UserService {
  private constructor(
    private readonly prisma: PrismaClient,
    private readonly auth0Management: ManagementClient<AppMetadata, UserMetadata>,
    private readonly logger: Logger,
    private readonly redis: Redis,
    private readonly env: {
      editorRoleId: string;
      adminRoleId: string;
    },
  ) {}

  public static make({
    prisma,
    logger,
    redis,
    auth0Management,
    env,
  }: {
    prisma: PrismaClient;
    auth0Management: ManagementClient<AppMetadata, UserMetadata>;
    logger: Logger;
    redis: Redis;
    env: {
      editorRoleId: string;
      adminRoleId: string;
    };
  }) {
    return new UserService(prisma, auth0Management, logger, redis, env);
  }

  public async fromAuth0User(auth0user: User<AppMetadata, UserMetadata>) {
    const parsed = z
      .object({
        user_id: z.string(),
        username: z.string(),
        nickname: z.string(),
        picture: z.string(),
      })
      .safeParse(auth0user);
    if (!parsed.success) {
      this.logger.error({ payload: auth0user, error: parsed.error }, "Payload of fetchd user from Auth0 is invalid");
      throw new Error("Invalid Auth0 user payload");
    }

    await this.redis.setex(
      `auth0:${parsed.data.user_id}`,
      60 * 3,
      JSON.stringify({
        id: parsed.data.user_id,
        name: parsed.data.username,
        displayName: parsed.data.nickname,
        icon: parsed.data.picture,
      }),
    );

    const user = UserDTO.make({
      id: parsed.data.user_id,
      name: parsed.data.username,
      displayName: parsed.data.nickname,
      icon: parsed.data.picture,
    });

    await this.prisma.$transaction([
      this.prisma.user.upsert({
        where: { id: user.id },
        create: { id: user.id },
        update: {},
      }),
      this.prisma.mylist.upsert({
        where: { holderId_slug: { holderId: user.id, slug: "likes" } },
        create: { slug: "likes", title: `Favlist for ${user.name}`, holderId: user.id },
        update: {},
      }),
    ]);

    return user;
  }

  public async getById(userId: string): Promise<UserDTO> {
    const cached = await this.redis.get(`auth0:${userId}`);

    if (cached) {
      const parsedCached = z
        .object({ id: z.string(), name: z.string(), displayName: z.string(), icon: z.string() })
        .safeParse(JSON.parse(cached));

      if (parsedCached.success) return UserDTO.make(parsedCached.data);

      await this.redis.del(`auth0:${userId}`);
    }

    try {
      const auth0user = await this.auth0Management.getUser({ id: userId });
      const user = await this.fromAuth0User(auth0user);
      return user;
    } catch (error) {
      this.logger.error({ error, userId }, "Failed to fetch user from Auth0");
      throw new Error("Failed to fetch user from Auth0");
    }
  }

  public async findByName(name: string) {
    const auth0user = (await this.auth0Management.getUsers({ q: `username:"${name}"` })).at(0);
    if (!auth0user) {
      this.logger.info({ userName: name }, "User not found");
      return null;
    }
    return this.fromAuth0User(auth0user);
  }

  public async hasRole(userId: string, role: "EDITOR" | "ADMIN"): Promise<boolean> {
    try {
      switch (role) {
        case "EDITOR": {
          const cached = await this.redis.get(`auth0:${userId}:is-editor`);
          if (cached) return parseInt(cached, 10) === 1;
          break;
        }
        case "ADMIN": {
          const cached = await this.redis.get(`auth0:${userId}:is-admin`);
          if (cached) return parseInt(cached, 10) === 1;
          break;
        }
      }
    } catch (error) {
      this.logger.error({ error, userId, role }, "Failed to check role from redis");
    }
    try {
      const roles = await this.auth0Management.getUserRoles({ id: userId });

      const isEditor = roles.some(({ id }) => id === this.env.editorRoleId);
      await this.redis.setex(`auth0:${userId}:is-editor`, 60 * 3, isEditor ? 1 : 0);

      const isAdmin = roles.some(({ id }) => id === this.env.adminRoleId);
      await this.redis.setex(`auth0:${userId}:is-admin`, 60 * 3, isAdmin ? 1 : 0);

      this.logger.trace({ userId, want: role, isEditor, isAdmin, roles }, "Roles");
      switch (role) {
        case "EDITOR":
          return isEditor;
        case "ADMIN":
          return isAdmin;
      }
    } catch (error) {
      this.logger.error({ error, userId }, "Failed to fetch roles from Auth0");
      throw new Error("Failed to fetch user from Auth0");
    }
  }

  public async changeDisplayName(userId: string, renameTo: string): Promise<UserDTO> {
    try {
      const updated = await this.auth0Management.updateUser({ id: userId }, { nickname: renameTo });
      await this.redis.del(`auth0:${userId}`);
      return this.fromAuth0User(updated);
    } catch (error) {
      this.logger.error({ error, userId, renameTo }, "Failed to update user in Auth0");
      throw new Error("Failed to update user in Auth0");
    }
  }
}
