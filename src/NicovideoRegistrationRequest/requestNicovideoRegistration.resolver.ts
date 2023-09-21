import { NicovideoRegistrationRequest, NicovideoVideoSource } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { NicovideoVideoSourceDTO } from "../NicovideoVideoSource/dto.js";
import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID2 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { NicovideoRegistrationRequestDTO } from "./dto.js";

export const requestRegistration = async (
  prisma: ResolverDeps["prisma"],
  {
    title,
    thumbnailUrl,
    userId,
    sourceId,
    taggings,
    semitaggings,
  }: {
    title: string;
    sourceId: string;
    thumbnailUrl: string;
    userId: string;
    taggings: { tagId: string; note: string | null }[];
    semitaggings: { name: string; note: string | null }[];
  },
): Promise<
  Result<
    | { message: "TAG_NOT_FOUND"; tagId: string }
    | { message: "VIDEO_ALREADY_REGISTERED"; source: NicovideoVideoSource }
    | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
    NicovideoRegistrationRequest
  >
> => {
  try {
    for (const { tagId: id } of taggings) {
      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) return err({ message: "TAG_NOT_FOUND", tagId: id });
    }

    const videoSource = await prisma.nicovideoVideoSource.findUnique({ where: { sourceId } });
    if (videoSource) {
      return err({ message: "VIDEO_ALREADY_REGISTERED", source: videoSource });
    }

    const request = await prisma.nicovideoRegistrationRequest.create({
      data: {
        id: ulid(),
        title,
        thumbnailUrl,
        sourceId,
        requestedById: userId,
        isChecked: false,
        taggings: {
          createMany: {
            data: taggings.map(({ tagId, note }) => ({
              id: ulid(),
              tagId,
              note,
            })),
          },
        },
        semitaggings: {
          createMany: {
            data: semitaggings.map(({ name, note }) => ({
              id: ulid(),
              name,
              note,
            })),
          },
        },
        events: { create: { userId, type: "ACCEPT" } },
      },
    });

    return ok(request);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};

export const resolverRequestNicovideoRegistration = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (
    _,
    { input: { title, thumbnailUrl, sourceId, taggings: gqlTaggings, semitaggings } },
    { currentUser: user },
    info,
  ) => {
    const taggings: { tagId: string; note: string | null }[] = [];
    for (const { tagId, note } of gqlTaggings) {
      const parsed = parseGqlID2("Tag", tagId);
      if (isErr(parsed)) {
        return {
          __typename: "MutationInvalidTagIdError",
          tagId,
        } satisfies ResolversTypes["RequestNicovideoRegistrationReturnUnion"];
      }
      taggings.push({ tagId: parsed.data, note: note ?? null });
    }

    const result = await requestRegistration(prisma, {
      userId: user.id,
      title,
      thumbnailUrl,
      sourceId,
      taggings,
      semitaggings: semitaggings.map(({ name, note }) => ({ name, note: note || null })),
    });

    if (isErr(result)) {
      switch (result.error.message) {
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["RequestNicovideoRegistrationReturnUnion"];
        case "VIDEO_ALREADY_REGISTERED":
          return {
            __typename: "RequestNicovideoRegistrationVideoAlreadyRegisteredError",
            source: new NicovideoVideoSourceDTO(result.error.source),
          } satisfies ResolversTypes["RequestNicovideoRegistrationReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
      }
    }

    const request = result.data;
    return {
      __typename: "RequestNicovideoRegistrationSucceededPayload",
      request: new NicovideoRegistrationRequestDTO(request),
    } satisfies ResolversTypes["RequestNicovideoRegistrationReturnUnion"];
  }) satisfies MutationResolvers["requestNicovideoRegistration"];
