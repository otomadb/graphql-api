/* eslint sort-keys: 2 */

import { resolverRejectRequestNicovideoRegistration } from "../../NicovideoRegistrationRequest/rejectNicovideoRegistrationRequest.resolver.js";
import { resolverRequestNicovideoRegistration } from "../../NicovideoRegistrationRequest/requestNicovideoRegistration.resolver.js";
import { resolverRegisterVideoFromNicovideo } from "../../NicovideoVideoSource/registerVideoFromNicovideo.resolver.js";
import { resolverRegisterMadFromSoundcloud } from "../../SoundcloudVideoSource/registerMadFromSoundcloud.resolver.js";
import { resolverAddTagToVideo } from "../../Tag/addTagToVideo.resolver.js";
import { resolverExplicitizeTagParent } from "../../Tag/explicitizeTagParent.resolver.js";
import { resolverImplicitizeTagParent } from "../../Tag/implicitizeTagParent.resolver.js";
import { registerCategoryTag } from "../../Tag/registerCategoryTag.resolver.js";
import { resolverRegisterCategoryTagTyping } from "../../Tag/registerCategoryTagTyping.resolver.js";
import { resolverRegisterTag } from "../../Tag/registerTag.resolver.js";
import { resolverRegisterTagParentRelation } from "../../Tag/registerTagParentRelation.resolver.js";
import { resolverRemoveTagFromVideo } from "../../Tag/removeTagFromVideo.resolver.js";
import { resolverRegisterVideoFromYoutube } from "../../YoutubeVideoSource/registerVideoFromYoutube.resolver.js";
import { type Resolvers } from "../graphql.js";
import { ResolverDeps } from "../types.js";
import { addMylistToMylistGroup } from "./addMylistToMylistGroup/addMylistToMylistGroup.js";
import { addSemitagToVideo } from "./addSemitagToVideo/addSemitagToVideo.js";
import { addVideoToMylist } from "./addVideoToMylist/addVideoToMylist.js";
import { resolverChangeMylistShareRange } from "./changeMylistShareRange/resolver.js";
import { resolverChangeUserDisplayName } from "./changeUserDisplayName/resolver.js";
import { createMylist } from "./createMylist/createMylist.js";
import { createMylistGroup } from "./createMylistGroup/createMylistGroup.js";
import { resolverLikeVideo } from "./likeVideo/resolver.js";
import { resolverRejectSemitag } from "./rejectSemitag/resolver.js";
import { removeVideoFromMylist } from "./removeVideoFromMylist/removeVideoFromMylist.js";
import { resolverRequestYoutubeRegistration } from "./requestYoutubeRegistration/resolver.js";
import { resolverResolveSemitag } from "./resolveSemitag/resolver.js";
import { resolverUndoLikeVideo } from "./undoLikeVideo/resolver.js";
import { resolverWatchNotifications } from "./watchNotifications/resolver.js";

export const resolveMutation = (deps: ResolverDeps) =>
  ({
    addMylistToMylistGroup: addMylistToMylistGroup(deps),
    addSemitagToVideo: addSemitagToVideo(deps),
    addTagToVideo: resolverAddTagToVideo(deps),
    addVideoToMylist: addVideoToMylist(deps),
    changeMylistShareRange: resolverChangeMylistShareRange(deps),
    changeUserDisplayName: resolverChangeUserDisplayName(deps),
    createMylist: createMylist(deps),
    createMylistGroup: createMylistGroup(deps),
    explicitizeTagParent: resolverExplicitizeTagParent(deps),
    implicitizeTagParent: resolverImplicitizeTagParent(deps),
    likeVideo: resolverLikeVideo(deps),
    registerCategoryTag: registerCategoryTag(deps),
    registerCategoryTagTyping: resolverRegisterCategoryTagTyping(deps),
    registerMadFromSoundcloud: resolverRegisterMadFromSoundcloud(deps),
    registerTag: resolverRegisterTag(deps),
    registerTagParentRelation: resolverRegisterTagParentRelation(deps),
    registerVideoFromNicovideo: resolverRegisterVideoFromNicovideo(deps),
    registerVideoFromYoutube: resolverRegisterVideoFromYoutube(deps),
    rejectNicovideoRegistrationRequest: resolverRejectRequestNicovideoRegistration(deps),
    rejectSemitag: resolverRejectSemitag(deps),
    removeTagFromVideo: resolverRemoveTagFromVideo(deps),
    removeVideoFromMylist: removeVideoFromMylist(deps),
    requestNicovideoRegistration: resolverRequestNicovideoRegistration(deps),
    requestYoutubeRegistration: resolverRequestYoutubeRegistration(deps),
    resovleSemitag: resolverResolveSemitag(deps),
    undoLikeVideo: resolverUndoLikeVideo(deps),
    watchNotifications: resolverWatchNotifications(deps),
  } satisfies Resolvers["Mutation"]);
