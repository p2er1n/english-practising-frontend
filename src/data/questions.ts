export interface Question {
  id: number;
  text: string;
  blanks: string[];
  audio: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "The quick brown fox _ over the lazy _.",
    blanks: ["jumps", "dog"],
    audio: "/audio/sentence1.mp3"
  },
  {
    id: 2,
    text: "I _ to the store to _ some groceries.",
    blanks: ["went", "buy"],
    audio: "/audio/sentence2.mp3"
  },
  {
    id: 3,
    text: "She _ reading a book while he _ TV.",
    blanks: ["was", "watched"],
    audio: "/audio/sentence3.mp3"
  }
]; 