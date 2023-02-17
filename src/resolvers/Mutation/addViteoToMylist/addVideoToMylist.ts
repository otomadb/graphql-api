import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";

import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";
import { addVideoToMylistInNeo4j } from "./neo4j.js";

export const addVideoToMylist = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  ensureContextUser(
    prisma,
    UserRole.NORMAL,
    async (_parent, { input: { mylistId: mylistGqlId, note, videoId: videoGqlId } }, { userId }, info) => {
      const mylistId = parseGqlID("Mylist", mylistGqlId);
      const videoId = parseGqlID("Video", videoGqlId);

      if ((await prisma.mylist.findUniqueOrThrow({ where: { id: mylistId } })).holderId !== userId)
        throw new GraphQLError(`mylist "${mylistGqlId}" is not holded by you`);

      const registration = await prisma.mylistRegistration.create({
        data: { videoId, mylistId, note },
        include: { video: true, mylist: true },
      });

      const neo4jResult = await addVideoToMylistInNeo4j({ prisma, neo4j }, registration.id);
      if (neo4jResult.status === "error") {
        logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
      }

      return {
        registration: new MylistRegistrationModel(registration),
      };
    }
  ) satisfies MutationResolvers["addVideoToMylist"];
