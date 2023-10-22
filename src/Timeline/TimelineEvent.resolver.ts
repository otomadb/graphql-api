import { MkResolverWithInclude } from "../utils/MkResolver.js";
import {
  MadRegisteredTimelineEventDTO,
  NicovideoMadRequestedTimelineEventDTO,
  YoutubeMadRequestedTimelineEventDTO,
} from "./TimelineEvent.dto.js";

export const mkMadRegisteredTimelineEventResolver: MkResolverWithInclude<
  "MadRegisteredTimelineEvent",
  "VideoService"
> = ({ VideoService }) => ({
  __isTypeOf: (v) => v instanceof MadRegisteredTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  video: ({ videoId }) => VideoService.getByIdOrThrow(videoId),
});

export const mkNicovideoMadRequestedTimelineEventResolver: MkResolverWithInclude<
  "NicovideoMadRequestedTimelineEvent",
  "NicovideoRegistrationRequestService"
> = ({ NicovideoRegistrationRequestService }) => ({
  __isTypeOf: (v) => v instanceof NicovideoMadRequestedTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  request: ({ requestId }) => NicovideoRegistrationRequestService.getByIdOrThrow(requestId),
});

export const mkYoutubeMadRequestedTimelineEventResolver: MkResolverWithInclude<
  "YoutubeMadRequestedTimelineEvent",
  "YoutubeRegistrationRequestService"
> = ({ YoutubeRegistrationRequestService }) => ({
  __isTypeOf: (v) => v instanceof YoutubeMadRequestedTimelineEventDTO,
  createdAt: ({ createdAt }) => createdAt,
  request: ({ requestId }) => YoutubeRegistrationRequestService.getByIdOrThrow(requestId),
});
