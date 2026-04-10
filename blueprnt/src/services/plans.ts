import { client } from '@/services/client';
import type { Plan, PlanDifficulty, PlanGoal, PlanType } from '@/types';

type GetPlansResponse = {
  plans: Plan[];
};

type CreatePlanInput = {
  userId: string;
  title: string;
  summary: string;
  description?: string;
  goal: PlanGoal;
  difficulty: PlanDifficulty;
  type: PlanType;
  durationWeeks: number;
  tags?: string[];
  imageUrl?: string;
};

export async function getPlans() {
  const response = await client.get<GetPlansResponse>('/plans');
  return response.plans;
}

export async function createPlan({ userId, ...body }: CreatePlanInput) {
  const response = await client.post<Plan | { plan: Plan }>(`/${userId}/plans`, body);
  return 'plan' in response ? response.plan : response;
}
