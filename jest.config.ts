import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  testEnvironment: "node",
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
