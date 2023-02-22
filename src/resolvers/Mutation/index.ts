/* eslint sort-keys: 2 */

import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { addMylistToMylistGroup } from "./addMylistToMylistGroup/addMylistToMylistGroup.js";
import { addSemitagToVideo } from "./addSemitagToVideo/addSemitagToVideo.js";
import { resolverAddTagToVideo } from "./addTagToVideo/resolver.js";
import { addVideoToMylist } from "./addViteoToMylist/addVideoToMylist.js";
import { createMylist } from "./createMylist/createMylist.js";
import { createMylistGroup } from "./createMylistGroup/createMylistGroup.js";
import { likeVideo } from "./likeVideo/likeVideo.js";
import { registerTag } from "./registerTag/registerTag.js";
import { resolverRegisterVideo } from "./registerVideo/resolver.js";
import { rejectSemitag } from "./rejectSemitag/rejectSemitag.js";
import { resolverRemoveTagFromVideo } from "./removeTagFromVideo/resolver.js";
import { removeVideoFromMylist } from "./removeVideoFromMylist/removeVideoFromMylist.js";
import { resolveSemitag } from "./resolveSemitag/resolveSemitag.js";
import { signin } from "./signin/signin.js";
import { signout } from "./signout/signout.js";
import { resolverSignup } from "./signup/resolver.js";
import { undoLikeVideo } from "./undoLikeVideo/undoLikeVideo.js";

export const resolveMutation = (deps: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "config">) =>
  ({
    addMylistToMylistGroup: addMylistToMylistGroup(deps),
    addSemitagToVideo: addSemitagToVideo(deps),
    addTagToVideo: resolverAddTagToVideo(deps),
    addVideoToMylist: addVideoToMylist(deps),
    createMylist: createMylist(deps),
    createMylistGroup: createMylistGroup(deps),
    likeVideo: likeVideo(deps),
    registerTag: registerTag(deps),
    registerVideo: resolverRegisterVideo(deps),
    rejectSemitag: rejectSemitag(deps),
    removeTagFromVideo: resolverRemoveTagFromVideo(deps),
    removeVideoFromMylist: removeVideoFromMylist(deps),
    resovleSemitag: resolveSemitag(deps),
    signin: signin(deps),
    signout: signout(deps),
    signup: resolverSignup(deps),
    undoLikeVideo: undoLikeVideo(deps),
  } satisfies Resolvers["Mutation"]);
