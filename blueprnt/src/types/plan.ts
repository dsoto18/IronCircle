export type PlanGoal =
  | 'marathon-training'
  | 'muscle-building'
  | 'strength-training'
  | 'weight-loss'
  | 'flexibility-mindfulness'
  | 'hyrox'
  | 'general-fitness';

export type PlanDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type PlanType = 'workout' | 'meal' | 'hybrid';

export type PlanStatus = 'waiting' | 'started' | 'in-progress' | 'done';

export type Plan = {
  PK: string;
  SK: string;
  entity: 'PLAN';
  creatorId: string;
  title: string;
  summary: string;
  description?: string;
  goal: PlanGoal;
  difficulty: PlanDifficulty;
  durationWeeks: number;
  type: PlanType;
  tags?: string[];
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};
