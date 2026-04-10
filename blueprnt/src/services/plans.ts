import { client } from '@/services/client';
import type { Plan } from '@/types';

type GetPlansResponse = {
  plans: Plan[];
};

export async function getPlans() {
  const response = await client.get<GetPlansResponse>('/plans');
  return response.plans;
}
