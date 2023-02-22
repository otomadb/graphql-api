/* eslint sort-keys: 2 */

import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { addMylistToMylistGroup } from "./addMylistToMylistGroup/addMylistToMylistGroup.js";
import { addSemitagToVideo } from "./addSemitagToVideo/addSemitagToVideo.js";
import { addTagToVideo } from "./addTagToVideo/addTagToVideo.js";
import { addVideoToMylist } from "./addViteoToMylist/addVideoToMylist.js";
import { createMylist } from "./createMylist/createMylist.js";
import { createMylistGroup } from "./createMylistGroup/createMylistGroup.js";
import { likeVideo } from "./likeVideo/likeVideo.js";
import { registerTag } from "./registerTag/registerTag.js";
import { resolverRegisterVideo } from "./registerVideo/resolver.js";
import { rejectSemitag } from "./rejectSemitag/rejectSemitag.js";
import { removeTagFromVideo } from "./removeTagFromVideo/removeTagFromVideo.js";
import { removeVideoFromMylist } from "./removeVideoFromMylist/removeVideoFromMylist.js";
import { resolveSemitag } from "./resolveSemitag/resolveSemitag.js";
import { signin } from "./signin/signin.js";
import { signout } from "./signout/signout.js";
import { signup } from "./signup/signup.js";
import { undoLikeVideo } from "./undoLikeVideo/undoLikeVideo.js";

export const resolveMutation = (deps: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "config">) =>
  ({
    addMylistToMylistGroup: addMylistToMylistGroup(deps),
    addSemitagToVideo: addSemitagToVideo(deps),
    addTagToVideo: addTagToVideo(deps),
    addVideoToMylist: addVideoToMylist(deps),
    createMylist: createMylist(deps),
    createMylistGroup: createMylistGroup(deps),
    likeVideo: likeVideo(deps),
    registerTag: registerTag(deps),
    registerVideo: resolverRegisterVideo(deps),
    rejectSemitag: rejectSemitag(deps),
    removeTagFromVideo: removeTagFromVideo(deps),
    removeVideoFromMylist: removeVideoFromMylist(deps),
    resovleSemitag: resolveSemitag(deps),
    signin: signin(deps),
    signout: signout(deps),
    signup: signup(deps),
    undoLikeVideo: undoLikeVideo(deps),
  } satisfies Resolvers["Mutation"]);
