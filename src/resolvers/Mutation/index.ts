import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql.js";
import { addVideoToMylist } from "./addVideoToMylist.js";
import { createMylist } from "./createMylist.js";
import { likeVideo } from "./likeVideo.js";
import { registerTag } from "./registerTag.js";
import { registerVideo } from "./registerVideo.js";
import { removeVideoFromMylist } from "./removeVideoFromMylist.js";
import { resolveSemitag } from "./resolveSemitag.js";
import { tagVideo } from "./tagVideo.js";
import { undoLikeVideo } from "./undoLikeVideo.js";
import { untagVideo } from "./untagVideo.js";

export const resolveMutation = (deps: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  ({
    registerTag: registerTag(deps),
    registerVideo: registerVideo(deps),
    tagVideo: tagVideo(deps),
    untagVideo: untagVideo(deps),
    addVideoToMylist: addVideoToMylist(deps),
    createMylist: createMylist(deps),
    likeVideo: likeVideo(deps),
    removeVideoFromMylist: removeVideoFromMylist(deps),
    undoLikeVideo: undoLikeVideo(deps),
    resovleSemitag: resolveSemitag(deps),
  } satisfies Resolvers["Mutation"]);
