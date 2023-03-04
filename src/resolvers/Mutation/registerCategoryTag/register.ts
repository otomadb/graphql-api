import { Prisma, Tag, TagEventType, TagNameEventType } from "@prisma/client";
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

    const dataNames = [
      { id: ulid(), name: primaryName, isPrimary: true },
      ...extraNames.map((extraName) => ({
        id: ulid(),
        name: extraName,
        isPrimary: false,
      })),
    ];

    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          meaningless: true,
          names: { createMany: { data: dataNames } },
          events: {
            create: {
              userId,
              type: TagEventType.REGISTER,
              payload: {},
            },
          },
        },
      }),
      prisma.tagNameEvent.createMany({
        data: [
          ...dataNames.map(
            ({ id }) =>
              ({
                userId,
                type: TagNameEventType.CREATE,
                tagNameId: id,
                payload: {},
              } satisfies Prisma.TagNameEventCreateManyInput)
          ),
          {
            userId,
            tagNameId: dataNames[0].id,
            type: TagNameEventType.SET_PRIMARY,
            payload: {},
          },
        ],
      }),
    ]);
    return ok(tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
