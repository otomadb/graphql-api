import { execFile } from "node:child_process";
import { promisify } from "node:util";

import * as dotenv from "dotenv";
import path from "path";

export async function setup() {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.test.local"),
    override: true,
  });

  await promisify(execFile)("prisma", ["migrate", "reset", "--force"], {
    env: { ...process.env, PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL },
  });
}
