import { VideoEvent } from "@prisma/client";
import z from "zod";

import { VideoEventModel } from "../VideoEvent/model.js";

const schemaPayload = z.object({ id: z.string() });
export type VideoAddSemitagEventPayload = z.infer<typeof schemaPayload>;

export class VideoAddSemitagEventModel extends VideoEventModel<{ id: string }> {
  private readonly _payload: { id: string };

  constructor(protected readonly event: VideoEvent) {
    super(event);

    const parsedPayload = schemaPayload.safeParse(event.payload);
    if (!parsedPayload.success) throw new Error("Invalid payload");
    this._payload = parsedPayload.data;
  }

  get payload(): {
    /**
     * SemitagのID
     */
    id: string;
  } {
    return this._payload;
  }
}
