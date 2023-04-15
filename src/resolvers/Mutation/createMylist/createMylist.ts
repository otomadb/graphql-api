import { isErr } from "../../../utils/Result.js";
import { CreateMylistOtherErrorMessage, MutationResolvers } from "../../graphql.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";
import { create } from "./create.js";

export const createMylist = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_parent, { input: { slug, title, range } }, { currentUser }, info) => {
    const result = await create(prisma, { title, userId: currentUser.id, range, slug });
    if (isErr(result)) {
      switch (result.error.message) {
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "CreateMylistOtherErrorsFallback",
            message: CreateMylistOtherErrorMessage.InternalServerError,
          } as const;
      }
    }

    return {
      __typename: "CreateMylistSucceededPayload",
      mylist: new MylistModel(result.data),
    } as const;
  }) satisfies MutationResolvers["createMylist"];
