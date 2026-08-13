export interface IdealAnswer {
  coreIdea: string;
  keyPoints: string[];
  example?: string;
  exampleLanguage?: string;
}

export interface Question {
  id: string;
  difficulty: 'Foundation' | 'Advanced';
  category: 'Knowledge' | 'Practical' | 'Architecture' | 'Security';
  question: string;
  idealAnswer: IdealAnswer;
  commonPitfalls: string[];
  whyThisMatters: string[];
  followUps: string[];
  redFlags: string[];
  scoringRubric: {
    1: string;
    3: string;
    5: string;
  };
  expectedTime: string;
}

export interface RoleData {
  id: string;
  role: string;
  snapshot: string;
  coreCompetencies: string[];
  questions: {
    Foundation: Question[];
    Advanced: Question[];
  };
}
