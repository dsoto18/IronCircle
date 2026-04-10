import { client } from '@/services/client';
import type { Plan, PlanDifficulty, PlanGoal, PlanType, PlanWeek } from '@/types';

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

type CreateWeekInput = {
  planId: string;
  userId: string;
  title: string;
  summary: string;
  notes?: string;
};

export async function getPlans() {
  const response = await client.get<GetPlansResponse>('/plans');
  return response.plans;
}

export async function createPlan({ userId, ...body }: CreatePlanInput) {
  const response = await client.post<Plan | { plan: Plan }>(`/${userId}/plans`, body);
  return 'plan' in response ? response.plan : response;
}

export async function createWeek({ planId, ...body }: CreateWeekInput) {
  console.log("Plan ID: ", planId)
  const response = await client.post<PlanWeek | { week: PlanWeek }>(
    `/plans/${planId}/weeks`,
    body
  );
  return 'week' in response ? response.week : response;
}
