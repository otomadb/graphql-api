import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkShowTimelineResolver: MkQueryResolver<"showTimeline", "TimelineEventService"> =
  ({ TimelineEventService }) =>
  (_parent, { input: { skip, take } }, { currentUser }) => {
    return TimelineEventService.calcTimelineEvents(currentUser.id, { skip, take });
  };
