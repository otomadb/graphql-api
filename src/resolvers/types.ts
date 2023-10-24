import { IncomingMessage, ServerResponse } from "node:http";

import { PrismaClient } from "@prisma/client";
import { AppMetadata, User, UserMetadata } from "auth0";
import { MeiliSearch } from "meilisearch";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { Logger } from "pino";

import { BilibiliMADSourceService } from "../BilibiliMADSource/BilibiliMADSource.service.js";
import { ImagesService } from "../Common/Images.service.js";
import { SoundcloudService as SoundcloudService2 } from "../Common/Soundcloud.service.js";
import { NicovideoRegistrationRequestService } from "../NicovideoRegistrationRequest/NicovideoRegistrationRequest.service.js";
import { NicovideoRegistrationRequestEventService } from "../NicovideoRegistrationRequest/NicovideoRegistrationRequestEvent.service.js";
import { SoundcloudMADSourceService } from "../SoundcloudMADSource/SoundcloudMADSource.service.js";
import { TimelineEventService } from "../Timeline/TimelineEvent.service.js";
import { UserService } from "../User/service.js";
import { VideoService } from "../Video/Video.service.js";
import { YoutubeRegistrationRequestService } from "../YoutubeRegistrationRequest/YoutubeRegistrationRequest.service.js";

export type Auth0User = User<AppMetadata, UserMetadata>;

export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
  meilisearch: MeiliSearch;
  logger: Logger;
  userService: UserService;
  ImagesService: ImagesService;
  BilibiliMADSourceService: BilibiliMADSourceService;
  SoundcloudMADSourceService: SoundcloudMADSourceService;
  SoundcloudService: SoundcloudService2;
  TimelineEventService: TimelineEventService;
  VideoService: VideoService;
  NicovideoRegistrationRequestService: NicovideoRegistrationRequestService;
  YoutubeRegistrationRequestService: YoutubeRegistrationRequestService;
  NicovideoRegistrationRequestEventService: NicovideoRegistrationRequestEventService;
};
export type ServerContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

export type CurrentUser = {
  id: string;
  scopes: string[];
};
export type UserContext = {
  currentUser: CurrentUser;
};

export type Context = ServerContext & UserContext;
