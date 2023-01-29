import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationRegisterVideoArgs, MutationResolvers, RegisterVideoInputSourceType } from "../../graphql.js";
import { parseGqlIDs } from "../../../utils/id.js";
import { isValidNicovideoSourceId } from "../../../utils/isValidNicovideoSourceId.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";

export const registerVideoInNeo4j = async (
  neo4j: ResolverDeps["neo4j"],
  rels: { videoId: string; tagId: string }[]
) => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    for (const rel of rels) {
      const tagId = rel.videoId;
      const videoId = rel.tagId;
      tx.run(
        `
          MERGE (v:Video {id: $video_id})
          MERGE (t:Tag {id: $tag_id})
          MERGE r=(v)-[:TAGGED_BY]->(t)
          RETURN r
          `,
        { tag_id: tagId, video_id: videoId }
      );
    }
    await tx.commit();
  } finally {
    await session.close();
  }
};

export const registerVideoScaffold =
  ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  async (_parent: unknown, { input }: MutationRegisterVideoArgs) => {
    // validity check
    const nicovideoSourceIds = input.sources
      .filter((v) => v.type === RegisterVideoInputSourceType.Nicovideo)
      .map(({ sourceId }) => sourceId.toLocaleLowerCase());
    for (const id of nicovideoSourceIds) {
      if (!isValidNicovideoSourceId(id)) throw new GraphQLError(`"${id}" is invalid source id for niconico source`);
    }

    const tagIds = parseGqlIDs("Tag", input.tags);
    const videoId = ulid();

    const video = await prisma.video.create({
      data: {
        id: videoId,
        titles: {
          createMany: {
            data: [
              {
                title: input.primaryTitle,
                isPrimary: true,
              },
              ...input.extraTitles.map((extraTitle) => ({
                title: extraTitle,
                isPrimary: false,
              })),
            ],
          },
        },
        thumbnails: {
          createMany: {
            data: [
              {
                imageUrl: input.primaryThumbnail,
                isPrimary: true,
              },
            ],
          },
        },
        tags: {
          createMany: {
            data: tagIds.map((tagId) => ({ tagId })),
          },
        },
        semitags: {
          createMany: {
            data: input.semitags.map((name) => ({
              name,
              isResolved: false,
            })),
          },
        },
        nicovideoSources: {
          createMany: {
            data: nicovideoSourceIds.map((sourceId) => ({
              sourceId: sourceId.toLowerCase(),
            })),
          },
        },
      },
    });

    /*
    await registerVideoInNeo4j(
      neo4j,
      video.tags.map(({ tagId, videoId }) => ({ tagId, videoId }))
    );
    */

    return {
      video: new VideoModel(video),
    };
  };

export const registerVideo = (deps: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  checkAuth(UserRole.EDITOR, registerVideoScaffold(deps)) satisfies MutationResolvers["registerVideo"];
