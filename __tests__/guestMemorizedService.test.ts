import AsyncStorage from "@react-native-async-storage/async-storage";
import { guestMemorizedService } from "@/utils/guestMemorizedService";

jest.mock("@react-native-async-storage/async-storage");

describe("guestMemorizedService", () => {
  beforeEach(() => {
    // @ts-expect-error test helper on mock
    AsyncStorage.__reset?.();
  });

  test("mark/get/clear memorized words", async () => {
    const ok = await guestMemorizedService.markWordsAsMemorized([
      { id: "1", word: "apple", meaning: "사과" },
      { id: "2", word: "banana", meaning: "바나나" },
    ]);
    expect(ok).toBe(true);

    const list = await guestMemorizedService.getMemorizedWords();
    expect(list).toHaveLength(2);
    expect(list[0]).toHaveProperty("memorizedAt");

    const is1 = await guestMemorizedService.isWordMemorized("1");
    expect(is1).toBe(true);

    const count = await guestMemorizedService.getMemorizedWordsCount();
    expect(count).toBe(2);

    await guestMemorizedService.markWordsAsUnmemorized(["1"]);
    const list2 = await guestMemorizedService.getMemorizedWords();
    expect(list2.map((w) => w.wordId)).not.toContain("1");

    const cleared = await guestMemorizedService.clearMemorizedWords();
    expect(cleared).toBe(true);
    const empty = await guestMemorizedService.getMemorizedWords();
    expect(empty).toHaveLength(0);
  });

  test("de-duplicates entries on markWordsAsMemorized", async () => {
    await guestMemorizedService.markWordsAsMemorized([
      { id: "1", word: "a", meaning: "a" },
    ]);
    await guestMemorizedService.markWordsAsMemorized([
      { id: "1", word: "a", meaning: "a" },
    ]);
    const list = await guestMemorizedService.getMemorizedWords();
    expect(list.filter((w) => w.wordId === "1")).toHaveLength(1);
  });
});
