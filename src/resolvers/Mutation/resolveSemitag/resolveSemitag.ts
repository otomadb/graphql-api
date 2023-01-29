import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";

import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagModel } from "../../Semitag/model.js";

export const resolveSemitagInNeo4j = async (
  neo4jDriver: ResolverDeps["neo4j"],
  { videoId, tagId }: { videoId: string; tagId: string }
) => {
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
      MERGE (v:Video {id: $video_id})
      MERGE (t:Tag {id: $tag_id})
      MERGE r=(v)-[:TAGGED_BY]->(t)
      RETURN r
      `,
      { tag_id: tagId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const resolveSemitag = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ensureContextUser(UserRole.EDITOR, async (_, { input: { id: semitagGqlId, tagId: tagGqlId } }) => {
    const semitagId = parseGqlID("Semitag", semitagGqlId);
    const tagId = tagGqlId ? parseGqlID("Tag", tagGqlId) : null;

    const semitag = await prisma.semitag.findUniqueOrThrow({ where: { id: semitagId } }).catch(() => {
      throw new GraphQLNotExistsInDBError("Semitag", semitagId);
    });
    if (semitag.isResolved) throw new GraphQLError(`"semitag:${semitagId}" was already resolved`);

    if (!tagId) {
      const updated = await prisma.semitag.update({
        where: { id: semitag.id },
        data: { isResolved: true, tagId: null },
      });
      return { semitag: new SemitagModel(updated) };
    } else {
      const updated = await prisma.semitag.update({
        where: { id: semitag.id },
        data: {
          isResolved: true,
          tag: {
            connect: { id: tagId },
            update: {
              videos: {
                connectOrCreate: {
                  where: {
                    videoId_tagId: { tagId, videoId: semitag.videoId },
                  },
                  create: {
                    videoId: semitag.videoId,
                  },
                },
              },
            },
          },
        },
      });
      // TODO: tagIdがnullableになってしまうので
      /*
      await resolveSemitagInNeo4j(neo4j, {
        tagId: updated.tagId,
        videoId: updated.videoId,
      });
      */
      return { semitag: new SemitagModel(updated) };
    }
  }) satisfies MutationResolvers["resovleSemitag"];
