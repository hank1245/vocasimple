export interface CsvVocabularyItem {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  created_at: string;
}

// Escape CSV fields (handle commas, quotes, line breaks)
export function escapeCSVField(field: string): string {
  if (!field) return "";
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Convert vocabulary data to CSV format
export function convertToCSV(vocabularyData: CsvVocabularyItem[]): string {
  if (!vocabularyData || vocabularyData.length === 0) {
    return "Word,Meaning,Example,Registration Date\n";
  }

  const header = "Word,Meaning,Example,Registration Date\n";
  const rows = vocabularyData
    .map((item) => {
      const word = escapeCSVField(item.word);
      const meaning = escapeCSVField(item.meaning);
      const example = escapeCSVField(item.example || "");
      const createdAt = escapeCSVField(
        new Date(item.created_at).toLocaleDateString("ko-KR")
      );
      return `${word},${meaning},${example},${createdAt}`;
    })
    .join("\n");

  return header + rows;
}
