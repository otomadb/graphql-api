import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationRegisterTagArgs, MutationResolvers } from "../../../graphql.js";
import { parseGqlID, parseGqlIDs } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const registerTagInNeo4j = async (neo4j: ResolverDeps["neo4j"], rels: { videoId: string; tagId: string }[]) => {
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

export const registerTagScaffold =
  ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  async (_: unknown, { input }: MutationRegisterTagArgs) => {
    const { primaryName, extraNames, meaningless } = input;

    // implicitParentsの中にexplicitParentが存在すればエラー
    if (input.explicitParent && input.implicitParents.includes(input.explicitParent))
      throw new GraphQLError(`"${input.explicitParent}" is specified as explicitParent and also implicitParents`);

    // implicitParentsの中で重複チェック
    const duplicatedImplicitParentGqlId = input.implicitParents.find((id, i, arr) => arr.indexOf(id) !== i);
    if (duplicatedImplicitParentGqlId)
      throw new GraphQLError(`"${duplicatedImplicitParentGqlId}" is duplicated in implicitParents`);

    const explicitParentId = input.explicitParent ? parseGqlID("Tag", input.explicitParent) : null;
    const implicitParentIds = parseGqlIDs("Tag", input.implicitParents);
    const semitagIds = parseGqlIDs("Semitag", input.resolveSemitags);

    console.dir(semitagIds);

    // TODO: makes transactionize
    const tagId = ulid();
    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          meaningless,
          names: {
            createMany: {
              data: [
                { name: primaryName, isPrimary: true },
                ...extraNames.map((extraName) => ({ name: extraName, isPrimary: false })),
              ],
            },
          },
          parents: {
            createMany: {
              data: [
                ...(explicitParentId ? [{ parentId: explicitParentId, isExplicit: true }] : []),
                ...implicitParentIds.map((implicitParentId) => ({ parentId: implicitParentId, isExplicit: false })),
              ],
            },
          },
        },
      }),
      prisma.semitag.updateMany({
        where: { id: { in: semitagIds } },
        data: { isResolved: true, tagId },
      }),
    ]);
    return { tag: new TagModel(tag) };

    /*
    const tagParents: TagParent[] = [];
    const semitagVideoTags: VideoTag[] = [];

    await dataSource.transaction(async (manager) => {
      const repoTag = manager.getRepository(Tag);
      const repoTagName = manager.getRepository(TagName);
      const repoTagParent = manager.getRepository(TagParent);
      const repoSemitag = manager.getRepository(Semitag);
      const repoVideoTag = manager.getRepository(VideoTag);

      await repoTag.insert(tag);

      if (!explicitParentId && implicitParentIds.length === 0) {
        for (const name of [primaryName, ...extraNames]) {
          const already = await repoTag.findOne({ where: { tagNames: { name } } });
          if (already) throw new GraphQLError(`"tag:${already.id}" is already registered for "${name}"`);
        }
      }

      if (explicitParentId) {
        const explicitParent = await repoTag.findOne({ where: { id: explicitParentId } });
        if (!explicitParent) throw new GraphQLNotExistsInDBError("Tag", explicitParentId);

        for (const name of [primaryName, ...extraNames]) {
          const already = await repoTag.findOne({
            where: {
              tagNames: { name },
              tagParents: { parent: { id: explicitParentId } },
            },
          });
          if (already)
            throw new GraphQLError(
              `"tag:${already.id}" is already registered for "${name}" with parent "tag:${explicitParentId}"`
            );
        }
        GraphQLNotExistsInDBError;
        const explicitTagParent = new TagParent();
        explicitTagParent.id = ulid();
        explicitTagParent.explicit = true;
        explicitTagParent.parent = explicitParent;
        explicitTagParent.child = tag;
        tagParents.push(explicitTagParent);
      }

      for (const implicitParentId of implicitParentIds) {
        const implicitParent = await repoTag.findOne({ where: { id: implicitParentId } });
        if (!implicitParent) throw new GraphQLNotExistsInDBError("Tag", implicitParentId);

        for (const name of [primaryName, ...extraNames]) {
          const already = await repoTag.findOne({
            where: {
              tagNames: { name },
              tagParents: { parent: { id: implicitParentId } },
            },
          });
          if (already)
            throw new GraphQLError(
              `"tag:${already.id}" is already registered for "${name}" with parent "tag:${implicitParentId}"`
            );
        }

        const implicitTagParent = new TagParent();
        implicitTagParent.id = ulid();
        implicitTagParent.explicit = false;
        implicitTagParent.parent = implicitParent;
        implicitTagParent.child = tag;
        tagParents.push(implicitTagParent);
      }

      for (const semitagId of semitagIds) {
        const semitag = await repoSemitag
          .findOneOrFail({
            where: { id: semitagId, resolved: false },
            relations: { video: true },
          })
          .catch(() => {
            throw new GraphQLNotExistsInDBError("Semitag", semitagId);
          });

        await repoSemitag.update({ id: semitag.id }, { resolved: true, tag });

        const videoTag = new VideoTag();
        videoTag.id = ulid();
        videoTag.tag = tag;
        videoTag.video = semitag.video;

        semitagVideoTags.push(videoTag);
      }

      await repoTagName.insert([primaryTagName, ...extraTagNames]);
      await repoTagParent.insert(tagParents);
      await repoVideoTag.insert(semitagVideoTags);
    });

    await registerTagInNeo4j(
      neo4j,
      semitagVideoTags.map(({ tag, video }) => ({ tagId: tag.id, videoId: video.id }))
    );
    */
  };

export const registerTag = ({ prisma }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  checkAuth(UserRole.EDITOR, registerTagScaffold({ prisma })) satisfies MutationResolvers["registerTag"];
