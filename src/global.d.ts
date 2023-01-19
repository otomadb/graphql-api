/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly HOST?: string;
    readonly PORT?: string;

    readonly NODE_ENV: "development" | "production";

    readonly DATABASE_URL: string;
    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;
  }
}
