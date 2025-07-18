export type QuizMode = "meaning" | "word";

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  group: string;
  example?: string;
  user_id?: string;
  is_memorized?: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: VocabularyWord[];
}
