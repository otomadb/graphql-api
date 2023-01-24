/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly HOST?: string;
    readonly PORT?: string;

    readonly NODE_ENV: "development" | "production";

    readonly POSTGRES_HOST: string;
    readonly POSTGRES_PORT: string;
    readonly POSTGRES_USERNAME: string;
    readonly POSTGRES_PASSWORD: string;
    readonly POSTGRES_DATABASE: string;

    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;
  }
}
