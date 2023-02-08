import { describe } from "@jest/globals";
import { PrismaClient } from "@prisma/client";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ResolverDeps } from "../../index.js";
import { register } from "./registerVideo.js";

describe("Mutation.registerVideo", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("存在する全てのマイリストがグループの中にある", async () => {
    const userId1 = "u1";

    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId1,
          name: "user1",
          displayName: "User1",
          email: "user1@example.com",
          password: "password",
        },
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", meaningless: false },
          { id: "t2", meaningless: false },
        ],
      }),
    ]);

    const actual = await register(prisma, {
      authUserId: userId1,
      primaryTitle: "Video 1",
      extraTitles: ["Video 1.1", "Video 1.2"],
      primaryThumbnail: "https://example.com/1.jpg",
      tagIds: ["t1", "t2"],
      semitagNames: ["Semitag 1", "Semitag 2"],
      nicovideoSourceIds: ["sm1"],
    });

    expect(actual).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
      })
    );
  });
});
