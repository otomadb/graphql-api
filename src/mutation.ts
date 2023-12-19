/* eslint sort-keys: 2 */

import { mkExcludeTagToGroupResolver } from "./AbstractGroup/excludeTagToGroup.resolver.js";
import { mkIncludeTagToGroupResolver } from "./AbstractGroup/includeTagToGroup.resolver.js";
import { mkRegisterBilibiliMADResolver } from "./BilibiliMADSource/registerBilibiliMAD.resolver.js";
import { mkRequestBilibiliRegistrationResolver } from "./BilibiliRegistrationRequest/requestBilibiliRegistration.resolver.js";
import { mkAddVideoToMylistResolver } from "./Mylist/addVideoToMylist.resolver.js";
import { mkRemoveVideoFromMylistResolver } from "./Mylist/removeVideoFromMylist.js";
import { mkUpdateMylistSlugUpdate } from "./Mylist/updateMylistSlug.resolver.js";
import { mkUpdateMylistTitleUpdate } from "./Mylist/updateMylistTitle.resolver.js";
import { resolverRejectRequestNicovideoRegistration } from "./NicovideoRegistrationRequest/rejectNicovideoRegistrationRequest.resolver.js";
import { resolverRequestNicovideoRegistration } from "./NicovideoRegistrationRequest/requestNicovideoRegistration.resolver.js";
import { resolverRegisterVideoFromNicovideo } from "./NicovideoVideoSource/registerVideoFromNicovideo.resolver.js";
import { type Resolvers } from "./resolvers/graphql.js";
import { addMylistToMylistGroup } from "./resolvers/Mutation/addMylistToMylistGroup/addMylistToMylistGroup.js";
import { addSemitagToVideo } from "./resolvers/Mutation/addSemitagToVideo/addSemitagToVideo.js";
import { resolverChangeMylistShareRange } from "./resolvers/Mutation/changeMylistShareRange/resolver.js";
import { resolverChangeUserDisplayName } from "./resolvers/Mutation/changeUserDisplayName/resolver.js";
import { createMylist } from "./resolvers/Mutation/createMylist/createMylist.js";
import { createMylistGroup } from "./resolvers/Mutation/createMylistGroup/createMylistGroup.js";
import { resolverLikeVideo } from "./resolvers/Mutation/likeVideo/resolver.js";
import { resolverRejectSemitag } from "./resolvers/Mutation/rejectSemitag/resolver.js";
import { resolverResolveSemitag } from "./resolvers/Mutation/resolveSemitag/resolver.js";
import { resolverUndoLikeVideo } from "./resolvers/Mutation/undoLikeVideo/resolver.js";
import { resolverWatchNotifications } from "./resolvers/Mutation/watchNotifications/resolver.js";
import { ResolverDeps } from "./resolvers/types.js";
import { mkRegisterSoundcloudMADResolver } from "./SoundcloudMADSource/registerSoundcloudMAD.resolver.js";
import { mkRequestSoundcloudRegistrationResolver } from "./SoundcloudRegistrationRequest/requestSoundcloudRegistration.resolver.js";
import { resolverAddTagToVideo } from "./Tag/addTagToVideo.resolver.js";
import { resolverExplicitizeTagParent } from "./Tag/explicitizeTagParent.resolver.js";
import { resolverImplicitizeTagParent } from "./Tag/implicitizeTagParent.resolver.js";
import { resolverRegisterTag } from "./Tag/registerTag.resolver.js";
import { resolverRegisterTagParentRelation } from "./Tag/registerTagParentRelation.resolver.js";
import { resolverRemoveTagFromVideo } from "./Tag/removeTagFromVideo.resolver.js";
import { mkRequestYoutubeRegistrationResolver } from "./YoutubeRegistrationRequest/requestYoutubeRegistration.resolver.js";
import { mkResolveYoutubeRegistrationRequestResolver } from "./YoutubeRegistrationRequest/resolveYoutubeRegistrationRequest.resolver.js";
import { mkAddSourceFromYoutubeResolver } from "./YoutubeVideoSource/addSourceFromYoutube.resolver.js";
import { resolverRegisterVideoFromYoutube } from "./YoutubeVideoSource/registerVideoFromYoutube.resolver.js";

export const resolveMutation = (deps: ResolverDeps) =>
  ({
    addMylistToMylistGroup: addMylistToMylistGroup(deps),
    addSemitagToVideo: addSemitagToVideo(deps),
    addSourceFromYoutube: mkAddSourceFromYoutubeResolver(
      deps.logger.child({
        resolver: "Mutation.addSourceFromYoutube",
      }),
      deps,
    ),
    addTagToVideo: resolverAddTagToVideo(deps),
    addVideoToMylist: mkAddVideoToMylistResolver(deps),
    changeMylistShareRange: resolverChangeMylistShareRange(deps),
    changeUserDisplayName: resolverChangeUserDisplayName(deps),
    createMylist: createMylist(deps),
    createMylistGroup: createMylistGroup(deps),
    excludeTagToGroup: mkExcludeTagToGroupResolver(deps),
    explicitizeTagParent: resolverExplicitizeTagParent(deps),
    implicitizeTagParent: resolverImplicitizeTagParent(deps),
    includeTagToGroup: mkIncludeTagToGroupResolver(deps),
    likeVideo: resolverLikeVideo(deps),
    registerBilibiliMAD: mkRegisterBilibiliMADResolver(deps),
    registerSoundcloudMAD: mkRegisterSoundcloudMADResolver(deps),
    registerTag: resolverRegisterTag(deps),
    registerTagParentRelation: resolverRegisterTagParentRelation(deps),
    registerVideoFromNicovideo: resolverRegisterVideoFromNicovideo(deps),
    registerVideoFromYoutube: resolverRegisterVideoFromYoutube(deps),
    rejectNicovideoRegistrationRequest: resolverRejectRequestNicovideoRegistration(deps),
    rejectSemitag: resolverRejectSemitag(deps),
    removeTagFromVideo: resolverRemoveTagFromVideo(deps),
    removeVideoFromMylist: mkRemoveVideoFromMylistResolver({
      ...deps,
      logger: deps.logger.child({ resolver: "Mutation.removeVideoFromMylist" }),
    }),
    requestBilibiliRegistration: mkRequestBilibiliRegistrationResolver(deps),
    requestNicovideoRegistration: resolverRequestNicovideoRegistration(deps),
    requestSoundcloudRegistration: mkRequestSoundcloudRegistrationResolver(deps),
    requestYoutubeRegistration: mkRequestYoutubeRegistrationResolver(deps),
    resolveYoutubeRegistrationRequest: mkResolveYoutubeRegistrationRequestResolver({
      ...deps,
      logger: deps.logger.child({
        resolver: "Mutation.resolveYoutubeRegistrationRequest",
      }),
    }),
    resovleSemitag: resolverResolveSemitag(deps),
    undoLikeVideo: resolverUndoLikeVideo(deps),
    updateMylistSlug: mkUpdateMylistSlugUpdate({
      ...deps,
      logger: deps.logger.child({ resolver: "Mutation.updateMylistSlug" }),
    }),
    updateMylistTitle: mkUpdateMylistTitleUpdate({
      ...deps,
      logger: deps.logger.child({ resolver: "Mutation.updateMylistTitle" }),
    }),
    watchNotifications: resolverWatchNotifications(deps),
  }) satisfies Required<Resolvers["Mutation"]>;
