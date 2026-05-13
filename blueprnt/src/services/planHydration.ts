import type {
  FullPlanItem,
  HydratedPlanDraft,
  PlanBlock,
  PlanDay,
  PlanItem,
  PlanWeek,
} from '@/types';

type FullPlanMeta = Extract<FullPlanItem, { entity: 'Plan' }>;

export function getWeekKey(week: Pick<PlanWeek, 'planId' | 'weekNumber'>) {
  return `${week.planId}-${week.weekNumber}`;
}

export function getDayKey(day: Pick<PlanDay, 'planId' | 'weekNumber' | 'dayNumber'>) {
  return `${day.planId}-${day.weekNumber}-${day.dayNumber}`;
}

export function getBlockKey(
  block: Pick<PlanBlock, 'planId' | 'weekNumber' | 'dayNumber' | 'blockNumber'>
) {
  return `${block.planId}-${block.weekNumber}-${block.dayNumber}-${block.blockNumber}`;
}

export function buildHydratedPlanDraft(items: FullPlanItem[]): HydratedPlanDraft | null {
  const plan = items.find(
    (item): item is FullPlanMeta =>
      item.entity === 'Plan' &&
      'goal' in item &&
      'difficulty' in item &&
      'durationWeeks' in item &&
      'type' in item
  );

  if (!plan) {
    return null;
  }

  const weeks = items
    .filter((item): item is PlanWeek => item.entity === 'PlanWeek')
    .sort((a, b) => a.weekNumber - b.weekNumber);

  const days = items
    .filter((item): item is PlanDay => item.entity === 'PlanDay')
    .sort((a, b) => a.weekNumber - b.weekNumber || a.dayNumber - b.dayNumber);

  const blocks = items
    .filter((item): item is PlanBlock => item.entity === 'PlanBlock')
    .sort(
      (a, b) =>
        a.weekNumber - b.weekNumber ||
        a.dayNumber - b.dayNumber ||
        a.blockNumber - b.blockNumber
    );

  const planItems = items
    .filter((item): item is PlanItem => item.entity === 'PlanItem')
    .sort(
      (a, b) =>
        a.weekNumber - b.weekNumber ||
        a.dayNumber - b.dayNumber ||
        a.blockNumber - b.blockNumber ||
        a.order - b.order
    );

  const daysByWeek = weeks.reduce<Record<string, PlanDay[]>>((acc, week) => {
    acc[getWeekKey(week)] = days.filter((day) => day.weekNumber === week.weekNumber);
    return acc;
  }, {});

  const blocksByDay = days.reduce<Record<string, PlanBlock[]>>((acc, day) => {
    acc[getDayKey(day)] = blocks.filter(
      (block) => block.weekNumber === day.weekNumber && block.dayNumber === day.dayNumber
    );
    return acc;
  }, {});

  const itemsByBlock = blocks.reduce<Record<string, PlanItem[]>>((acc, block) => {
    acc[getBlockKey(block)] = planItems.filter(
      (item) =>
        item.weekNumber === block.weekNumber &&
        item.dayNumber === block.dayNumber &&
        item.blockNumber === block.blockNumber
    );
    return acc;
  }, {});

  return {
    plan,
    weeks,
    daysByWeek,
    blocksByDay,
    itemsByBlock,
  };
}
