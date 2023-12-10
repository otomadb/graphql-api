import { GraphQLError } from "graphql";

import { parseGqlID3 } from "../resolvers/id.js";
import { MkMutationResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { AbstractGroupingDTO } from "./AbstractGrouping.dto.js";

export const mkExcludeTagToGroupResolver: MkMutationResolver<"excludeTagToGroup", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  async (_parent, { input }, { currentUser: { id: userId } }) => {
    const { groupKeyword, tagId: unparsedTagId } = input;
    const parsedTagId = parseGqlID3("Tag", unparsedTagId);
    if (isErr(parsedTagId)) {
      logger.error({ error: parsedTagId.error, input });
      throw new GraphQLError("Wrong form tag ID");
    }
    const tagId = parsedTagId.data;

    if (
      !(await prisma.abstractGrouping.findUnique({
        where: { groupKeyword_tagId: { groupKeyword, tagId }, disabled: false },
      }))
    ) {
      logger.error({ input });
      throw new GraphQLError("Already included");
    }

    const grouping = await prisma.abstractGrouping.update({
      where: { groupKeyword_tagId: { groupKeyword, tagId } },
      data: {
        disabled: true,
        events: {
          create: { type: "EXCLUDE", userId },
        },
      },
    });
    return {
      __typename: "ExcludeTagToGroupSuccessfulPayload",
      grouping: AbstractGroupingDTO.fromPrisma(grouping),
    };
  };
