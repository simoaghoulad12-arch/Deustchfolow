import type { Correction, MistakeCategory } from '@deutschflow/types';

/**
 * Rule-based language knowledge for the MockAiProvider: a small,
 * high-precision set of the most common learner mistakes per target
 * language, plus natural-sounding phrase pools. This is what keeps the
 * product genuinely useful without an AI key — it is NOT a replacement
 * for a real model, and deliberately prefers missing a mistake over
 * "correcting" something that was fine.
 */

/** Regex groups with unmatched optional groups normalised to ''. */
type Groups = (i: number) => string;

interface CorrectionRule {
  pattern: RegExp;
  replace: (m: Groups) => string;
  explanation: string;
  category: MistakeCategory;
  reuseTip: string;
}

const DE_MASC_NOUNS =
  'Kaffee|Tee|Saft|Orangensaft|Apfelsaft|Kuchen|Apfelstrudel|Espresso|Cappuccino|Latte|Milchkaffee|Toast|Salat|Burger|Hamburger|Tisch|Termin|Fahrschein|Zug|Bus|Arzt|Schlüssel|Wein|Löffel|Teller|Platz|Kellner|Pass|Koffer|Stadtplan|Rabatt|Job|Vertrag|Kredit|Computer|Drucker'.split(
    '|',
  );
const DE_ACC_VERBS = 'möchte|nehme|hätte gern|hätte gerne|brauche|bestelle|kaufe|suche|habe|hätte|will|nimmst|möchtest';

const DE_CONJ: Record<string, string> = {
  gehen: 'gehe',
  kommen: 'komme',
  haben: 'habe',
  sein: 'bin',
  machen: 'mache',
  trinken: 'trinke',
  essen: 'esse',
  wohnen: 'wohne',
  heißen: 'heiße',
  möchten: 'möchte',
  nehmen: 'nehme',
  arbeiten: 'arbeite',
  brauchen: 'brauche',
  suchen: 'suche',
  lernen: 'lerne',
  sprechen: 'spreche',
  fahren: 'fahre',
  bezahlen: 'bezahle',
};

const DE_MOTION_PARTICIPLES = 'gegangen|gefahren|gekommen|geflogen|gelaufen|geblieben|aufgestanden|angekommen|umgezogen';

const DE_LOWER_NOUNS = 'kaffee|tee|kuchen|wasser|milch|zucker|rechnung|zug|bahnhof|hotel|zimmer|arzt|termin|arbeit|wohnung|frage|problem|hilfe'.split('|');

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const RULES: Record<string, CorrectionRule[]> = {
  de: [
    {
      pattern: new RegExp(`\\b(${DE_ACC_VERBS})( gern| gerne| bitte| noch)? ein (${DE_MASC_NOUNS.join('|')})\\b`, 'i'),
      replace: (m) => `${m(1)}${m(2) ?? ''} einen ${m(3)}`,
      explanation:
        'After verbs like "möchten", "nehmen" or "brauchen" the object is in the accusative. Masculine nouns change "ein" to "einen".',
      category: 'GRAMMAR',
      reuseTip: 'Try it once more: order something masculine, e.g. "Ich nehme einen Tee."',
    },
    {
      pattern: /\bich (will)\b/i,
      replace: () => 'ich möchte',
      explanation:
        '"Ich will" is understandable but sounds demanding. "Ich möchte" or "Ich hätte gern" is the polite standard when ordering or asking.',
      category: 'REGISTER',
      reuseTip: 'Ask for something else using "Ich hätte gern …".',
    },
    {
      pattern: /\bich habe (\d+) jahre?( alt)?\b/i,
      replace: (m) => `ich bin ${m(1)} Jahre alt`,
      explanation: 'German uses "sein" for age: "Ich bin 25 Jahre alt", not "haben".',
      category: 'GRAMMAR',
      reuseTip: 'How old is a friend of yours? Say it with "Er/Sie ist …".',
    },
    {
      pattern: /\bich bin (hunger|durst)\b/i,
      replace: (m) => `ich habe ${cap(m(1).toLowerCase())}`,
      explanation: 'Hunger and thirst use "haben" in German: "Ich habe Hunger."',
      category: 'GRAMMAR',
      reuseTip: 'Say that you are thirsty.',
    },
    {
      pattern: new RegExp(`\\bich habe (${DE_MOTION_PARTICIPLES})\\b`, 'i'),
      replace: (m) => `ich bin ${m(1)}`,
      explanation:
        'Verbs of movement or change of state form the Perfekt with "sein": "Ich bin gegangen", not "Ich habe gegangen".',
      category: 'GRAMMAR',
      reuseTip: 'Tell me where you went yesterday, using "Ich bin … gefahren/gegangen".',
    },
    {
      pattern: new RegExp(`\\bich (${Object.keys(DE_CONJ).join('|')})\\b`, 'i'),
      replace: (m) => `ich ${DE_CONJ[m(1).toLowerCase()] ?? m(1)}`,
      explanation: 'With "ich" the verb takes the -e ending (or a special form): "ich gehe", "ich bin", "ich habe".',
      category: 'GRAMMAR',
      reuseTip: 'Describe one thing you do every morning, starting with "Ich …".',
    },
    {
      pattern: /\bweil (ich|du|er|sie|es|wir|ihr) (habe|hast|hat|haben|bin|bist|ist|sind|muss|musst|kann|kannst|will|möchte|arbeite|wohne|lerne|brauche) ([^.!?,]+)/i,
      replace: (m) => `weil ${m(1)} ${m(3).trim()} ${m(2)}`,
      explanation: 'In a "weil" clause the conjugated verb moves to the end: "…, weil ich keine Zeit habe."',
      category: 'SENTENCE_STRUCTURE',
      reuseTip: 'Give a reason with "weil" — remember: verb at the end.',
    },
    {
      pattern: /\bich komme von (marokko|deutschland|spanien|frankreich|italien|der türkei|syrien|ägypten|tunesien|algerien|polen|indien|china|brasilien)\b/i,
      replace: (m) => `ich komme aus ${cap(m(1))}`,
      explanation: 'For countries and cities of origin German uses "aus": "Ich komme aus Marokko."',
      category: 'WORD_CHOICE',
      reuseTip: 'Where does a friend come from? "Er/Sie kommt aus …".',
    },
    {
      pattern: /\bwie viel kostet\s*\?/i,
      replace: () => 'Wie viel kostet das?',
      explanation: 'German needs a subject here: "Wie viel kostet das?" or "Was kostet das?"',
      category: 'SENTENCE_STRUCTURE',
      reuseTip: 'Ask for the price of something specific, e.g. "Was kostet der Kuchen?"',
    },
    {
      pattern: new RegExp(`(?<![A-Za-zÄÖÜäöüß])(${DE_LOWER_NOUNS.join('|')})(?![A-Za-zÄÖÜäöüß])`),
      replace: (m) => cap(m(1)),
      explanation: 'All German nouns start with a capital letter.',
      category: 'SPELLING',
      reuseTip: 'Write one more sentence and check that every noun is capitalised.',
    },
  ],
  en: [
    {
      pattern: /\b(in) (the )?wrong (train|bus|plane)\b/i,
      replace: (m) => `on the wrong ${m(3)}`,
      explanation: 'With public transport English uses "on": "on the train", "on the bus".',
      category: 'GRAMMAR',
      reuseTip: 'Tell me which bus you take to work, using "on".',
    },
    {
      pattern: /\bi want (a|an|the|some) /i,
      replace: (m) => `I'd like ${m(1)} `,
      explanation: '"I want" can sound blunt. "I\'d like…" or "Could I have…" is the polite default.',
      category: 'REGISTER',
      reuseTip: 'Order something else using "Could I have…?"',
    },
    {
      pattern: /\bi am agree\b/i,
      replace: () => 'I agree',
      explanation: '"Agree" is a verb, so no "am": "I agree."',
      category: 'GRAMMAR',
      reuseTip: 'Say that you disagree with something — politely.',
    },
    {
      pattern: /\bi have (\d+) years( old)?\b/i,
      replace: (m) => `I am ${m(1)} years old`,
      explanation: 'English uses "to be" for age: "I am 25 years old."',
      category: 'GRAMMAR',
      reuseTip: 'How old is someone in your family?',
    },
    {
      pattern: /\b(he|she|it) (go|have|do|want|need|like|work|live)\b/i,
      replace: (m) => `${m(1)} ${m(2) === 'have' ? 'has' : m(2) === 'do' ? 'does' : m(2) === 'go' ? 'goes' : `${m(2)}s`}`,
      explanation: 'In the present simple, he/she/it takes an -s: "she works", "he goes", "it has".',
      category: 'GRAMMAR',
      reuseTip: 'Describe what a friend does every day.',
    },
    {
      pattern: /\binformations\b/i,
      replace: () => 'information',
      explanation: '"Information" is uncountable — no plural -s.',
      category: 'VOCABULARY',
      reuseTip: 'Ask for more information about something.',
    },
    {
      pattern: /\bdidn't (went|came|saw|bought|took)\b/i,
      replace: (m) =>
        `didn't ${({ went: 'go', came: 'come', saw: 'see', bought: 'buy', took: 'take' } as Record<string, string>)[m(1).toLowerCase()]}`,
      explanation: 'After "didn\'t" use the base form of the verb: "I didn\'t go".',
      category: 'GRAMMAR',
      reuseTip: 'Tell me something you didn\'t do last weekend.',
    },
    {
      pattern: /\bi am (living|working|studying) here since\b/i,
      replace: (m) => `I have been ${m(1)} here since`,
      explanation: 'With "since" English uses the present perfect (continuous): "I have been living here since 2020."',
      category: 'GRAMMAR',
      reuseTip: 'How long have you been learning English?',
    },
  ],
  es: [
    {
      pattern: /\b(yo )?quiero (un|una|el|la) /i,
      replace: (m) => `quisiera ${m(2)} `,
      explanation: '"Quiero" is fine among friends, but "quisiera" or "me pone…" sounds more polite when ordering.',
      category: 'REGISTER',
      reuseTip: 'Order a drink with "¿Me pone…?"',
    },
    {
      pattern: /\b(yo )?soy (\d+) años\b/i,
      replace: (m) => `tengo ${m(2)} años`,
      explanation: 'Spanish uses "tener" for age: "Tengo 25 años."',
      category: 'GRAMMAR',
      reuseTip: '¿Cuántos años tiene tu mejor amigo?',
    },
    {
      pattern: /\b(la) (problema|mapa|día|idioma)\b/i,
      replace: (m) => `el ${m(2)}`,
      explanation: `Some Spanish nouns ending in -a are masculine: "el problema", "el día", "el idioma".`,
      category: 'GRAMMAR',
      reuseTip: 'Describe a problem you had this week: "El problema es que…".',
    },
    {
      pattern: /\bestoy (médico|estudiante|profesor|profesora|ingeniero|enfermera)\b/i,
      replace: (m) => `soy ${m(1)}`,
      explanation: 'Professions use "ser", not "estar": "Soy estudiante."',
      category: 'GRAMMAR',
      reuseTip: '¿Y tu familia? ¿Qué son?',
    },
  ],
  fr: [
    {
      pattern: /\bje veux (un|une|le|la|du|de la) /i,
      replace: (m) => `je voudrais ${m(1)} `,
      explanation: '"Je veux" sounds abrupt. Use "je voudrais" or "je prendrai" when ordering.',
      category: 'REGISTER',
      reuseTip: 'Commande un dessert avec "Je voudrais…".',
    },
    {
      pattern: /\bje suis (\d+) ans\b/i,
      replace: (m) => `j'ai ${m(1)} ans`,
      explanation: 'French uses "avoir" for age: "J\'ai 25 ans."',
      category: 'GRAMMAR',
      reuseTip: 'Quel âge a ton frère ou ta sœur ?',
    },
    {
      pattern: /\bà le\b/i,
      replace: () => 'au',
      explanation: '"à + le" always contracts to "au".',
      category: 'GRAMMAR',
      reuseTip: 'Dis où tu vas ce soir : "Je vais au…".',
    },
    {
      pattern: /\bde le\b/i,
      replace: () => 'du',
      explanation: '"de + le" always contracts to "du".',
      category: 'GRAMMAR',
      reuseTip: 'Commande "du café" ou "du pain".',
    },
    {
      pattern: /\ble (table|chaise|carte|addition|gare|chambre)\b/i,
      replace: (m) => `la ${m(1)}`,
      explanation: 'This noun is feminine in French, so it takes "la" ("la table", "la carte").',
      category: 'GRAMMAR',
      reuseTip: 'Demande "l\'addition" à la fin du repas.',
    },
  ],
  it: [
    {
      pattern: /\bvoglio (un|una|il|la) /i,
      replace: (m) => `vorrei ${m(1)} `,
      explanation: '"Voglio" sounds demanding. "Vorrei" is the polite way to order.',
      category: 'REGISTER',
      reuseTip: 'Ordina un dolce con "Vorrei…".',
    },
    {
      pattern: /\bsono (\d+) anni\b/i,
      replace: (m) => `ho ${m(1)} anni`,
      explanation: 'Italian uses "avere" for age: "Ho 25 anni."',
      category: 'GRAMMAR',
      reuseTip: 'Quanti anni ha tua sorella?',
    },
    {
      pattern: /\bil (acqua|amico|albergo|ospedale)\b/i,
      replace: (m) => `l'${m(1)}`,
      explanation: 'Before a vowel the article becomes "l\'": "l\'acqua", "l\'albergo".',
      category: 'GRAMMAR',
      reuseTip: 'Chiedi dov\'è l\'albergo.',
    },
  ],
};

/** Finds learner mistakes in `text`. Returns at most `max` corrections, most important first. */
export function findCorrections(languageCode: string, text: string, max = 3): Correction[] {
  const rules = RULES[languageCode] ?? [];
  const results: Correction[] = [];
  for (const rule of rules) {
    if (results.length >= max) break;
    const match = rule.pattern.exec(text);
    if (!match) continue;
    const original = match[0];
    if (!original) continue;
    let better = rule.replace(groups(match));
    if (/^[A-ZÄÖÜ]/.test(original) && !/^[A-ZÄÖÜ]/.test(better)) {
      better = cap(better);
    }
    if (better === original) continue;
    results.push({
      original: sentenceContaining(text, match.index),
      better: applyInSentence(text, match.index, original.length, better),
      explanation: rule.explanation,
      category: rule.category,
      reuseTip: rule.reuseTip,
    });
  }
  return results;
}

/** Applies every rule once — used for the "improved version" of a written answer. */
export function improveText(languageCode: string, text: string): string {
  let out = text;
  for (const rule of RULES[languageCode] ?? []) {
    const match = rule.pattern.exec(out);
    if (!match) continue;
    let better = rule.replace(groups(match));
    const original = match[0] ?? '';
    if (/^[A-ZÄÖÜ]/.test(original) && !/^[A-ZÄÖÜ]/.test(better)) better = cap(better);
    out = out.slice(0, match.index) + better + out.slice(match.index + original.length);
  }
  return out;
}

function groups(match: RegExpExecArray): Groups {
  return (i) => match[i] ?? '';
}

function sentenceBounds(text: string, index: number): [number, number] {
  let start = index;
  while (start > 0 && !/[.!?]/.test(text[start - 1] ?? '')) start--;
  let end = index;
  while (end < text.length && !/[.!?]/.test(text[end] ?? '')) end++;
  if (end < text.length) end++;
  return [start, end];
}

function sentenceContaining(text: string, index: number): string {
  const [start, end] = sentenceBounds(text, index);
  return text.slice(start, end).trim();
}

function applyInSentence(text: string, index: number, length: number, replacement: string): string {
  const fixed = text.slice(0, index) + replacement + text.slice(index + length);
  const [start, end] = sentenceBounds(fixed, index);
  const sentence = fixed.slice(start, end).trim();
  return cap(sentence);
}

export interface PhrasePool {
  acknowledge: string[];
  clarify: string[];
  encourageTarget: string[];
  closing: string[];
  goodbye: string[];
  thinking: string[];
}

export const PHRASES: Record<string, PhrasePool> = {
  de: {
    acknowledge: ['Alles klar.', 'Sehr gern!', 'Gute Wahl!', 'Prima.', 'Ah, verstehe.', 'Okay, super.'],
    clarify: [
      'Entschuldigung, das habe ich nicht ganz verstanden.',
      'Hm, wie bitte?',
      'Sorry, können Sie das noch einmal sagen?',
    ],
    encourageTarget: ['Versuchen Sie es ruhig auf Deutsch – ich helfe Ihnen!', 'Auf Deutsch, bitte – kein Problem, langsam ist okay.'],
    closing: ['Vielen Dank und einen schönen Tag noch!', 'Danke! Bis zum nächsten Mal!'],
    goodbye: ['Tschüss!', 'Auf Wiedersehen!'],
    thinking: ['Moment mal …', 'Lassen Sie mich überlegen …'],
  },
  en: {
    acknowledge: ['Sure thing.', 'Great choice!', 'Got it.', 'Ah, I see.', 'Perfect.', 'Alright.'],
    clarify: ["Sorry, I didn't quite catch that.", 'Pardon?', 'Could you say that again?'],
    encourageTarget: ["Try it in English — I'll help you!", "In English, please — take your time."],
    closing: ['Thanks so much, have a great day!', 'Thank you! See you next time!'],
    goodbye: ['Bye!', 'Take care!'],
    thinking: ['Hmm, let me think…', 'Just a moment…'],
  },
  es: {
    acknowledge: ['¡Claro!', '¡Muy buena elección!', 'Perfecto.', 'Ah, entiendo.', 'Vale.'],
    clarify: ['Perdón, no le he entendido bien.', '¿Cómo dice?', '¿Puede repetirlo, por favor?'],
    encourageTarget: ['Inténtelo en español, ¡yo le ayudo!'],
    closing: ['¡Muchas gracias y que tenga un buen día!', '¡Gracias, hasta la próxima!'],
    goodbye: ['¡Adiós!', '¡Hasta luego!'],
    thinking: ['A ver…', 'Un momento…'],
  },
  fr: {
    acknowledge: ['Bien sûr !', 'Excellent choix !', "D'accord.", 'Ah, je vois.', 'Parfait.'],
    clarify: ["Pardon, je n'ai pas bien compris.", 'Comment ?', 'Vous pouvez répéter, s’il vous plaît ?'],
    encourageTarget: ["Essayez en français, je vous aide !"],
    closing: ['Merci beaucoup et bonne journée !', 'Merci, à la prochaine !'],
    goodbye: ['Au revoir !', 'À bientôt !'],
    thinking: ['Voyons…', 'Un instant…'],
  },
  it: {
    acknowledge: ['Certo!', 'Ottima scelta!', 'Va bene.', 'Ah, capisco.', 'Perfetto.'],
    clarify: ['Scusi, non ho capito bene.', 'Come, scusi?', 'Può ripetere, per favore?'],
    encourageTarget: ["Provi in italiano, l'aiuto io!"],
    closing: ['Grazie mille e buona giornata!', 'Grazie, alla prossima!'],
    goodbye: ['Arrivederci!', 'Ciao!'],
    thinking: ['Vediamo…', 'Un attimo…'],
  },
};

export function phrases(languageCode: string): PhrasePool {
  return PHRASES[languageCode] ?? (PHRASES.en as PhrasePool);
}

/** Lower-case, accent-free form used for keyword matching. */
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesKeyword(normalizedText: string, keyword: string): boolean {
  const k = normalizeForMatch(keyword);
  if (!k) return false;
  return ` ${normalizedText} `.includes(` ${k} `) || (k.length >= 5 && normalizedText.includes(k));
}

/** Rough check whether the learner answered in English when the target language is something else. */
export function looksLikeEnglish(normalizedText: string): boolean {
  const words = normalizedText.split(' ');
  if (words.length < 2) return false;
  const english = new Set(['the', 'i', 'you', 'is', 'are', 'what', 'want', 'please', 'have', 'my', 'and', 'can', 'would', 'like', 'do', 'it', 'a', 'to']);
  const hits = words.filter((w) => english.has(w)).length;
  return hits / words.length > 0.4;
}

/** Simple tone cues for Emotion mode. */
export const TONE_CUES: Record<string, Record<string, string[]>> = {
  de: {
    formal: ['sie', 'ihnen', 'würden', 'könnten', 'sehr geehrte', 'bitte', 'gerne'],
    friendly: ['hey', 'hallo', 'super', 'gern', 'cool', 'toll', 'danke dir', 'lieb'],
    professional: ['termin', 'bezüglich', 'vorschlagen', 'abstimmen', 'freundlichen grüßen', 'besprechen'],
    angry: ['unverschämt', 'sofort', 'inakzeptabel', 'reicht', 'ärgerlich', 'beschweren', '!'],
    uncertain: ['vielleicht', 'ich glaube', 'eventuell', 'nicht sicher', 'weiß nicht', 'wahrscheinlich'],
    enthusiastic: ['fantastisch', 'wunderbar', 'großartig', 'freue mich', 'genial', 'toll', '!'],
    sarcastic: ['na toll', 'wie schön', 'klar doch', 'super gemacht', 'natürlich'],
    diplomatic: ['ich verstehe', 'andererseits', 'vielleicht könnten', 'kompromiss', 'was halten sie', 'gemeinsam'],
  },
  en: {
    formal: ['would', 'could', 'kindly', 'dear', 'please', 'sincerely'],
    friendly: ['hey', 'hi', 'awesome', 'cool', 'thanks', 'buddy'],
    professional: ['regarding', 'schedule', 'propose', 'align', 'best regards', 'follow up'],
    angry: ['unacceptable', 'immediately', 'ridiculous', 'enough', 'complain', '!'],
    uncertain: ['maybe', 'i think', 'perhaps', 'not sure', 'probably', "don't know"],
    enthusiastic: ['amazing', 'fantastic', 'love', "can't wait", 'great', '!'],
    sarcastic: ['oh great', 'just perfect', 'sure', 'wonderful', 'of course'],
    diplomatic: ['i understand', 'on the other hand', 'perhaps we could', 'compromise', 'what do you think', 'together'],
  },
};
