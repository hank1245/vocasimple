import { vocabularyKeys } from "@/utils/queryClient";

describe("vocabularyKeys", () => {
  test("lists and list produce stable keys", () => {
    expect(vocabularyKeys.all).toEqual(["vocabulary"]);
    expect(vocabularyKeys.lists()).toEqual(["vocabulary", "list"]);
    expect(vocabularyKeys.list("u1", "all")).toEqual([
      "vocabulary",
      "list",
      "u1",
      "all",
    ]);
    expect(vocabularyKeys.detail("id-1")).toEqual([
      "vocabulary",
      "detail",
      "id-1",
    ]);
  });
});
