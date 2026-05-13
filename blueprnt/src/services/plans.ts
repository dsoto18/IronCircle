import { getAuthHeaders, getCurrentUserId } from '@/services/authSession';
import { client } from '@/services/client';
import type {
  FullPlanItem,
  Plan,
  PlanBlock,
  PlanDay,
  PlanDifficulty,
  PlanGoal,
  PlanItem,
  PlanItemType,
  PlanType,
  PlanWeek,
  UserPlan,
} from '@/types';

type GetPlansResponse = {
  plans: Plan[];
};

type GetUserPlansResponse = {
  Items: UserPlan[];
};

type GetFullPlanResponse = {
  Items: FullPlanItem[];
};

type CreatePlanInput = {
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
  title: string;
  summary: string;
  notes?: string;
};

type PublishPlanInput = {
  planId: string;
  createdAt: string;
};

type CreateDayInput = {
  planId: string;
  weekNumber: string | number;
  title: string;
  summary?: string;
  notes?: string;
  dayLabel?: string;
};

type CreateBlockInput = {
  planId: string;
  weekNumber: string | number;
  dayNumber: string | number;
  title: string;
  summary: string;
  notes?: string;
};

type CreateItemInput = {
  planId: string;
  weekNumber: string | number;
  dayNumber: string | number;
  blockNumber: string | number;
  itemType: PlanItemType;
  title: string;
  description?: string;
  sets?: string;
  reps?: string;
  durationMin?: string;
  distance?: string;
  restSeconds?: string;
  intensity?: string;
  tempo?: string;
  videoUrl?: string;
  calories?: string;
  proteinGrams?: string;
  carbsGrams?: string;
  fatGrams?: string;
  ingredients?: string[];
  recipeUrl?: string;
};

export async function getPlans() {
  const response = await client.get<GetPlansResponse>('/plans');
  return response.plans;
}

export async function getUserPlans() {
  const userId = await getCurrentUserId();
  const response = await client.get<GetUserPlansResponse>(`/${userId}/plans`, {
    headers: await getAuthHeaders('accessToken'),
  });
  return response.Items;
}

export async function getFullPlan(planId: string) {
  const response = await client.get<GetFullPlanResponse>(`/plan/${planId}/full`, {
    headers: await getAuthHeaders('accessToken'),
  });
  return response.Items;
}

export async function createPlan(body: CreatePlanInput) {
  const response = await client.post<Plan | { plan: Plan }>(`/plans`, body, {
    headers: await getAuthHeaders('accessToken'),
  });
  return 'plan' in response ? response.plan : response;
}

export async function createWeek({ planId, ...body }: CreateWeekInput) {
  const response = await client.post<PlanWeek | { week: PlanWeek }>(
    `/plans/${planId}/weeks`,
    body,
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
  return 'week' in response ? response.week : response;
}

export async function publishPlan({ planId, createdAt }: PublishPlanInput) {
  return client.post(
    `/plan/${planId}/publish`,
    { createdAt },
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
}

export async function createDay({ planId, weekNumber, ...body }: CreateDayInput) {
  const response = await client.post<PlanDay | { day: PlanDay }>(
    `/plans/${planId}/weeks/${weekNumber}/days`,
    body,
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
  return 'day' in response ? response.day : response;
}

export async function createBlock({
  planId,
  weekNumber,
  dayNumber,
  ...body
}: CreateBlockInput) {
  const response = await client.post<PlanBlock | { block: PlanBlock }>(
    `/plans/${planId}/weeks/${weekNumber}/days/${dayNumber}/blocks`,
    body,
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
  return 'block' in response ? response.block : response;
}

export async function createItem({
  planId,
  weekNumber,
  dayNumber,
  blockNumber,
  ...body
}: CreateItemInput) {
  const response = await client.post<PlanItem | { item: PlanItem }>(
    `/plans/${planId}/weeks/${weekNumber}/days/${dayNumber}/blocks/${blockNumber}/items`,
    body,
    {
      headers: await getAuthHeaders('accessToken'),
    }
  );
  return 'item' in response ? response.item : response;
}
