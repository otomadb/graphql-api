import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkShowTimelineResolver: MkQueryResolver<"showTimeline", "TimelineEventService"> =
  ({ TimelineEventService }) =>
  (_parent, { input: { skip, take } }, { currentUser }) => {
    return TimelineEventService.calcTimelineEvents(currentUser.id, {
      skip,
      take,
      filter: {
        REGISTER: true,
        REQUEST_NICOVIDEO: true,
        REQUEST_YOUTUBE: true,
        REQUEST_SOUNDCLOUD: true,
        REQUEST_BILIBILI: true,
      },
    });
  };
