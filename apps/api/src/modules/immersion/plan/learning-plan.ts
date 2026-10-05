import type { CEFRLevel } from '@deutschflow/types';

export interface PlanInput {
  languageName: string;
  startLevel: CEFRLevel;
  dailyMinutes: number;
  goals: string[];
  styles: string[];
  personalGoal: string | null;
}

export interface PlanActivity {
  kind: 'review' | 'mission' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing' | 'journal' | 'challenge';
  title: string;
  minutes: number;
  href: string;
}

export interface LearningPlanDoc {
  headline: string;
  targetLevel: CEFRLevel;
  estimatedWeeks: number;
  focusSkills: string[];
  dailyRoutine: PlanActivity[];
  weeks: { week: number; theme: string; activities: string[] }[];
}

/** Guided learning hours per CEFR step (Cambridge/Council of Europe ballpark figures). */
const HOURS_PER_LEVEL: Record<CEFRLevel, number> = { A1: 90, A2: 100, B1: 180, B2: 200, C1: 220 };

const GOAL_THEMES: Record<string, string[]> = {
  work: ['Introducing yourself at work', 'Meetings and small talk', 'Emails and phone calls', 'Solving problems with colleagues'],
  travel: ['Getting around', 'Hotels and restaurants', 'Asking for help', 'Unexpected travel problems'],
  study: ['Campus life', 'Asking questions in class', 'Group projects', 'Presenting your ideas'],
  everyday: ['Shopping and cafés', 'Neighbours and small talk', 'Appointments', 'Making plans with friends'],
  exam: ['Exam-style reading', 'Structured writing', 'Speaking under time pressure', 'Mock test'],
  relocation: ['Finding an apartment', 'Government offices', 'Doctor and pharmacy', 'Banking and contracts'],
  personal: ['Talking about yourself', 'Hobbies and culture', 'Opinions and stories', 'Debating ideas'],
};

const STYLE_TO_SKILL: Record<string, string> = {
  speaking: 'SPEAKING',
  listening: 'LISTENING',
  reading: 'READING',
  writing: 'WRITING',
  grammar: 'GRAMMAR',
  vocabulary: 'VOCABULARY',
};

const NEXT_LEVEL: Record<CEFRLevel, CEFRLevel> = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'B2', C1: 'C1' };

/** The plan's target: one CEFR step up, capped at B2 until C1 content exists. */
export function nextLevel(level: CEFRLevel): CEFRLevel {
  return NEXT_LEVEL[level];
}

/**
 * Deterministic personalised plan (spec section 5 "Personalized Learning
 * Plan"). Rule-based on purpose: the plan must exist even without AI, and
 * it is regenerated whenever the learner's level or preferences change.
 */
export function generateLearningPlan(input: PlanInput): LearningPlanDoc {
  const minutes = Math.max(5, Math.min(input.dailyMinutes, 120));
  const target = nextLevel(input.startLevel);
  const hours = HOURS_PER_LEVEL[input.startLevel];
  const estimatedWeeks = Math.max(4, Math.round((hours * 60) / (minutes * 6)));

  const preferred = input.styles.filter((s) => s !== 'mixed').map((s) => STYLE_TO_SKILL[s]).filter(Boolean) as string[];
  const focusSkills = preferred.length ? preferred.slice(0, 3) : ['SPEAKING', 'VOCABULARY', 'GRAMMAR'];

  const routine: PlanActivity[] = [];
  const add = (a: PlanActivity) => routine.push(a);
  add({ kind: 'review', title: 'Review due words', minutes: minutes <= 5 ? 2 : 3, href: '/words' });
  if (minutes <= 5) {
    add({ kind: 'mission', title: 'One short mission scene', minutes: 3, href: '/world' });
  } else {
    add({ kind: 'mission', title: 'Live a mission', minutes: Math.round(minutes * 0.45), href: '/world' });
    const third = focusSkills.includes('GRAMMAR')
      ? ({ kind: 'grammar', title: 'Grammar in context', href: '/grammar' } as const)
      : focusSkills.includes('WRITING')
        ? ({ kind: 'journal', title: 'Journal entry', href: '/journal' } as const)
        : ({ kind: 'speaking', title: 'Speaking practice', href: '/speak' } as const);
    add({ ...third, minutes: Math.round(minutes * 0.25) });
    if (minutes >= 20) add({ kind: 'challenge', title: 'Daily challenge', minutes: Math.round(minutes * 0.15), href: '/home#challenge' });
    if (minutes >= 30) add({ kind: 'speaking', title: 'Brain mode sprint', minutes: 5, href: '/brain' });
  }
  // The mission absorbs rounding so the routine always adds up to the chosen time.
  const firstMission = routine.find((a) => a.kind === 'mission');
  if (firstMission) {
    const others = routine.reduce((s, a) => (a === firstMission ? s : s + a.minutes), 0);
    firstMission.minutes = Math.max(1, minutes - others);
  }

  const themes = (input.goals.length ? input.goals : ['everyday']).flatMap((g) => GOAL_THEMES[g] ?? []);
  const uniqueThemes = [...new Set(themes)];
  const weeks = [0, 1, 2, 3].map((i) => ({
    week: i + 1,
    theme: uniqueThemes[i % Math.max(uniqueThemes.length, 1)] ?? 'Everyday conversations',
    activities: [
      `${Math.max(2, Math.round(minutes / 8))} missions in the ${input.languageName} world`,
      i === 3 ? 'Checkpoint: a harder mission and a progress review' : `Grammar focus for ${input.startLevel}`,
      focusSkills.includes('SPEAKING') ? 'Speaking + Brain mode sessions' : 'Vocabulary reviews every day',
    ],
  }));

  const goalText = input.personalGoal?.trim()
    ? `“${input.personalGoal.trim()}”`
    : `real ${input.languageName} conversations`;

  return {
    headline: `${minutes} minutes a day takes you from ${input.startLevel} to ${target} in about ${estimatedWeeks} weeks — built around ${goalText}.`,
    targetLevel: target,
    estimatedWeeks,
    focusSkills,
    dailyRoutine: routine,
    weeks,
  };
}
