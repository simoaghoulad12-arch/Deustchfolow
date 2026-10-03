import type { Copy } from '../copy';

interface WorldPage {
  indexTitle: string;
  indexDescription: string;
  world: (index: string) => string;
  palette: (world: string) => string;
  pieces: string;
  inCollection: (n: number) => string;
  others: string;
  enter: string;
}

export const worldPage: Copy<WorldPage> = {
  en: {
    indexTitle: 'Worlds — Sports, Clothing, Hybrid',
    indexDescription:
      'Three worlds inside NATYSIMO: Sports (performance, training), Clothing (streetwear, lifestyle) and Hybrid (gym to street).',
    world: (index) => `World ${index}`,
    palette: (world) => `${world} palette`,
    pieces: 'The pieces',
    inCollection: (n) => `${n} in Collection 01`,
    others: 'Other worlds',
    enter: 'Enter',
  },
  ar: {
    indexTitle: 'العوالم — رياضة، ملابس، هجين',
    indexDescription:
      'ثلاثة عوالم داخل NATYSIMO: الرياضة (الأداء والتدريب)، والملابس (ستريت وير وأسلوب حياة)، والهجين (من النادي إلى الشارع).',
    world: (index) => `العالم ${index}`,
    palette: (world) => `ألوان ${world}`,
    pieces: 'القطع',
    inCollection: (n) => `${n} في المجموعة 01`,
    others: 'عوالم أخرى',
    enter: 'ادخل',
  },
};
