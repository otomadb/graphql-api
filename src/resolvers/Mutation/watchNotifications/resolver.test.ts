import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";

import { buildGqlId } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { resolverWatchNotifications } from "./resolver.js";

describe("Mutation.watchNotifications", () => {
  describe("Input check", () => {
    let deps: DeepMockProxy<ResolverDeps>;
    let resolver: ReturnType<typeof resolverWatchNotifications>;

    beforeAll(async () => {
      deps = mockDeep<ResolverDeps>();
      resolver = resolverWatchNotifications(deps);
    });

    beforeEach(async () => {
      mockReset(deps);
    });

    test("GraphQLのIDとして異常な値を入れるとエラーになる", async () => {
      await expect(async () => {
        await resolver(
          mockDeep<Parameters<typeof resolver>[0]>(),
          { input: { notificationIds: [buildGqlId("Notification", "1"), "n2", buildGqlId("Notification", "3")] } },
          mockDeep<Parameters<typeof resolver>[2]>(),
          mockDeep<Parameters<typeof resolver>[3]>(),
        );
      }).rejects.toThrowError();
    });
  });
});
