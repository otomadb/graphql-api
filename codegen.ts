import { type CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:8080/graphql",
  documents: ["graphql/schema**/*.gql"],
  generates: {
    "./src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
