import { isErr } from "../../../utils/Result.js";
import { UserResolvers } from "../../graphql.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";
import { get } from "./prisma.js";

export const resolverUserLikes = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: userId }, _args, { currentUser: user }) => {
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
