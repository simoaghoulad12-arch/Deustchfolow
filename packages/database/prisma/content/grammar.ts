import type { Level, Skill } from './types';

export interface ExerciseDef {
  type:
    | 'MULTIPLE_CHOICE'
    | 'FILL_BLANK'
    | 'SENTENCE_ORDER'
    | 'TRANSLATION'
    | 'ERROR_CORRECTION'
    | 'MATCHING'
    | 'READING_COMPREHENSION'
    | 'LISTENING_COMPREHENSION'
    | 'FREE_WRITING';
  prompt: string;
  payload: Record<string, unknown>;
  explanation?: string;
  skill?: Skill;
}

export interface GrammarDef {
  lang: string;
  slug: string;
  level: Level;
  title: string;
  summary: string;
  explanation: string;
  examples: { target: string; translation: string; note?: string }[];
  practicePrompt: string;
  exercises: ExerciseDef[];
}

const mc = (prompt: string, options: string[], answer: string, explanation?: string): ExerciseDef => ({
  type: 'MULTIPLE_CHOICE', prompt, payload: { options, answer }, explanation,
});
const fill = (prompt: string, answer: string, acceptable: string[] = [], explanation?: string): ExerciseDef => ({
  type: 'FILL_BLANK', prompt, payload: { answer, acceptable }, explanation,
});
const order = (prompt: string, answer: string, explanation?: string): ExerciseDef => ({
  type: 'SENTENCE_ORDER', prompt, payload: { tokens: shuffleDeterministic(answer.replace(/[.?!]$/, '').split(' ')), answer }, explanation,
});
const fix = (prompt: string, answer: string, explanation?: string): ExerciseDef => ({
  type: 'ERROR_CORRECTION', prompt, payload: { answer }, explanation,
});
const match = (prompt: string, pairs: [string, string][]): ExerciseDef => ({
  type: 'MATCHING', prompt, payload: { pairs: pairs.map(([left, right]) => ({ left, right })) },
});
const ex = (target: string, translation: string, note?: string) => ({ target, translation, note });

/** Stable shuffle so seeds are reproducible and tokens never appear in solution order. */
export function shuffleDeterministic<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  if (out.join('|') === items.join('|') && out.length > 1) out.reverse();
  return out;
}

export const GRAMMAR: GrammarDef[] = [
  // ───────────── German A1 ─────────────
  {
    lang: 'de', slug: 'personal-pronouns', level: 'A1', title: 'Personal pronouns',
    summary: 'ich, du, er, sie, es, wir, ihr, sie, Sie',
    explanation: 'German has an informal "du" (friends, family, children) and a formal "Sie" (strangers, at work, officials). "Sie" (formal) always takes a capital S and uses the same verb form as "sie" (they).',
    examples: [ex('Ich heiße Ali.', 'My name is Ali.'), ex('Kommst du mit?', 'Are you coming along?', 'informal'), ex('Können Sie mir helfen?', 'Can you help me?', 'formal')],
    practicePrompt: 'Introduce yourself and a friend, then ask a stranger a polite question with "Sie".',
    exercises: [
      mc('You talk to your new boss. Which pronoun?', ['du', 'Sie', 'ihr'], 'Sie', 'Use formal "Sie" with people you don\'t know well or at work.'),
      fill('___ (we) wohnen in Köln.', 'Wir'),
      match('Match pronoun and verb', [['ich', 'bin'], ['du', 'bist'], ['er', 'ist'], ['wir', 'sind']]),
    ],
  },
  {
    lang: 'de', slug: 'articles', level: 'A1', title: 'Articles: der, die, das',
    summary: 'Every noun has a gender: masculine (der), feminine (die), neuter (das).',
    explanation: 'Learn each noun together with its article. Indefinite articles: ein (masc./neut.), eine (fem.). Plural always uses "die". Some patterns help: nouns ending in -ung, -heit, -keit are feminine; -chen is neuter.',
    examples: [ex('der Kaffee', 'the coffee'), ex('die Rechnung', 'the bill', '-ung → die'), ex('das Mädchen', 'the girl', '-chen → das')],
    practicePrompt: 'Describe five things on your table with the correct article.',
    exercises: [
      mc('___ Rechnung, bitte.', ['Der', 'Die', 'Das'], 'Die', 'Nouns ending in -ung are feminine.'),
      mc('___ Brötchen ist frisch.', ['Der', 'Die', 'Das'], 'Das', 'Nouns ending in -chen are neuter.'),
      fill('Ich habe ___ (a) Frage.', 'eine'),
    ],
  },
  {
    lang: 'de', slug: 'present-tense', level: 'A1', title: 'Present tense (Präsens)',
    summary: 'Regular verb endings: -e, -st, -t, -en, -t, -en.',
    explanation: 'Remove -en from the infinitive and add the ending: ich lerne, du lernst, er lernt, wir lernen, ihr lernt, sie lernen. Some verbs change their vowel in du/er: fahren → du fährst, sprechen → er spricht.',
    examples: [ex('Ich lerne Deutsch.', 'I learn German.'), ex('Du sprichst sehr gut.', 'You speak very well.', 'e → i'), ex('Er fährt nach Berlin.', 'He drives to Berlin.', 'a → ä')],
    practicePrompt: 'Describe your typical morning in five sentences.',
    exercises: [
      fill('Ich ___ (wohnen) in Hamburg.', 'wohne'),
      mc('Er ___ gut Deutsch.', ['sprecht', 'spricht', 'sprechen'], 'spricht', '"sprechen" changes e → i with du and er/sie/es.'),
      fix('Ich gehen heute ins Kino.', 'Ich gehe heute ins Kino.', 'With "ich", the verb ends in -e.'),
    ],
  },
  {
    lang: 'de', slug: 'verb-sein', level: 'A1', title: 'The verb "sein"',
    summary: 'ich bin, du bist, er ist, wir sind, ihr seid, sie sind',
    explanation: '"sein" (to be) is irregular and used for names, origin, professions, age and descriptions. German uses "sein" for age: Ich bin 25 Jahre alt.',
    examples: [ex('Ich bin Lehrerin.', "I'm a teacher.", 'no article for professions'), ex('Wir sind müde.', "We're tired."), ex('Sie ist 30 Jahre alt.', 'She is 30.')],
    practicePrompt: 'Describe yourself: who you are, where you are, how old you are.',
    exercises: [
      fill('Wir ___ aus Spanien.', 'sind'),
      mc('___ du Student?', ['Bist', 'Ist', 'Seid'], 'Bist'),
      fix('Ich habe 25 Jahre alt.', 'Ich bin 25 Jahre alt.', 'Age uses "sein" in German.'),
    ],
  },
  {
    lang: 'de', slug: 'verb-haben', level: 'A1', title: 'The verb "haben"',
    summary: 'ich habe, du hast, er hat, wir haben, ihr habt, sie haben',
    explanation: '"haben" (to have) is used for possession, and in fixed expressions like Hunger haben, Durst haben, Zeit haben, Angst haben.',
    examples: [ex('Ich habe einen Bruder.', 'I have a brother.'), ex('Hast du Zeit?', 'Do you have time?'), ex('Wir haben Hunger.', "We're hungry.", 'haben, not sein')],
    practicePrompt: 'Say what you have and what you don\'t have (kein/keine).',
    exercises: [
      fill('Er ___ zwei Kinder.', 'hat'),
      mc('Ich ___ Durst.', ['bin', 'habe', 'hat'], 'habe', 'Hunger/Durst use "haben".'),
      fix('Ich bin Hunger.', 'Ich habe Hunger.'),
    ],
  },
  {
    lang: 'de', slug: 'plural', level: 'A1', title: 'Plural forms',
    summary: 'German has several plural endings: -e, -er, -n/-en, -s, or no ending (often with umlaut).',
    explanation: 'There is no single rule — learn the plural with the noun. Tendencies: feminine nouns often add -(e)n (die Frau → die Frauen); many masculine nouns add -e (der Tisch → die Tische); foreign words often add -s (das Auto → die Autos).',
    examples: [ex('die Frauen', 'the women'), ex('die Tische', 'the tables'), ex('die Äpfel', 'the apples', 'umlaut')],
    practicePrompt: 'Make a shopping list with plurals: zwei …, drei …',
    exercises: [
      mc('Plural of "das Auto"', ['die Autos', 'die Auten', 'die Autoe'], 'die Autos'),
      mc('Plural of "die Wohnung"', ['die Wohnunge', 'die Wohnungen', 'die Wohnungs'], 'die Wohnungen'),
      fill('Ich kaufe drei ___ (Apfel).', 'Äpfel', ['Aepfel']),
    ],
  },
  {
    lang: 'de', slug: 'word-order', level: 'A1', title: 'Basic word order',
    summary: 'The conjugated verb is always in position 2 in a main clause.',
    explanation: 'In statements the verb is the second element, even if the sentence starts with time or place: Heute gehe ich ins Kino. In yes/no questions the verb comes first: Gehst du ins Kino?',
    examples: [ex('Ich trinke Kaffee.', 'I drink coffee.'), ex('Morgen fahre ich nach Wien.', "Tomorrow I'm going to Vienna.", 'verb stays 2nd'), ex('Trinkst du Tee?', 'Do you drink tea?', 'question: verb first')],
    practicePrompt: 'Say three things you do tomorrow, starting each sentence with a time expression.',
    exercises: [
      order('Put the words in order', 'Heute gehe ich ins Kino.'),
      order('Put the words in order', 'Am Montag arbeite ich bis fünf.'),
      fix('Morgen ich fahre nach Berlin.', 'Morgen fahre ich nach Berlin.', 'The verb must be in position 2.'),
    ],
  },
  {
    lang: 'de', slug: 'accusative', level: 'A1', title: 'Accusative case',
    summary: 'The direct object: der → den, ein → einen. Feminine and neuter don\'t change.',
    explanation: 'The accusative marks the direct object (what you have, want, buy, order). Only masculine changes: der → den, ein → einen, kein → keinen. Typical verbs: haben, möchten, nehmen, kaufen, brauchen, suchen.',
    examples: [ex('Ich möchte einen Kaffee.', "I'd like a coffee.", 'der Kaffee → einen'), ex('Ich nehme die Suppe.', "I'll take the soup.", 'feminine: no change'), ex('Hast du den Schlüssel?', 'Do you have the key?')],
    practicePrompt: 'Order three things in a café, one masculine, one feminine, one neuter.',
    exercises: [
      mc('Ich hätte gern ___ Tee.', ['ein', 'einen', 'eine'], 'einen', 'der Tee is masculine → einen in the accusative.'),
      fill('Ich suche ___ (der) Bahnhof.', 'den'),
      fix('Ich möchte ein Kaffee.', 'Ich möchte einen Kaffee.'),
    ],
  },
  {
    lang: 'de', slug: 'dative', level: 'A1', title: 'Dative case',
    summary: 'Indirect object and after mit, bei, nach, von, zu, aus, seit: dem, der, dem, den.',
    explanation: 'Dative articles: der → dem, die → der, das → dem, plural → den (+n). Many common prepositions always take the dative: mit, nach, bei, seit, von, zu, aus. zu + dem = zum, zu + der = zur.',
    examples: [ex('Ich fahre mit dem Bus.', 'I go by bus.'), ex('Wie komme ich zum Bahnhof?', 'How do I get to the station?', 'zu + dem'), ex('Ich gebe der Frau das Buch.', 'I give the woman the book.')],
    practicePrompt: 'Describe how you get to work: with what, past what, to where.',
    exercises: [
      mc('Ich fahre mit ___ U-Bahn.', ['die', 'der', 'den'], 'der', '"mit" takes the dative; die → der.'),
      fill('Wie komme ich ___ (zu + das) Museum?', 'zum'),
      mc('Ich wohne seit ___ Jahr hier.', ['ein', 'einem', 'einen'], 'einem'),
    ],
  },
  // ───────────── German A2 ─────────────
  {
    lang: 'de', slug: 'perfect-tense', level: 'A2', title: 'Perfect tense (Perfekt)',
    summary: 'haben/sein + past participle at the end. Used for the spoken past.',
    explanation: 'Most verbs use "haben". Verbs of movement or change of state (gehen, fahren, kommen, aufstehen, bleiben) use "sein". Participle: ge- + stem + -t (regular: gemacht) or ge- + stem + -en (irregular: gefahren).',
    examples: [ex('Ich habe Pizza gegessen.', 'I ate pizza.'), ex('Wir sind nach Rom gefahren.', 'We drove to Rome.', 'movement → sein'), ex('Hast du gut geschlafen?', 'Did you sleep well?')],
    practicePrompt: 'Tell me what you did last weekend (at least four sentences).',
    exercises: [
      mc('Ich ___ gestern ins Kino gegangen.', ['habe', 'bin', 'hat'], 'bin', '"gehen" is movement → sein.'),
      fill('Wir haben Fußball ___ (spielen).', 'gespielt'),
      fix('Ich habe nach Hause gegangen.', 'Ich bin nach Hause gegangen.'),
    ],
  },
  {
    lang: 'de', slug: 'modal-verbs', level: 'A2', title: 'Modal verbs',
    summary: 'können, müssen, dürfen, sollen, wollen, möchten + infinitive at the end.',
    explanation: 'The modal verb is conjugated in position 2; the main verb goes to the end as an infinitive. ich/er forms have no ending: ich kann, er muss.',
    examples: [ex('Ich kann gut kochen.', 'I can cook well.'), ex('Du musst heute arbeiten.', 'You have to work today.'), ex('Darf ich hier rauchen?', 'May I smoke here?')],
    practicePrompt: 'Say three things you must do, can do and want to do this week.',
    exercises: [
      order('Put the words in order', 'Ich muss heute lange arbeiten.'),
      mc('Er ___ nicht schwimmen.', ['kann', 'kannt', 'können'], 'kann'),
      fix('Ich will gehen nach Hause.', 'Ich will nach Hause gehen.', 'The infinitive goes to the end.'),
    ],
  },
  {
    lang: 'de', slug: 'subordinate-clauses', level: 'A2', title: 'Subordinate clauses: weil, dass, wenn',
    summary: 'In subordinate clauses the conjugated verb goes to the end.',
    explanation: 'weil (because), dass (that), wenn (if/when) send the verb to the end: …, weil ich keine Zeit habe. If the sentence starts with the subordinate clause, the main clause starts with the verb: Wenn es regnet, bleibe ich zu Hause.',
    examples: [ex('Ich komme nicht, weil ich krank bin.', "I'm not coming because I'm sick."), ex('Ich glaube, dass er recht hat.', 'I think that he is right.'), ex('Wenn ich Zeit habe, rufe ich an.', "If I have time, I'll call.")],
    practicePrompt: 'Give three excuses with "weil".',
    exercises: [
      order('Put the words in order', 'Ich bleibe zu Hause, weil ich krank bin.'),
      fix('Ich lerne Deutsch, weil ich will in Berlin arbeiten.', 'Ich lerne Deutsch, weil ich in Berlin arbeiten will.'),
      mc('Ich weiß, ___ du müde bist.', ['dass', 'weil', 'wenn'], 'dass'),
    ],
  },
  {
    lang: 'de', slug: 'comparative', level: 'A2', title: 'Comparative',
    summary: 'Adjective + -er + als: größer als, schneller als.',
    explanation: 'Add -er to the adjective and use "als" (than). Short adjectives often take an umlaut: alt → älter, groß → größer. Irregular: gut → besser, viel → mehr, gern → lieber.',
    examples: [ex('Berlin ist größer als Köln.', 'Berlin is bigger than Cologne.'), ex('Tee trinke ich lieber als Kaffee.', 'I prefer tea to coffee.'), ex('Das ist besser.', 'That is better.')],
    practicePrompt: 'Compare your city with another city.',
    exercises: [
      fill('Der Zug ist ___ (schnell) als der Bus.', 'schneller'),
      mc('Das Wetter ist heute ___ als gestern.', ['gut', 'guter', 'besser'], 'besser'),
      fix('Mein Bruder ist alter wie ich.', 'Mein Bruder ist älter als ich.'),
    ],
  },
  {
    lang: 'de', slug: 'superlative', level: 'A2', title: 'Superlative',
    summary: 'am + adjective + -sten / der/die/das + adjective + -ste.',
    explanation: 'Predicative: am schnellsten, am größten. Before a noun: der schnellste Zug, die größte Stadt. Irregular: gut → am besten, viel → am meisten, gern → am liebsten.',
    examples: [ex('Er läuft am schnellsten.', 'He runs the fastest.'), ex('Das ist die schönste Stadt.', 'That is the most beautiful city.'), ex('Am liebsten esse ich Pasta.', 'Most of all I like eating pasta.')],
    practicePrompt: 'Talk about the best food, the most beautiful place and your favourite hobby.',
    exercises: [
      fill('Pizza esse ich am ___ (gern).', 'liebsten'),
      mc('Das ist der ___ Berg in Deutschland.', ['hoch', 'höchste', 'höcher'], 'höchste'),
      fill('Wer singt am ___ (gut)?', 'besten'),
    ],
  },
  {
    lang: 'de', slug: 'reflexive-verbs', level: 'A2', title: 'Reflexive verbs',
    summary: 'sich freuen, sich waschen, sich anmelden: mich, dich, sich, uns, euch, sich.',
    explanation: 'Reflexive verbs need a reflexive pronoun that matches the subject. Many everyday verbs are reflexive: sich vorstellen, sich beeilen, sich anmelden, sich interessieren für.',
    examples: [ex('Ich freue mich.', "I'm happy."), ex('Wir treffen uns um acht.', "We're meeting at eight."), ex('Interessierst du dich für Musik?', 'Are you interested in music?')],
    practicePrompt: 'Describe your morning routine with reflexive verbs.',
    exercises: [
      fill('Ich muss ___ beeilen.', 'mich'),
      mc('Wir freuen ___ auf das Wochenende.', ['sich', 'uns', 'euch'], 'uns'),
      fix('Er interessiert für Fußball.', 'Er interessiert sich für Fußball.'),
    ],
  },
  {
    lang: 'de', slug: 'common-prepositions', level: 'A2', title: 'Two-way prepositions',
    summary: 'in, an, auf, über, unter, vor, hinter, neben, zwischen: Wo? → dative, Wohin? → accusative.',
    explanation: 'These prepositions take the dative for location (Wo?) and the accusative for direction (Wohin?). Ich bin im Büro (Wo?) — Ich gehe ins Büro (Wohin?).',
    examples: [ex('Das Buch liegt auf dem Tisch.', 'The book is on the table.', 'Wo? → Dativ'), ex('Ich lege das Buch auf den Tisch.', 'I put the book on the table.', 'Wohin? → Akkusativ'), ex('Wir gehen ins Kino.', "We're going to the cinema.")],
    practicePrompt: 'Describe where things are in your room, then where you put them.',
    exercises: [
      mc('Ich gehe ___ Supermarkt.', ['im', 'in den', 'in dem'], 'in den', 'Direction (Wohin?) → accusative.'),
      mc('Die Katze schläft ___ Sofa.', ['auf dem', 'auf das', 'auf den'], 'auf dem'),
      fill('Ich hänge das Bild an ___ (die) Wand.', 'die'),
    ],
  },
  // ───────────── German B1 ─────────────
  {
    lang: 'de', slug: 'konjunktiv-2', level: 'B1', title: 'Konjunktiv II',
    summary: 'würde + infinitive, hätte, wäre, könnte: polite requests, wishes and hypotheses.',
    explanation: 'Use Konjunktiv II for politeness (Könnten Sie …?), wishes (Ich hätte gern …, Wenn ich doch Zeit hätte!) and unreal conditions (Wenn ich reich wäre, würde ich reisen). Most verbs use würde + infinitive; haben, sein and modals have their own forms.',
    examples: [ex('Könnten Sie mir helfen?', 'Could you help me?'), ex('Wenn ich Zeit hätte, würde ich mitkommen.', 'If I had time, I would come along.'), ex('An deiner Stelle würde ich das nicht machen.', "In your place I wouldn't do that.")],
    practicePrompt: 'What would you do if you won a million euros?',
    exercises: [
      mc('___ Sie mir bitte das Salz geben?', ['Können', 'Könnten', 'Konnten'], 'Könnten', 'Konjunktiv II sounds more polite.'),
      fill('Wenn ich mehr Geld ___ (haben), würde ich reisen.', 'hätte'),
      fix('Wenn ich du bin, würde ich das machen.', 'Wenn ich du wäre, würde ich das machen.'),
    ],
  },
  {
    lang: 'de', slug: 'passive', level: 'B1', title: 'Passive voice',
    summary: 'werden + past participle: Das Haus wird gebaut.',
    explanation: 'The passive focuses on the action, not the person. Present: wird gemacht. Past: wurde gemacht. Perfect: ist gemacht worden. The agent can be added with "von".',
    examples: [ex('Hier wird Deutsch gesprochen.', 'German is spoken here.'), ex('Das Paket wurde gestern geliefert.', 'The parcel was delivered yesterday.'), ex('Die Brücke wird von Experten geprüft.', 'The bridge is inspected by experts.')],
    practicePrompt: 'Describe how coffee is made, using the passive.',
    exercises: [
      fill('Das Essen ___ (werden) gerade gekocht.', 'wird'),
      mc('Der Brief ___ gestern geschrieben.', ['wird', 'wurde', 'würde'], 'wurde'),
      order('Put the words in order', 'Das Auto wird morgen repariert.'),
    ],
  },
  {
    lang: 'de', slug: 'relative-clauses', level: 'B1', title: 'Relative clauses',
    summary: 'der, die, das, den, dem, deren … — the verb goes to the end.',
    explanation: 'The relative pronoun takes its gender and number from the noun it refers to, and its case from its role in the relative clause: Der Mann, den ich kenne (accusative), … dem ich helfe (dative).',
    examples: [ex('Das ist der Kollege, der aus Polen kommt.', 'That is the colleague who comes from Poland.'), ex('Die Wohnung, die ich gemietet habe, ist hell.', 'The apartment that I rented is bright.'), ex('Der Freund, dem ich helfe, …', 'The friend whom I help …', 'dative')],
    practicePrompt: 'Describe three people you know using relative clauses.',
    exercises: [
      mc('Das ist die Frau, ___ in meinem Büro arbeitet.', ['der', 'die', 'das'], 'die'),
      mc('Der Film, ___ wir gesehen haben, war toll.', ['der', 'den', 'dem'], 'den', 'Accusative: wir haben den Film gesehen.'),
      fix('Das ist der Mann, der ich gestern gesehen habe.', 'Das ist der Mann, den ich gestern gesehen habe.'),
    ],
  },
  {
    lang: 'de', slug: 'indirect-questions', level: 'B1', title: 'Indirect questions',
    summary: 'Können Sie mir sagen, wo …? / Ich weiß nicht, ob … — verb at the end.',
    explanation: 'Indirect questions are more polite. W-questions keep their question word; yes/no questions use "ob". In both, the verb goes to the end.',
    examples: [ex('Können Sie mir sagen, wo der Bahnhof ist?', 'Can you tell me where the station is?'), ex('Ich weiß nicht, ob er kommt.', "I don't know whether he's coming."), ex('Wissen Sie, wann der Zug fährt?', 'Do you know when the train leaves?')],
    practicePrompt: 'Ask a stranger three polite indirect questions.',
    exercises: [
      order('Put the words in order', 'Wissen Sie, wann der Zug fährt?'),
      mc('Ich frage mich, ___ das stimmt.', ['dass', 'ob', 'wenn'], 'ob'),
      fix('Können Sie mir sagen, wo ist die Toilette?', 'Können Sie mir sagen, wo die Toilette ist?'),
    ],
  },
  {
    lang: 'de', slug: 'complex-subordinate-clauses', level: 'B1', title: 'obwohl, damit, nachdem, bevor',
    summary: 'More connectors for subordinate clauses — still verb at the end.',
    explanation: 'obwohl (although), damit (so that), nachdem (after), bevor (before), während (while). After "nachdem", use a tense one step further in the past (Plusquamperfekt with past main clause).',
    examples: [ex('Obwohl es regnet, gehe ich joggen.', "Although it's raining, I'm going jogging."), ex('Ich spare, damit ich reisen kann.', "I save so that I can travel."), ex('Nachdem ich gegessen hatte, ging ich spazieren.', 'After I had eaten, I went for a walk.')],
    practicePrompt: 'Explain a decision you made using obwohl and damit.',
    exercises: [
      mc('___ er krank ist, geht er zur Arbeit.', ['Weil', 'Obwohl', 'Damit'], 'Obwohl'),
      order('Put the words in order', 'Ich lerne viel, damit ich die Prüfung bestehe.'),
      fill('Ich rufe dich an, ___ (before) ich losfahre.', 'bevor'),
    ],
  },
  // ───────────── German B2 ─────────────
  {
    lang: 'de', slug: 'nominalization', level: 'B2', title: 'Nominalisation',
    summary: 'Turning verbs and adjectives into nouns: entscheiden → die Entscheidung.',
    explanation: 'Formal and written German prefers nouns: "Nach der Ankunft" instead of "Nachdem wir angekommen sind". Common endings: -ung, -heit, -keit, -tion; infinitives as nouns (das Lernen).',
    examples: [ex('die Entscheidung', 'the decision', 'entscheiden'), ex('Bei Fragen wenden Sie sich an uns.', 'If you have questions, contact us.'), ex('Nach der Prüfung …', 'After the exam …')],
    practicePrompt: 'Rewrite three spoken sentences in a formal written style.',
    exercises: [
      mc('Noun of "verbessern"', ['die Verbesserung', 'das Verbesserheit', 'die Verbesserkeit'], 'die Verbesserung'),
      fill('Vor der ___ (abfahren) müssen Sie einchecken.', 'Abfahrt'),
      mc('Formal version of "weil es regnet"', ['wegen des Regens', 'wegen dem regnen', 'weil Regen'], 'wegen des Regens'),
    ],
  },
  {
    lang: 'de', slug: 'advanced-sentence-structures', level: 'B2', title: 'Advanced sentence structures',
    summary: 'Extended participles, je … desto, two-part connectors.',
    explanation: 'Written German packs information into participle phrases: "die im letzten Jahr eingeführte Regel". Two-part connectors structure arguments: je … desto, sowohl … als auch, weder … noch, zwar … aber.',
    examples: [ex('Je mehr ich übe, desto besser spreche ich.', 'The more I practise, the better I speak.'), ex('die vor Kurzem eröffnete Filiale', 'the recently opened branch'), ex('Sowohl Preis als auch Qualität stimmen.', 'Both price and quality are right.')],
    practicePrompt: 'Describe the pros and cons of city life using je … desto and zwar … aber.',
    exercises: [
      fill('Je früher wir anfangen, ___ eher sind wir fertig.', 'desto', ['umso']),
      mc('Er spricht ___ Englisch als auch Spanisch.', ['weder', 'sowohl', 'zwar'], 'sowohl'),
      order('Put the words in order', 'Je mehr ich lese, desto mehr verstehe ich.'),
    ],
  },
  {
    lang: 'de', slug: 'formal-language', level: 'B2', title: 'Formal language & register',
    summary: 'Formal letters, emails and official communication.',
    explanation: 'Formal German uses "Sie", complete sentences, Konjunktiv II for requests, nominal style, and fixed formulas: Sehr geehrte Damen und Herren, … Mit freundlichen Grüßen. Avoid colloquial words like "kriegen" or "Bock haben".',
    examples: [ex('Sehr geehrte Frau Müller,', 'Dear Ms Müller,'), ex('Ich wäre Ihnen dankbar, wenn …', 'I would be grateful if …'), ex('Mit freundlichen Grüßen', 'Kind regards')],
    practicePrompt: 'Write a short formal email to request an appointment.',
    exercises: [
      mc('Formal email opening', ['Hey Frau Müller,', 'Sehr geehrte Frau Müller,', 'Hallo Müller,'], 'Sehr geehrte Frau Müller,'),
      mc('Formal version of "Ich kriege kein Geld zurück."', ['Ich erhalte keine Erstattung.', 'Ich kriege nix.', 'Geld kommt nicht.'], 'Ich erhalte keine Erstattung.'),
      fill('Ich ___ Ihnen dankbar, wenn Sie mir antworten könnten.', 'wäre'),
    ],
  },
  {
    lang: 'de', slug: 'argumentation', level: 'B2', title: 'Argumentation',
    summary: 'Structuring arguments: thesis, reasons, examples, counter-arguments, conclusion.',
    explanation: 'Useful phrases: Ich vertrete die Auffassung, dass … / Dafür spricht, dass … / Dagegen lässt sich einwenden, dass … / Zusammenfassend lässt sich sagen, …',
    examples: [ex('Dafür spricht, dass …', 'In favour of this is that …'), ex('Dagegen lässt sich einwenden, dass …', 'Against this one can object that …'), ex('Zusammenfassend lässt sich sagen, …', 'In summary, one can say …')],
    practicePrompt: 'Argue for or against a four-day work week.',
    exercises: [
      mc('Which phrase introduces a counter-argument?', ['Dafür spricht, dass', 'Dagegen lässt sich einwenden, dass', 'Zusammenfassend'], 'Dagegen lässt sich einwenden, dass'),
      fill('___ lässt sich sagen, dass beide Seiten recht haben. (In summary)', 'Zusammenfassend'),
      match('Match function and phrase', [['thesis', 'Ich vertrete die Auffassung'], ['reason', 'Dafür spricht'], ['conclusion', 'Abschließend']]),
    ],
  },
  {
    lang: 'de', slug: 'stylistic-differences', level: 'B2', title: 'Spoken vs written style',
    summary: 'Colloquial speech vs formal writing.',
    explanation: 'Spoken German shortens and simplifies (hab, nix, gucken, Perfekt for the past); written German uses Präteritum, full forms and more precise vocabulary (erhalten instead of kriegen, betrachten instead of gucken).',
    examples: [ex('Ich hab nix gesehen. → Ich habe nichts gesehen.', 'spoken → written'), ex('Wir kriegen das hin. → Wir werden das bewältigen.', 'colloquial → formal'), ex('gucken → betrachten', 'to look')],
    practicePrompt: 'Turn a casual voice message into a formal written message.',
    exercises: [
      mc('Written form of "kriegen"', ['bekommen/erhalten', 'kriegen', 'nehmen'], 'bekommen/erhalten'),
      mc('Which is spoken style?', ['Ich habe nichts gesehen.', 'Ich hab nix gesehen.', 'Ich sah nichts.'], 'Ich hab nix gesehen.'),
      fill('Formal: "Er ___ (gucken) das Bild genau." → betrachtet', 'betrachtet'),
    ],
  },
  {
    lang: 'de', slug: 'complex-connectors', level: 'B2', title: 'Complex connectors',
    summary: 'folglich, demzufolge, hingegen, indem, sodass, zumal …',
    explanation: 'Connectors make texts cohesive. Adverbs (folglich, dennoch, hingegen) occupy position 1 and the verb follows. Subordinators (indem, sodass, zumal) send the verb to the end.',
    examples: [ex('Er hat viel geübt, folglich hat er bestanden.', 'He practised a lot; consequently he passed.'), ex('Man lernt am besten, indem man spricht.', 'You learn best by speaking.'), ex('Sie ist ruhig, er hingegen redet viel.', 'She is quiet; he, on the other hand, talks a lot.')],
    practicePrompt: 'Explain how you learn best, using indem and folglich.',
    exercises: [
      mc('Man verbessert sich, ___ man täglich übt.', ['indem', 'folglich', 'hingegen'], 'indem'),
      fix('Es regnete, folglich wir blieben zu Hause.', 'Es regnete, folglich blieben wir zu Hause.', 'After "folglich" the verb comes first.'),
      fill('Er war krank, ___ er nicht kommen konnte. (so that)', 'sodass', ['so dass']),
    ],
  },

  // ───────────── English ─────────────
  {
    lang: 'en', slug: 'present-simple', level: 'A1', title: 'Present simple',
    summary: 'Habits and facts. He/she/it + -s.',
    explanation: 'Use the present simple for routines and facts. Add -s for he/she/it: she works. Questions and negatives use do/does: Does she work? She doesn\'t work.',
    examples: [ex('I work in a hospital.', 'Ich arbeite in einem Krankenhaus.'), ex('She lives in London.', 'Sie wohnt in London.'), ex("He doesn't drink coffee.", 'Er trinkt keinen Kaffee.')],
    practicePrompt: 'Describe your daily routine.',
    exercises: [fill('She ___ (work) in a bank.', 'works'), mc('___ he like football?', ['Do', 'Does', 'Is'], 'Does'), fix('He go to school every day.', 'He goes to school every day.')],
  },
  {
    lang: 'en', slug: 'polite-requests', level: 'A1', title: "Polite requests: I'd like / Could I",
    summary: "I'd like…, Could I have…, Would you mind…",
    explanation: '"I want" can sound rude. Use "I\'d like", "Could I have…?" or "Can I get…?" when ordering or asking for something.',
    examples: [ex("I'd like a coffee, please.", 'Ich hätte gern einen Kaffee.'), ex('Could I have the bill?', 'Könnte ich die Rechnung haben?'), ex('Would you mind opening the window?', 'Würden Sie das Fenster öffnen?')],
    practicePrompt: 'Order a full meal politely.',
    exercises: [mc('Most polite:', ['I want water.', 'Give me water.', 'Could I have some water, please?'], 'Could I have some water, please?'), fill("I'___ like a tea, please.", 'd'), fix('I want a coffee.', "I'd like a coffee.")],
  },
  {
    lang: 'en', slug: 'present-perfect', level: 'A2', title: 'Present perfect',
    summary: 'have/has + past participle: experiences and unfinished time.',
    explanation: 'Use the present perfect for experiences (Have you ever…?), recent events with present relevance, and with for/since. Do not use it with finished time (yesterday, in 2019).',
    examples: [ex("I've been to Paris.", 'Ich war schon in Paris.'), ex("She's lived here since 2020.", 'Sie wohnt seit 2020 hier.'), ex('Have you finished?', 'Bist du fertig?')],
    practicePrompt: 'Talk about three things you have never done.',
    exercises: [fill('I have ___ (live) here for five years.', 'lived'), mc('She ___ to Japan twice.', ['has been', 'was been', 'have been'], 'has been'), fix('I am living here since 2020.', 'I have been living here since 2020.')],
  },
  {
    lang: 'en', slug: 'prepositions-transport', level: 'A2', title: 'Prepositions: on/in/at',
    summary: 'on the train, in the car, at the station.',
    explanation: 'Public transport and large vehicles use "on" (on the bus, on the train, on a plane); cars and taxis use "in". Points use "at" (at the station, at the airport).',
    examples: [ex("I'm on the train.", 'Ich bin im Zug.'), ex("She's in a taxi.", 'Sie sitzt im Taxi.'), ex("Meet me at the station.", 'Triff mich am Bahnhof.')],
    practicePrompt: 'Describe your journey to work.',
    exercises: [mc("I think I'm ___ the wrong train.", ['in', 'on', 'at'], 'on'), fill("Let's meet ___ the airport.", 'at'), fix('I am in wrong train.', 'I am on the wrong train.')],
  },
  {
    lang: 'en', slug: 'second-conditional', level: 'B1', title: 'Second conditional',
    summary: 'If + past simple, would + infinitive.',
    explanation: 'For unreal or hypothetical situations: If I had more time, I would travel. Use "were" for all persons in formal English: If I were you…',
    examples: [ex('If I won the lottery, I would buy a house.', 'Wenn ich im Lotto gewinnen würde, …'), ex("If I were you, I'd apply.", 'An deiner Stelle würde ich mich bewerben.'), ex('What would you do if…?', 'Was würdest du tun, wenn…?')],
    practicePrompt: 'What would you change if you were the mayor of your city?',
    exercises: [fill('If I ___ (have) a car, I would drive.', 'had'), mc('If I ___ you, I would call her.', ['am', 'were', 'will be'], 'were'), fix('If I would have time, I would come.', 'If I had time, I would come.')],
  },
  {
    lang: 'en', slug: 'linking-arguments', level: 'B2', title: 'Linking arguments',
    summary: 'However, moreover, therefore, whereas, despite…',
    explanation: 'Use linkers to build coherent arguments: adding (moreover, furthermore), contrasting (however, whereas, despite + noun), consequence (therefore, as a result).',
    examples: [ex('However, there are risks.', 'Es gibt jedoch Risiken.'), ex('Despite the cost, it is worth it.', 'Trotz der Kosten lohnt es sich.'), ex('Therefore, we should act now.', 'Deshalb sollten wir jetzt handeln.')],
    practicePrompt: 'Argue for or against a four-day week using five linkers.',
    exercises: [mc('___ the rain, we went out.', ['Although', 'Despite', 'However'], 'Despite'), fill('It is cheap. ___, it is fast. (adding)', 'Moreover', ['Furthermore']), fix('Despite it was late, we continued.', 'Although it was late, we continued.')],
  },
  // ───────────── Spanish ─────────────
  {
    lang: 'es', slug: 'ser-estar', level: 'A1', title: 'Ser vs estar',
    summary: 'ser = identity, origin, profession; estar = location, state.',
    explanation: 'Use "ser" for permanent characteristics (soy médico, soy de Marruecos) and "estar" for location and temporary states (estoy en casa, estoy cansado).',
    examples: [ex('Soy estudiante.', 'I am a student.'), ex('Estoy en Madrid.', 'I am in Madrid.'), ex('Estamos cansados.', 'We are tired.')],
    practicePrompt: 'Describe yourself and where you are right now.',
    exercises: [mc('___ en el trabajo.', ['Soy', 'Estoy'], 'Estoy'), fill('Ella ___ de México. (ser)', 'es'), fix('Estoy médico.', 'Soy médico.')],
  },
  {
    lang: 'es', slug: 'tener-age', level: 'A1', title: 'Tener: age and expressions',
    summary: 'tengo 25 años, tengo hambre, tengo frío.',
    explanation: 'Spanish uses "tener" for age and many physical states: tener hambre, sed, frío, calor, sueño, miedo.',
    examples: [ex('Tengo 30 años.', "I'm 30."), ex('¿Tienes hambre?', 'Are you hungry?'), ex('Tenemos frío.', "We're cold.")],
    practicePrompt: 'Talk about how old your family members are.',
    exercises: [fill('Yo ___ 25 años.', 'tengo'), mc('Ella ___ sed.', ['es', 'está', 'tiene'], 'tiene'), fix('Soy 20 años.', 'Tengo 20 años.')],
  },
  {
    lang: 'es', slug: 'preterito-perfecto', level: 'A2', title: 'Pretérito perfecto',
    summary: 'haber + participio: he comido, has viajado.',
    explanation: 'In Spain, the pretérito perfecto is used for actions in a time period that is not finished (hoy, esta semana) and recent events: Hoy he trabajado mucho.',
    examples: [ex('He comido paella.', 'I have eaten paella.'), ex('¿Has estado en Sevilla?', 'Have you been to Seville?'), ex('Me he equivocado.', 'I made a mistake.')],
    practicePrompt: 'Tell me what you have done today.',
    exercises: [fill('Hoy ___ (yo, trabajar) mucho.', 'he trabajado'), mc('¿___ visto la película?', ['Has', 'Ha', 'He'], 'Has'), order('Ordena', 'Me he equivocado de tren.')],
  },
  {
    lang: 'es', slug: 'polite-requests-es', level: 'A2', title: 'Polite requests',
    summary: 'quisiera, ¿me pone…?, ¿podría…?',
    explanation: '"Quiero" is direct. In shops and cafés use "¿Me pone…?", "Quisiera…" or "¿Podría…?".',
    examples: [ex('Quisiera un café.', "I'd like a coffee."), ex('¿Me pone una caña?', 'Could I have a small beer?'), ex('¿Podría ayudarme?', 'Could you help me?')],
    practicePrompt: 'Order breakfast politely in a Spanish café.',
    exercises: [mc('Most polite:', ['Quiero agua.', 'Dame agua.', '¿Me pone un agua, por favor?'], '¿Me pone un agua, por favor?'), fill('___ un café con leche. (I would like)', 'Quisiera'), fix('Yo quiero un café.', 'Quisiera un café.')],
  },
  {
    lang: 'es', slug: 'subjuntivo-intro', level: 'B1', title: 'Introduction to the subjunctive',
    summary: 'quiero que + subjuntivo, es importante que…',
    explanation: 'Use the subjunctive after expressions of wishes, emotions and recommendations with a change of subject: Quiero que vengas. Es importante que estudies.',
    examples: [ex('Quiero que vengas.', 'I want you to come.'), ex('Espero que estés bien.', 'I hope you are well.'), ex('Es mejor que esperemos.', "It's better that we wait.")],
    practicePrompt: 'Give a friend three recommendations with "te recomiendo que…".',
    exercises: [fill('Espero que tú ___ (estar) bien.', 'estés'), mc('Quiero que ___ conmigo.', ['vienes', 'vengas', 'venir'], 'vengas'), fix('Es importante que estudias.', 'Es importante que estudies.')],
  },
  {
    lang: 'es', slug: 'connectors-es', level: 'B2', title: 'Discourse connectors',
    summary: 'sin embargo, por lo tanto, además, aunque…',
    explanation: 'Connectors organise arguments: adding (además), contrasting (sin embargo, aunque), consequence (por lo tanto, así que).',
    examples: [ex('Sin embargo, hay un problema.', 'However, there is a problem.'), ex('Por lo tanto, debemos actuar.', 'Therefore we must act.'), ex('Aunque llueve, salgo.', "Although it's raining, I'm going out.")],
    practicePrompt: 'Argue for or against working from home.',
    exercises: [mc('Es caro; ___, es útil.', ['sin embargo', 'porque', 'además de'], 'sin embargo'), fill('No estudió; ___, suspendió. (therefore)', 'por lo tanto'), mc('___ estaba cansado, siguió trabajando.', ['Aunque', 'Por eso', 'Además'], 'Aunque')],
  },
  // ───────────── French ─────────────
  {
    lang: 'fr', slug: 'etre-avoir', level: 'A1', title: 'Être and avoir',
    summary: "je suis, j'ai — and age with avoir.",
    explanation: '"Être" (to be) and "avoir" (to have) are the two key verbs. French uses "avoir" for age (j\'ai 25 ans), hunger (j\'ai faim) and thirst (j\'ai soif).',
    examples: [ex('Je suis étudiant.', 'I am a student.'), ex("J'ai 25 ans.", "I'm 25."), ex('Nous avons faim.', "We're hungry.")],
    practicePrompt: 'Introduce yourself: name, age, job.',
    exercises: [fill("J'___ 30 ans.", 'ai'), mc('Elle ___ médecin.', ['a', 'est', 'ai'], 'est'), fix('Je suis 20 ans.', "J'ai 20 ans.")],
  },
  {
    lang: 'fr', slug: 'articles-contractions', level: 'A1', title: 'Articles & contractions',
    summary: 'le/la/les, au (à + le), du (de + le).',
    explanation: 'à + le = au, à + les = aux, de + le = du, de + les = des. Before a vowel: l\'.',
    examples: [ex('Je vais au cinéma.', "I'm going to the cinema."), ex('Je reviens du travail.', "I'm coming back from work."), ex("l'addition", 'the bill')],
    practicePrompt: 'Say where you go during the week.',
    exercises: [mc('Je vais ___ restaurant.', ['à le', 'au', 'à la'], 'au'), fill('Je viens ___ (de + le) marché.', 'du'), fix('Je vais à le parc.', 'Je vais au parc.')],
  },
  {
    lang: 'fr', slug: 'passe-compose', level: 'A2', title: 'Passé composé',
    summary: 'avoir/être + participe passé.',
    explanation: 'Most verbs use avoir. Movement verbs (aller, venir, arriver, partir…) and reflexive verbs use être, and the participle agrees with the subject.',
    examples: [ex("J'ai mangé.", 'I ate.'), ex('Elle est partie.', 'She left.', 'agreement'), ex('Je me suis trompé.', 'I made a mistake.')],
    practicePrompt: 'Tell me about your last holiday.',
    exercises: [mc('Nous ___ allés au musée.', ['avons', 'sommes'], 'sommes'), fill("Hier, j'___ (manger) une crêpe.", 'ai mangé'), order('Remets dans l\'ordre', 'Je me suis trompé de train.')],
  },
  {
    lang: 'fr', slug: 'conditionnel-politesse', level: 'A2', title: 'Conditional of politeness',
    summary: 'je voudrais, pourriez-vous, j\'aimerais',
    explanation: 'Use the conditional to sound polite: Je voudrais un café. Pourriez-vous m\'aider ?',
    examples: [ex('Je voudrais un croissant.', "I'd like a croissant."), ex("Pourriez-vous répéter ?", 'Could you repeat?'), ex("J'aimerais réserver.", "I'd like to book.")],
    practicePrompt: 'Order lunch politely in a Parisian café.',
    exercises: [mc('Most polite:', ['Je veux un café.', 'Je voudrais un café.', 'Un café !'], 'Je voudrais un café.'), fill('___-vous m\'aider ? (could)', 'Pourriez'), fix('Je veux une table.', 'Je voudrais une table.')],
  },
  {
    lang: 'fr', slug: 'subjonctif-intro', level: 'B1', title: 'Introduction to the subjunctive',
    summary: 'il faut que, je veux que + subjonctif.',
    explanation: 'Use the subjunctive after expressions of necessity, will and emotion: Il faut que tu viennes. Je veux qu\'il parte.',
    examples: [ex('Il faut que je parte.', 'I have to leave.'), ex('Je veux que tu viennes.', 'I want you to come.'), ex('Je suis content que tu sois là.', "I'm glad you're here.")],
    practicePrompt: 'Give advice with "il faut que".',
    exercises: [fill('Il faut que tu ___ (venir).', 'viennes'), mc('Je veux que vous ___ là.', ['êtes', 'soyez', 'serez'], 'soyez'), fix('Il faut que je pars.', 'Il faut que je parte.')],
  },
  {
    lang: 'fr', slug: 'connecteurs', level: 'B2', title: 'Logical connectors',
    summary: 'cependant, en revanche, par conséquent, bien que…',
    explanation: 'Structure arguments: opposition (cependant, en revanche, bien que + subjonctif), consequence (donc, par conséquent), addition (de plus, en outre).',
    examples: [ex('Cependant, il y a un risque.', 'However, there is a risk.'), ex('Bien qu\'il pleuve, je sors.', "Although it's raining, I'm going out."), ex('Par conséquent, nous devons agir.', 'Consequently, we must act.')],
    practicePrompt: 'Argue for or against city car bans.',
    exercises: [mc("___ il soit tard, on continue.", ['Bien qu\'', 'Donc', 'Cependant'], "Bien qu'"), fill("C'est cher ; ___, c'est utile. (however)", 'cependant'), mc('Il a travaillé ; ___, il a réussi.', ['par conséquent', 'bien que', 'en revanche'], 'par conséquent')],
  },
  // ───────────── Italian ─────────────
  {
    lang: 'it', slug: 'essere-avere', level: 'A1', title: 'Essere and avere',
    summary: 'sono, ho — and age with avere.',
    explanation: '"Essere" (to be) and "avere" (to have). Italian uses "avere" for age (ho 25 anni), hunger (ho fame) and thirst (ho sete).',
    examples: [ex('Sono studente.', 'I am a student.'), ex('Ho 25 anni.', "I'm 25."), ex('Abbiamo fame.', "We're hungry.")],
    practicePrompt: 'Introduce yourself in Italian.',
    exercises: [fill('Io ___ 30 anni.', 'ho'), mc('Lei ___ italiana.', ['ha', 'è', 'ho'], 'è'), fix('Sono 20 anni.', 'Ho 20 anni.')],
  },
  {
    lang: 'it', slug: 'articles-it', level: 'A1', title: 'Definite articles',
    summary: "il, lo, la, l', i, gli, le",
    explanation: "Masculine: il (most), lo (before s+consonant, z), l' (before vowel). Feminine: la, l' before vowel. Plural: i/gli, le.",
    examples: [ex("l'acqua", 'the water'), ex('lo zucchero', 'the sugar'), ex('il cornetto', 'the croissant')],
    practicePrompt: 'Name ten things in your kitchen with the article.',
    exercises: [mc('___ acqua', ['il', 'la', "l'"], "l'"), mc('___ studente', ['il', 'lo', 'la'], 'lo'), fix('il albergo', "l'albergo")],
  },
  {
    lang: 'it', slug: 'passato-prossimo', level: 'A2', title: 'Passato prossimo',
    summary: 'avere/essere + participio.',
    explanation: 'Most verbs use avere; movement and change-of-state verbs (andare, venire, partire, arrivare) use essere and the participle agrees.',
    examples: [ex('Ho mangiato.', 'I ate.'), ex('Siamo andati a Roma.', 'We went to Rome.'), ex('Ho sbagliato treno.', 'I took the wrong train.')],
    practicePrompt: 'Racconta il tuo fine settimana.',
    exercises: [mc('Maria ___ partita ieri.', ['ha', 'è'], 'è'), fill('Ieri ___ (io, mangiare) la pizza.', 'ho mangiato'), order('Riordina', 'Ho sbagliato treno stamattina.')],
  },
  {
    lang: 'it', slug: 'condizionale-cortesia', level: 'A2', title: 'Polite conditional',
    summary: 'vorrei, potrebbe, mi piacerebbe',
    explanation: 'Use the conditional to be polite: Vorrei un caffè. Potrebbe aiutarmi?',
    examples: [ex('Vorrei un cappuccino.', "I'd like a cappuccino."), ex('Potrebbe ripetere?', 'Could you repeat?'), ex('Mi piacerebbe prenotare.', "I'd like to book.")],
    practicePrompt: 'Ordina la colazione al bar.',
    exercises: [mc('Most polite:', ['Voglio un caffè.', 'Vorrei un caffè.', 'Caffè!'], 'Vorrei un caffè.'), fill('___ un cornetto, per favore. (I would like)', 'Vorrei'), fix('Voglio un tavolo.', 'Vorrei un tavolo.')],
  },
  {
    lang: 'it', slug: 'congiuntivo-intro', level: 'B1', title: 'Introduction to the subjunctive',
    summary: 'penso che, voglio che + congiuntivo.',
    explanation: 'Use the congiuntivo after verbs of opinion, wish and emotion: Penso che sia giusto. Voglio che tu venga.',
    examples: [ex('Penso che sia vero.', 'I think it is true.'), ex('Voglio che tu venga.', 'I want you to come.'), ex('Spero che stia bene.', 'I hope he is well.')],
    practicePrompt: 'Esprimi tre opinioni con "penso che".',
    exercises: [fill('Penso che lui ___ (essere) stanco.', 'sia'), mc('Voglio che tu ___ con me.', ['vieni', 'venga', 'venire'], 'venga'), fix('Penso che è vero.', 'Penso che sia vero.')],
  },
  {
    lang: 'it', slug: 'connettivi', level: 'B2', title: 'Connectors',
    summary: 'tuttavia, quindi, inoltre, sebbene…',
    explanation: 'Structure arguments: contrast (tuttavia, invece, sebbene + congiuntivo), consequence (quindi, perciò), addition (inoltre).',
    examples: [ex('Tuttavia, c\'è un problema.', 'However, there is a problem.'), ex('Sebbene piova, esco.', "Although it's raining, I'm going out."), ex('Quindi dobbiamo agire.', 'So we must act.')],
    practicePrompt: 'Argomenta pro o contro il lavoro da remoto.',
    exercises: [mc('___ sia tardi, continuiamo.', ['Sebbene', 'Quindi', 'Inoltre'], 'Sebbene'), fill("È caro; ___, è utile. (however)", 'tuttavia'), mc('Ha studiato; ___, ha superato l\'esame.', ['quindi', 'sebbene', 'invece'], 'quindi')],
  },
];
