/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
const config = {
  testMatch: ["**/*.test.(ts|js)", "**/*.test.(tsx|jsx)"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/test/", "<rootDir>/dist/"],
  transformIgnorePatterns: ["/node_modules/"],
  transform: {
    ".+\\.(t|j)sx?$": ["ts-jest", { useESM: true }],
  },
};

module.exports = config;
