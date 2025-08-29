import AsyncStorage from "@react-native-async-storage/async-storage";
import { localVocabularyApi } from "@/utils/localVocabularyApi";
import { guestMemorizedService } from "@/utils/guestMemorizedService";

jest.mock("@react-native-async-storage/async-storage");

describe("localVocabularyApi", () => {
  const STORAGE_KEY = "vocabulary_words";

  beforeEach(async () => {
    // @ts-expect-error test helper on mock
    AsyncStorage.__reset?.();
  });

  const seed = async () => {
    const words = [
      {
        id: "a1",
        word: "apple",
        meaning: "사과",
        group: "Fruits",
        is_memorized: false,
      },
      {
        id: "b2",
        word: "banana",
        meaning: "바나나",
        group: "Fruits",
        is_memorized: true,
      },
      {
        id: "c3",
        word: "cat",
        meaning: "고양이",
        group: "Animals",
        is_memorized: false,
      },
    ];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    return words;
  };

  test("fetchVocabulary returns all and respects filters", async () => {
    await seed();
    const all = await localVocabularyApi.fetchVocabulary("user-1", "all");
    const mem = await localVocabularyApi.fetchVocabulary("user-1", "memorized");
    const unmem = await localVocabularyApi.fetchVocabulary(
      "user-1",
      "unmemorized"
    );
    expect(all).toHaveLength(3);
    expect(mem.every((w) => w.is_memorized)).toBe(true);
    expect(unmem.every((w) => !w.is_memorized)).toBe(true);
  });

  test("create, update, delete word", async () => {
    await seed();
    const created = await localVocabularyApi.createWord(
      { word: "dog", meaning: "개", group: "Animals", example: "" },
      "user-1"
    );
    expect(created.id).toBeTruthy();

    const updated = await localVocabularyApi.updateWord(
      created.id,
      { meaning: "강아지" },
      "user-1"
    );
    expect(updated.meaning).toBe("강아지");

    await localVocabularyApi.deleteWord(created.id, "user-1");
    const all = await localVocabularyApi.fetchVocabulary("user-1", "all");
    expect(all.find((w) => w.id === created.id)).toBeUndefined();
  });

  test("markWordsAsMemorized/Unmemorized for normal user updates flags", async () => {
    await seed();
    await localVocabularyApi.markWordsAsMemorized(["a1", "c3"], "user-1");
    let all = await localVocabularyApi.fetchVocabulary("user-1", "all");
    expect(all.find((w) => w.id === "a1")?.is_memorized).toBe(true);
    expect(all.find((w) => w.id === "c3")?.is_memorized).toBe(true);

    await localVocabularyApi.markWordsAsUnmemorized(["b2"], "user-1");
    all = await localVocabularyApi.fetchVocabulary("user-1", "all");
    expect(all.find((w) => w.id === "b2")?.is_memorized).toBe(false);
  });

  test("guest user path delegates to guestMemorizedService", async () => {
    await seed();
    const spyMark = jest
      .spyOn(guestMemorizedService, "markWordsAsMemorized")
      .mockResolvedValue(true);
    const spyIds = jest
      .spyOn(guestMemorizedService, "getMemorizedWordIds")
      .mockResolvedValue(["a1"]);
    const spyUnmark = jest
      .spyOn(guestMemorizedService, "markWordsAsUnmemorized")
      .mockResolvedValue(true);

    await localVocabularyApi.markWordsAsMemorized(["a1"], "guest_user");
    expect(spyMark).toHaveBeenCalled();

    const fetched = await localVocabularyApi.fetchVocabulary(
      "guest_user",
      "memorized"
    );
    expect(spyIds).toHaveBeenCalled();
    expect(fetched.map((w) => w.id)).toContain("a1");

    await localVocabularyApi.markWordsAsUnmemorized(["a1"], "guest_user");
    expect(spyUnmark).toHaveBeenCalledWith(["a1"]);
  });
});
