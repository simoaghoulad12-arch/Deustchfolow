import type { CEFRLevel } from '@deutschflow/types';

/**
 * Prompt bank for the practice modes. Brain-mode questions are asked in the
 * target language (that is the point: answer without translating first);
 * speaking topics and emotion scenarios are instructions in English so a
 * beginner always understands the task.
 */

type ByLevel = Partial<Record<CEFRLevel, string[]>>;

export const BRAIN_QUESTIONS: Record<string, ByLevel> = {
  de: {
    A1: [
      'Wie heißt du?',
      'Woher kommst du?',
      'Was trinkst du gern?',
      'Wie alt bist du?',
      'Wo wohnst du?',
      'Was isst du zum Frühstück?',
      'Hast du Geschwister?',
      'Welche Farbe magst du?',
      'Was machst du heute?',
      'Wie spät ist es?',
    ],
    A2: [
      'Was hast du gestern gemacht?',
      'Wohin fährst du im Urlaub?',
      'Was ist dein Lieblingsessen und warum?',
      'Wie kommst du zur Arbeit?',
      'Was machst du am Wochenende?',
      'Was hast du heute gekauft?',
      'Welchen Film hast du zuletzt gesehen?',
      'Warum lernst du Deutsch?',
    ],
    B1: [
      'Was würdest du mit einer Million Euro machen?',
      'Was ist der größte Vorteil vom Leben in der Stadt?',
      'Wie sieht dein perfekter Tag aus?',
      'Was hast du zuletzt Neues gelernt?',
      'Wie findest du soziale Medien?',
      'Welchen Beruf hättest du gern?',
    ],
    B2: [
      'Sollte Homeoffice ein Recht sein?',
      'Wie verändert künstliche Intelligenz unsere Arbeit?',
      'Was bedeutet Heimat für dich?',
      'Welche Erfindung hat die Welt am meisten verändert?',
      'Ist Tourismus gut oder schlecht für Städte?',
    ],
  },
  en: {
    A1: ['What is your name?', 'Where are you from?', 'What do you like to drink?', 'Where do you live?', 'What do you eat for breakfast?', 'Do you have any brothers or sisters?'],
    A2: ['What did you do yesterday?', 'Where do you go on holiday?', 'How do you get to work?', 'What is your favourite food and why?'],
    B1: ['What would you do with a million pounds?', 'What is your perfect day like?', 'What do you think about social media?'],
    B2: ['Should working from home be a right?', 'How is AI changing work?', 'Is tourism good or bad for cities?'],
  },
  es: {
    A1: ['¿Cómo te llamas?', '¿De dónde eres?', '¿Qué te gusta beber?', '¿Dónde vives?', '¿Qué desayunas?', '¿Tienes hermanos?'],
    A2: ['¿Qué hiciste ayer?', '¿Adónde vas de vacaciones?', '¿Cuál es tu comida favorita?', '¿Cómo vas al trabajo?'],
    B1: ['¿Qué harías con un millón de euros?', '¿Cómo es tu día perfecto?', '¿Qué opinas de las redes sociales?'],
    B2: ['¿Debería el teletrabajo ser un derecho?', '¿Cómo cambia la IA el trabajo?'],
  },
  fr: {
    A1: ['Comment tu t\'appelles ?', 'Tu viens d\'où ?', 'Qu\'est-ce que tu aimes boire ?', 'Où est-ce que tu habites ?', 'Qu\'est-ce que tu manges le matin ?'],
    A2: ['Qu\'est-ce que tu as fait hier ?', 'Où pars-tu en vacances ?', 'Quel est ton plat préféré ?'],
    B1: ['Que ferais-tu avec un million d\'euros ?', 'Comment serait ta journée parfaite ?'],
    B2: ['Le télétravail devrait-il être un droit ?', 'Comment l\'IA change-t-elle le travail ?'],
  },
  it: {
    A1: ['Come ti chiami?', 'Di dove sei?', 'Cosa ti piace bere?', 'Dove abiti?', 'Cosa mangi a colazione?'],
    A2: ['Cosa hai fatto ieri?', 'Dove vai in vacanza?', 'Qual è il tuo piatto preferito?'],
    B1: ['Cosa faresti con un milione di euro?', 'Com\'è la tua giornata perfetta?'],
    B2: ['Il lavoro da casa dovrebbe essere un diritto?', 'Come cambia l\'IA il lavoro?'],
  },
};

export const SPEAKING_TOPICS: Record<CEFRLevel, string[]> = {
  A1: [
    'Introduce yourself: your name, where you are from and where you live.',
    'Describe your family in a few sentences.',
    'Order breakfast at a café.',
    'Describe your home.',
    'Say what you do on a normal day.',
  ],
  A2: [
    'Tell me about your last weekend.',
    'Describe your favourite place in your city and why you like it.',
    'Explain how you get to work or school.',
    'Talk about a holiday you enjoyed.',
    'Describe your job or studies.',
  ],
  B1: [
    'Describe a challenge you overcame and what you learned.',
    'Give your opinion on living in a big city versus the countryside.',
    'Explain what you would change about your daily routine and why.',
    'Talk about a book or film that impressed you.',
  ],
  B2: [
    'Argue for or against a four-day working week.',
    'Explain how technology has changed the way people communicate.',
    'Present a project you are proud of as if in a job interview.',
    'Discuss whether cities should ban cars from their centres.',
  ],
  C1: ['Discuss the ethical limits of artificial intelligence.'],
};

export const EMOTION_TONES = ['friendly', 'formal', 'professional', 'angry', 'uncertain', 'enthusiastic', 'sarcastic', 'diplomatic'] as const;
export type EmotionTone = (typeof EMOTION_TONES)[number];

/**
 * Emotion & communication mode (spec section 25): the learner says the same
 * message in several tones, and the feedback explains how each tone changes
 * what a listener perceives.
 */
export const EMOTION_SCENARIOS: { message: string; tones: EmotionTone[]; level: CEFRLevel }[] = [
  { message: 'Tell your flatmate that the kitchen is dirty again.', tones: ['friendly', 'angry', 'sarcastic'], level: 'A1' },
  { message: 'Say that you cannot come to the party on Saturday.', tones: ['friendly', 'formal', 'uncertain'], level: 'A1' },
  { message: 'Tell a friend that you got the job.', tones: ['enthusiastic', 'uncertain', 'friendly'], level: 'A1' },
  { message: 'Tell the waiter that your soup is cold.', tones: ['friendly', 'angry', 'diplomatic'], level: 'A2' },
  { message: 'Ask a colleague to move the meeting to Friday.', tones: ['professional', 'friendly', 'uncertain'], level: 'A2' },
  { message: 'Tell your landlord that the heating is still broken.', tones: ['formal', 'angry', 'sarcastic'], level: 'A2' },
  { message: 'Tell your team that the deadline has moved forward by a week.', tones: ['professional', 'enthusiastic', 'diplomatic'], level: 'B1' },
  { message: 'Disagree with a friend who wants to spend the holiday at the beach.', tones: ['diplomatic', 'sarcastic', 'enthusiastic'], level: 'B1' },
  { message: 'Reply to a customer whose order arrived late.', tones: ['formal', 'professional', 'diplomatic'], level: 'B1' },
  { message: 'Tell a supplier that the wrong goods were delivered for the third time.', tones: ['professional', 'angry', 'diplomatic'], level: 'B2' },
  { message: 'React to your manager\'s proposal to cut the project budget.', tones: ['diplomatic', 'uncertain', 'sarcastic'], level: 'B2' },
  { message: 'Announce a new company policy on remote work.', tones: ['formal', 'enthusiastic', 'professional'], level: 'B2' },
];

export function pickForLevel<T>(byLevel: Partial<Record<CEFRLevel, T[]>>, level: CEFRLevel): T[] {
  const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const idx = order.indexOf(level);
  // Current level first, then easier levels as fallback.
  for (let i = idx; i >= 0; i--) {
    const list = byLevel[order[i]!];
    if (list && list.length) return list;
  }
  return [];
}
