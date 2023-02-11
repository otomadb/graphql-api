/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly DOMAIN?: string;

    readonly NODE_ENV: "development" | "production";

    readonly ENABLE_GRAPHIQL?: string;

    readonly PRISMA_DATABASE_URL: string;

    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;
  }
}
