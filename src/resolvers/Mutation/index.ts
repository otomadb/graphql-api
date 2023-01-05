import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql.js";
import { addSemitagToVideo } from "./addSemitagToVideo.js";
import { addTagToVideo } from "./addTagToVideo.js";
import { addVideoToMylist } from "./addVideoToMylist.js";
import { createMylist } from "./createMylist.js";
import { createMylistGroup } from "./createMylistGroup/createMylistGroup.js";
import { likeVideo } from "./likeVideo.js";
import { registerTag } from "./registerTag.js";
import { registerVideo } from "./registerVideo.js";
import { removeTagFromVideo } from "./removeTagFromVideo.js";
import { removeVideoFromMylist } from "./removeVideoFromMylist.js";
import { resolveSemitag } from "./resolveSemitag.js";
import { undoLikeVideo } from "./undoLikeVideo.js";

export const resolveMutation = (deps: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  ({
    addTagToVideo: addTagToVideo(deps),
    addSemitagToVideo: addSemitagToVideo(deps),
    addVideoToMylist: addVideoToMylist(deps),
    createMylist: createMylist(deps),
    likeVideo: likeVideo(deps),
    registerTag: registerTag(deps),
    registerVideo: registerVideo(deps),
    removeTagFromVideo: removeTagFromVideo(deps),
    removeVideoFromMylist: removeVideoFromMylist(deps),
    resovleSemitag: resolveSemitag(deps),
    undoLikeVideo: undoLikeVideo(deps),
    createMylistGroup: createMylistGroup(deps),
  } satisfies Resolvers["Mutation"]);
