import { Tag, TagEventType, TagNameEventType } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    extraNames,
    primaryName,
  }: {
    userId: string;
    primaryName: string;
    extraNames: string[];
  }
): Promise<Result<{ type: "UNKNOWN"; error: unknown }, Tag>> => {
  try {
    const tagId = ulid();

    const $names = [
      prisma.tagName.create({
        data: {
          id: ulid(),
          tagId,
          name: primaryName,
          isPrimary: true,
          events: {
            createMany: {
              data: [
                { userId, type: TagNameEventType.CREATE, payload: {} },
                { userId, type: TagNameEventType.SET_PRIMARY, payload: {} },
              ],
            },
          },
        },
      }),
      ...extraNames.map((extraName) =>
        prisma.tagName.create({
          data: {
            id: ulid(),
            tagId,
            name: extraName,
            isPrimary: false,
            events: {
              createMany: {
                data: [{ userId, type: TagNameEventType.CREATE, payload: {} }],
              },
            },
          },
        })
      ),
    ];

    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          meaningless: true,
          events: {
            create: {
              userId,
              type: TagEventType.REGISTER,
              payload: {},
            },
          },
        },
      }),
      ...$names,
    ]);
    return ok(tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
