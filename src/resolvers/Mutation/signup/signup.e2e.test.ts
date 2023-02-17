import { PrismaClient, UserRole } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ResolverDeps } from "../../index.js";
import { registerNewUser } from "./signup.js";

describe("Mutation.signup()", () => {
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
        id: "u1",
        name: "testuser",
        displayName: "Test User",
        email: "testuser@example.net",
        isEmailConfirmed: true,
        password: "password",
        role: UserRole.NORMAL,
      },
    });

    const actual = await registerNewUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "error",
      error: "EXISTS_USERNAME",
    });
  });

  test("管理者が存在しないなら，管理者ユーザとして作成される", async () => {
    const actual = await registerNewUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "ok",
      data: expect.objectContaining({
        id: expect.any(String),
        name: "testuser",
        role: UserRole.ADMINISTRATOR,
      }),
    });
  });

  test("管理者が存在するなら，通常ユーザとして作成される", async () => {
    await prisma.user.create({
      data: {
        id: "u1",
        name: "admin",
        displayName: "Test User",
        email: "admin@example.net",
        isEmailConfirmed: true,
        password: "password",
        role: UserRole.ADMINISTRATOR,
      },
    });

    const actual = await registerNewUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "ok",
      data: expect.objectContaining({
        id: expect.any(String),
        name: "testuser",
        role: UserRole.NORMAL,
      }),
    });
  });
});
