import { Driver as Neo4jDriver } from "neo4j-driver";

import { VideoTag } from "../db/entities/video_tags.js";
import { addVideoTags } from "./addVideoTags.js";

export const addVideoTag = (deps: { neo4jDriver: Neo4jDriver }) => async (rel: VideoTag) => addVideoTags(deps)([rel]);
