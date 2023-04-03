// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-process-env */
import { createServer } from "node:http";

import { ResolveUserFn, useGenericAuth, ValidateUserFn } from "@envelop/generic-auth";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { PrismaClient } from "@prisma/client";
import { ListValueNode, StringValueNode } from "graphql";
import { createSchema, createYoga, useLogger, useReadinessCheck } from "graphql-yoga";
import jwt, { GetPublicKeyOrSecret, Jwt } from "jsonwebtoken";
import createJwksClient from "jwks-rsa";
import { MeiliSearch } from "meilisearch";
import neo4j from "neo4j-driver";
import { pino } from "pino";
import z from "zod";

import { makeResolvers } from "./resolvers/index.js";
import { CurrentUser, ServerContext, UserContext } from "./resolvers/types.js";
import typeDefs from "./schema.graphql";

const jwksClient = createJwksClient({ jwksUri: "http://localhost:3000/api/auth/jwt/jwks.json" }); // TODO: 環境変数に直す
const getPublicKey: GetPublicKeyOrSecret = async (header, callback) => {
  const key = await jwksClient.getSigningKey();
  callback(null, key.getPublicKey());
};

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "trace",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {},
      },
      {
        target: "pino/file",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {
          destination: "logs/out.log",
          mkdir: true,
        },
      },
    ],
  },
});

const prismaClient = new PrismaClient();

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const meilisearchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
});

const yoga = createYoga<ServerContext, UserContext>({
  graphiql: process.env.ENABLE_GRAPHIQL === "true",
  schema: createSchema({
    typeDefs,
    resolvers: makeResolvers({
      neo4j: neo4jDriver,
      prisma: prismaClient,
      meilisearch: meilisearchClient,
      logger,
    }),
  }),
  cors: (request) => {
    const origin = request.headers.get("origin");
    return {
      origin: origin || [],
      credentials: true,
    };
  },
  plugins: [
    useGenericAuth({
      mode: "protect-granular",
      resolveUserFn: (async ({ req }) => {
        const token = req.headers.authorization?.split(" ").at(1);
        if (token) {
          const decoded = await new Promise<Jwt | undefined>((res, rej) =>
            jwt.verify(token, getPublicKey, { complete: true }, (err, decoded) => {
              if (err) return rej(err);
              else res(decoded);
            })
          );
          const payload = z
            .object({ "sub": z.string(), "st-perm": z.object({ v: z.array(z.string()) }) })
            .safeParse(decoded?.payload);
          if (!payload.success) {
            logger.error({ error: payload.error }, "Unexpected token payload");
            return null;
          }
          const {
            "st-perm": { v: permissions },
            "sub": userId,
          } = payload.data;
          logger.trace(payload.data);
          return {
            id: userId,
            role: "NORMAL", // TODO: 削除
            permissions: permissions || [],
          };
        }
        return null;
      }) satisfies ResolveUserFn<CurrentUser, ServerContext>,
      validateUser: (({ user, fieldAuthDirectiveNode }) => {
        const valueNode = fieldAuthDirectiveNode?.arguments?.find((arg) => arg.name.value === "permissions")?.value as
          | ListValueNode
          | undefined;
        const requirePermissions = valueNode?.values.map((v) => (v as StringValueNode).value) || [];
        const missingPermission = requirePermissions.find((p) => !user?.permissions.includes(p));
        if (missingPermission) {
          logger.error({ user, missingPermission }, "Missing permission");
          throw new Error(`Missing permission: ${missingPermission}`);
        }
        return;
      }) satisfies ValidateUserFn<CurrentUser>,
    }),
    useDisableIntrospection({
      isDisabled() {
        return false; // TODO: 何かしら認証を入れる
      },
    }),
    useReadinessCheck({
      check: async () => {
        try {
          await Promise.all([
            prismaClient.$queryRaw`SELECT 1`
              .catch(async (e) => {
                logger.warn({ error: e }, "Prisma is not ready, reconnecting.");
                await prismaClient.$connect();
              })
              .catch((e) => {
                logger.error({ error: e }, "Prisma is not ready, reconnecting failed.");
                throw e;
              }),
            neo4jDriver.getServerInfo().catch((e) => {
              logger.error({ error: e }, "Neo4j is not ready.");
              throw e;
            }),
          ]);
        } catch {
          return false;
        }
      },
    }),
    /*
    usePrometheus({
      execute: true,
      errors: true,
      requestCount: true,
      requestSummary: true,
    }),
    */
    useLogger({
      logFn(event, data) {
        switch (event) {
          case "execute-end":
            logger.info(
              {
                // query: print(data.args.document),
                operation: data.args.operationName,
                variables: data.args.variableValues || {},
                user: data.args.contextValue.user,
                errors: data.result.errors,
              },
              "GraphQL Executed"
            );
            break;
        }
      },
    }),
  ],
});

const server = createServer(yoga);
server.listen(8080, () => {
  logger.info("Server is running on http://localhost:8080");
});
