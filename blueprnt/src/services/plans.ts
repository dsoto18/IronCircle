import { client } from '@/services/client';
import type { Plan, PlanDay, PlanDifficulty, PlanGoal, PlanType, PlanWeek } from '@/types';

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

type PublishPlanInput = {
  planId: string;
  userId: string;
};

type CreateDayInput = {
  planId: string;
  userId: string;
  weekNumber: string | number;
  title: string;
  summary?: string;
  notes?: string;
  dayLabel?: string;
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
  const response = await client.post<PlanWeek | { week: PlanWeek }>(
    `/plans/${planId}/weeks`,
    body
  );
  return 'week' in response ? response.week : response;
}

export async function publishPlan({ planId, userId }: PublishPlanInput) {
  return client.post(`/plan/${planId}/publish`, { userId });
}

export async function createDay({ planId, weekNumber, ...body }: CreateDayInput) {
  const response = await client.post<PlanDay | { day: PlanDay }>(
    `/plans/${planId}/weeks/${weekNumber}/days`,
    body
  );
  return 'day' in response ? response.day : response;
}
