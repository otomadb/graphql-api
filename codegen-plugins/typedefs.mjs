// https://github.com/dotansimha/graphql-code-generator/issues/3899#issuecomment-797670712

import { printSchemaWithDirectives } from "@graphql-tools/utils";
import { stripIgnoredCharacters } from "graphql";

const print = (schema) => `
  import { gql } from "graphql-tag"
  export const typeDefs = gql\`${schema}\`;
`;

export const plugin = (schema) => print(stripIgnoredCharacters(printSchemaWithDirectives(schema)));
