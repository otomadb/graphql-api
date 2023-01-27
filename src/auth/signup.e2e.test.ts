import { describe } from "@jest/globals";
import { PrismaClient, UserRole } from "@prisma/client";

import { ResolverDeps } from "../resolvers/index.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { registerUser } from "./signup.js";

describe("registerUser()", () => {
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

  test("既に同じnameを持つユーザが作成済みならエラーを返却", async () => {
    await prisma.user.create({
      data: {
        name: "testuser",
        displayName: "Test User",
        email: "testuser@example.net",
        isEmailConfirmed: true,
        password: "password",
        role: UserRole.NORMAL,
      },
    });

    const actual = await registerUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "error",
      error: { message: "USER_NAME_ALREADY_REGISTERED" },
    });
  });

  test("管理者が存在しないなら，管理者ユーザとして作成される", async () => {
    const actual = await registerUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "ok",
      data: {
        user: expect.objectContaining({
          id: expect.any(String),
          name: "testuser",
          role: UserRole.ADMINISTRATOR,
        }),
      },
    });
  });

  test("管理者が存在するなら，通常ユーザとして作成される", async () => {
    await prisma.user.create({
      data: {
        name: "admin",
        displayName: "Test User",
        email: "admin@example.net",
        isEmailConfirmed: true,
        password: "password",
        role: UserRole.ADMINISTRATOR,
      },
    });

    const actual = await registerUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "ok",
      data: {
        user: expect.objectContaining({
          id: expect.any(String),
          name: "testuser",
          role: UserRole.NORMAL,
        }),
      },
    });
  });
});
