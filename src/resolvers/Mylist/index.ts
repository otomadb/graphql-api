import { GraphQLError } from "graphql";

import { MylistShareRange as MylistGQLShareRange } from "../../graphql.js";
import { Resolvers } from "../../graphql.js";
import { buildGqlId, parseGqlID } from "../../utils/id.js";
import { ResolverDeps } from "../index.js";
import { MylistRegistrationModel } from "../MylistRegistration/model.js";
import { UserModel } from "../User/model.js";
import { resolveIncludeTags } from "./includesTags.js";
import { resolveRecommendedVideos } from "./recommendedVideos.js";

export const resolveMylist = ({ dataSource, neo4jDriver }: Pick<ResolverDeps, "prisma" | "neo4jDriver">) =>
  ({
    id: ({ id }) => buildGqlId("Mylist", id),
    range: ({ range }) => {
      switch (range) {
        case MylistShareRange.PUBLIC:
          return MylistGQLShareRange.Public;
        case MylistShareRange.KNOW_LINK:
          return MylistGQLShareRange.KnowLink;
        case MylistShareRange.PRIVATE:
          return MylistGQLShareRange.Private;
        default:
          throw new Error("Unknown Mylist Range");
      }
    },
    holder: async ({ id: mylistId }) => {
      const mylist = await dataSource.getRepository(Mylist).findOne({
        where: { id: mylistId },
        relations: { holder: true },
      });
      if (!mylist) throw new GraphQLError(`holder for mylist ${mylistId} is not found`);
      return new UserModel(mylist.holder);
    },
    registrations: async ({ id: mylistId }, { input }) => {
      const regs = await dataSource.getRepository(MylistRegistration).find({
        where: { mylist: { id: mylistId } },
        relations: { mylist: true, video: true },
        order: {
          createdAt: input.order?.createdAt || undefined,
          updatedAt: input.order?.updatedAt || undefined,
        },
        take: input.limit,
        skip: input.skip,
      });
      return {
        nodes: regs.map((reg) => new MylistRegistrationModel(reg)),
      };
    },

    isIncludesVideo: async ({ id: mylistId }, { id: videoId }) =>
      dataSource
        .getRepository(MylistRegistration)
        .findOne({
          where: {
            mylist: { id: mylistId },
            video: { id: parseGqlID("Video", videoId) },
          },
        })
        .then((r) => !!r),

    recommendedVideos: resolveRecommendedVideos({ neo4jDriver }),
    includeTags: resolveIncludeTags({ dataSource }),
  } satisfies Resolvers["Mylist"]);
