export type PlanGoal = // matches API rules
  | 'marathon-training'
  | 'muscle-building'
  | 'strength-training'
  | 'weight-loss'
  | 'flexibility-mindfulness'
  | 'hiit'
  | 'general-fitness';

export type PlanDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type PlanType = 'workout' | 'meal' | 'hybrid';

export type PlanStatus = 'draft' | 'published' | 'archived'; // For creator-facing plan management features

export type ProgressStatus = 'waiting' | 'started' | 'in-progress' | 'done'; // Future use for User-Progress Tracking

export type Plan = {
  planId: string;
  userId: string;
  creator: string;
  title: string;
  summary: string;
  description?: string;
  goal: PlanGoal;
  difficulty: PlanDifficulty;
  durationWeeks: number;
  type: PlanType;
  tags?: string[];
  imageUrl?: string;
  rating?: number;
  enrollmentCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type PlanWeek = {
  PK: string;
  SK: string;
  entity: 'PlanWeek';
  planId: string;
  userId: string;
  weekNumber: number;
  title: string;
  summary: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanDay = {
  PK: string;
  SK: string;
  entity: string;
  planId: string;
  weekNumber: number;
  dayNumber: number;
  title?: string;
  summary?: string;
  notes?: string;
  dayLabel?: string;
  createdAt: string;
  updatedAt: string;
};
