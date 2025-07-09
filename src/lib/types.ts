export interface Folder {
  id: string;
  userId: string;
  name: string;
  order: number;
  createdAt: Date;
}

export interface Topic {
  id: string;
  userId: string;
  folderId: string | null;
  title: string;
  tags: string[];
  content: string;
  summary: string;
  order: number;
  createdAt: Date;
  lastStudiedAt?: Date;
}

export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  example: string;
}

export interface TestQuestion {
  id: string;
  topicId: string;
  type: 'multiple_choice' | 'true_false';
  question: string;
  options?: string[];
  answer: string;
}

export interface UserPerformance {
    [topicId: string]: {
        score: number; // 0-100
        lastTestDate: Date;
    }
}
