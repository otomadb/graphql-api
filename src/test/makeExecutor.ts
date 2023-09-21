import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { YogaServerInstance } from "graphql-yoga";

import { ServerContext, UserContext } from "../resolvers/types.js";

export const makeExecutor = (yoga: YogaServerInstance<ServerContext, UserContext>) =>
  buildHTTPExecutor({
    fetch: yoga.fetch,
  });

/*
export const makeExecutor =
  (yoga: YogaServerInstance<ServerContext, UserContext>) =>
  <TResult, TVariables>({
    operation,
    variables,
    context,
  }: {
    operation: TypedDocumentNode<TResult, TVariables>;
    variables: TVariables;
    context?: UserContext;
  }): Promise<ExecutionResult<TResult>> =>
    Promise.resolve(
      yoga.fetch(
        "http://yoga/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            query: print(operation),
            variables,
          }),
        },
        context,
      ),
    ).then((response) => response.json());
*/
