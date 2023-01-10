import { resolveHistory } from "./index.js";

describe("resolver Tag.history", () => {
  it("実装されているか", () => {
    expect(resolveHistory).toBeDefined();
  });

  it("現状は空配列を返す", () => {
    const actual = resolveHistory();
    expect(actual).toStrictEqual({ nodes: [] });
  });
});
