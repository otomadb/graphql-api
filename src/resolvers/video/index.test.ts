import { VideoModel } from "../../graphql/models.js";
import { resolveHistory, resolveId } from "./index.js";

describe("resolver Video.id", () => {
  it("実装されているか", () => {
    expect(resolveId).toBeDefined();
  });

  it("prefixを付ける", () => {
    const actual = resolveId({ id: "1" } as VideoModel);
    expect(actual).toBe("video:1");
  });
});

describe("resolver Video.history", () => {
  it("実装されているか", () => {
    expect(resolveHistory).toBeDefined();
  });

  it("現状は空配列を返す", () => {
    const actual = resolveHistory();
    expect(actual).toStrictEqual([]);
  });
});
