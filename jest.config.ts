import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  testEnvironment: "node",
  testMatch: ["**/*.test.[jt]s?(x)", "!**/*.e2e.test.[jt]s?(x)"],
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    // "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.tsx?$": ["@swc/jest", {}],
  },
};

export default jestConfig;
