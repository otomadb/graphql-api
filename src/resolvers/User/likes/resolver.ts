import { UserResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";
import { get } from "./prisma.js";

export const resolverUserLikes = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: userId }, _args, { user }) => {
    const result = await get(prisma, { holderId: userId, authUserId: user?.id || null });

    if (isErr(result))
      switch (result.error) {
        case "NO_LIKELIST":
          // TODO: logging
          return null;
        case "PRIVATE_NOT_HOLDER":
          return null;
      }

    return new MylistModel(result.data);
  }) satisfies UserResolvers["likes"];
