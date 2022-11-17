import { GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";

export const GraphQLNonNullId = new GraphQLNonNull(GraphQLID);
export const GraphQLNonNullString = new GraphQLNonNull(GraphQLString);
export const GraphQLNonNullBoolean = new GraphQLNonNull(GraphQLBoolean);
