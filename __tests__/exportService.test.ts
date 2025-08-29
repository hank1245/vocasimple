import { convertToCSV, escapeCSVField, CsvVocabularyItem } from "@/utils/csv";

// Ensure AsyncStorage mock does not interfere
jest.mock("@react-native-async-storage/async-storage");

describe("exportService", () => {
  const items: CsvVocabularyItem[] = [
    {
      id: "1",
      word: "hello",
      meaning: "안녕하세요",
      example: "hello, world",
      created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
    },
    {
      id: "2",
      word: "comma,quote",
      meaning: '쉼표와 "따옴표"',
      example: "line1\nline2",
      created_at: new Date("2024-02-02T10:00:00Z").toISOString(),
    },
  ];

  test("escapeCSVField handles commas, quotes, and newlines", () => {
    expect(escapeCSVField("a,b")).toBe('"a,b"');
    expect(escapeCSVField('a"b')).toBe('"a""b"');
    expect(escapeCSVField("a\nb")).toBe('"a\nb"');
    expect(escapeCSVField("plain")).toBe("plain");
    expect(escapeCSVField("")).toBe("");
  });

  test("convertToCSV produces header when empty", () => {
    const csv = convertToCSV([]);
    expect(csv).toBe("Word,Meaning,Example,Registration Date\n");
  });

  test("convertToCSV formats rows and dates", () => {
    const csv = convertToCSV(items);
    // Header present
    expect(csv.startsWith("Word,Meaning,Example,Registration Date\n")).toBe(
      true
    );
    // Row should include quoted fields for commas/quotes/newlines
    expect(csv).toContain('"comma,quote"');
    expect(csv).toContain('"쉼표와 ""따옴표"""');
    expect(csv).toContain('"line1\nline2"');
  });

  // Intentionally keep tests focused on pure functions for readability
});
