import { Tag, TagEventType, TagNameEventType } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, ok, Result } from "../utils/Result.js";
import { TagDTO } from "./dto.js";

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    primaryName,
  }: {
    userId: string;
    primaryName: string;
  },
): Promise<Result<{ type: "UNKNOWN"; error: unknown }, Tag>> => {
  try {
    const tagId = ulid();

    const $names = [
      prisma.tagName.create({
        data: {
          id: ulid(),
          tagId,
          name: primaryName,
          isPrimary: true,
          events: {
            createMany: {
              data: [
                { userId, type: TagNameEventType.CREATE, payload: {} },
                { userId, type: TagNameEventType.SET_PRIMARY, payload: {} },
              ],
            },
          },
        },
      }),
    ];

    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          isCategoryTag: true,
          events: {
            create: {
              userId,
              type: TagEventType.REGISTER,
              payload: {},
            },
          },
        },
      }),
      ...$names,
    ]);
    return ok(tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};

export const registerCategoryTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
    const result = await register(prisma, {
      userId: user.id,
      primaryName: input.primaryName,
    });

    if (result.status === "error") {
      switch (result.error.type) {
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          throw new GraphQLError("Internal server error");
      }
    }

    const tag = result.data;

    return {
      __typename: "RegisterCategoryTagSucceededPayload",
      tag: new TagDTO(tag),
    } satisfies ResolversTypes["RegisterCategoryTagSucceededPayload"];
  }) satisfies MutationResolvers["registerCategoryTag"];
