import type { Level, Skill } from './types';

/**
 * Adaptive placement pool beyond grammar: for every language and CEFR level
 * two vocabulary items plus one reading, listening, writing and speaking item.
 * Grammar placement items come from the first exercise of each grammar topic.
 *
 * Grading is a lenient normalised string match (case, punctuation and
 * apostrophes ignored; accents are NOT), so translation and speaking items list
 * the natural variants a learner or a speech recogniser is likely to produce.
 */
export interface PlacementItemDef {
  lang: 'de' | 'en' | 'es' | 'fr' | 'it';
  level: Level;
  skill: Skill;
  type: 'MULTIPLE_CHOICE' | 'READING_COMPREHENSION' | 'LISTENING_COMPREHENSION' | 'TRANSLATION' | 'SPEAKING';
  prompt: string;
  payload: {
    options?: string[];
    answer: string;
    acceptable?: string[];
    passage?: string;
    audioText?: string;
    sourceText?: string;
  };
  explanation?: string;
}

type Lang = PlacementItemDef['lang'];

const LANGUAGE_NAMES: Record<Lang, string> = { de: 'German', en: 'English', es: 'Spanish', fr: 'French', it: 'Italian' };

const vocab = (lang: Lang, level: Level, prompt: string, options: string[], answer: string, explanation?: string): PlacementItemDef => ({
  lang, level, skill: 'VOCABULARY', type: 'MULTIPLE_CHOICE', prompt, payload: { options, answer }, explanation,
});

const reading = (lang: Lang, level: Level, passage: string, prompt: string, options: string[], answer: string): PlacementItemDef => ({
  lang, level, skill: 'READING', type: 'READING_COMPREHENSION', prompt, payload: { passage, options, answer },
});

const listening = (lang: Lang, level: Level, audioText: string, prompt: string, options: string[], answer: string): PlacementItemDef => ({
  lang, level, skill: 'LISTENING', type: 'LISTENING_COMPREHENSION', prompt, payload: { audioText, options, answer },
});

/** English → target-language translation. */
const writing = (lang: Lang, level: Level, sourceText: string, answer: string, acceptable: string[], explanation?: string): PlacementItemDef => ({
  lang, level, skill: 'WRITING', type: 'TRANSLATION', prompt: `Write this in ${LANGUAGE_NAMES[lang]}:`, payload: { sourceText, answer, acceptable }, explanation,
});

/** English has no source language to translate from, so its writing items are sentence transformations. */
const rewrite = (level: Level, prompt: string, sourceText: string, answer: string, acceptable: string[], explanation?: string): PlacementItemDef => ({
  lang: 'en', level, skill: 'WRITING', type: 'TRANSLATION', prompt, payload: { sourceText, answer, acceptable }, explanation,
});

const speaking = (lang: Lang, level: Level, sentence: string, acceptable: string[]): PlacementItemDef => ({
  lang, level, skill: 'SPEAKING', type: 'SPEAKING', prompt: 'Say this sentence out loud:', payload: { sourceText: sentence, answer: sentence, acceptable },
});

const GERMAN: PlacementItemDef[] = [
  // A1
  vocab('de', 'A1', 'What does "das Brot" mean?', ['bread', 'butter', 'cheese', 'water'], 'bread'),
  vocab('de', 'A1', 'Choose the best word: "Ich trinke jeden Morgen eine Tasse ___."', ['Kaffee', 'Brot', 'Stuhl', 'Hund'], 'Kaffee'),
  reading('de', 'A1', 'Ich heiße Anna und ich komme aus Wien. Ich wohne jetzt in Berlin.', 'Where does Anna live now?', ['In Berlin', 'In Vienna', 'In Munich', 'In Hamburg'], 'In Berlin'),
  listening('de', 'A1', 'Ich habe zwei Brüder und eine Schwester.', 'Listen and choose: how many brothers does the speaker have?', ['Two', 'One', 'Three', 'None'], 'Two'),
  writing('de', 'A1', 'My name is Tom.', 'Ich heiße Tom.', ['Mein Name ist Tom.', 'Ich bin Tom.', 'Ich heisse Tom.']),
  speaking('de', 'A1', 'Ich bin zwanzig Jahre alt.', ['Ich bin 20 Jahre alt.']),
  // A2
  vocab('de', 'A2', 'What does "der Bahnhof" mean?', ['train station', 'airport', 'bus stop', 'bank'], 'train station'),
  vocab('de', 'A2', 'Choose the best word: "Es regnet. Nimm bitte einen ___ mit."', ['Regenschirm', 'Sonnenbrille', 'Kühlschrank', 'Teppich'], 'Regenschirm'),
  reading(
    'de', 'A2',
    'Am Samstag war ich mit meiner Freundin auf dem Markt. Wir haben Obst und Gemüse gekauft. Danach haben wir in einem kleinen Café Kuchen gegessen.',
    'What did they do after the market?',
    ['They ate cake in a small café', 'They went to the cinema', 'They cooked at home', 'They bought clothes'],
    'They ate cake in a small café',
  ),
  listening('de', 'A2', 'Der Zug nach München fährt heute nicht um acht, sondern erst um halb zehn.', 'Listen and choose: when does the train to Munich leave today?', ['At 9:30', 'At 8:00', 'At 10:30', 'At 8:30'], 'At 9:30'),
  writing('de', 'A2', 'I went to the cinema yesterday.', 'Ich bin gestern ins Kino gegangen.', [
    'Gestern bin ich ins Kino gegangen.',
    'Ich ging gestern ins Kino.',
    'Gestern ging ich ins Kino.',
    'Ich bin gestern in das Kino gegangen.',
    'Gestern bin ich in das Kino gegangen.',
  ]),
  speaking('de', 'A2', 'Ich möchte zwei Karten für Samstag, bitte.', ['Ich möchte 2 Karten für Samstag, bitte.', 'Ich möchte zwei Karten für Samstag.']),
  // B1
  vocab('de', 'B1', 'Choose the best word: "Ich habe mich für die Stelle ___, aber noch keine Antwort bekommen."', ['beworben', 'beschwert', 'erholt', 'verabredet'], 'beworben'),
  vocab('de', 'B1', 'What does "Das kann ich mir nicht leisten" mean?', ['I can\'t afford that.', 'I can\'t imagine that.', 'I can\'t remember that.', 'I can\'t stand that.'], 'I can\'t afford that.'),
  reading(
    'de', 'B1',
    'Seit drei Monaten arbeite ich von zu Hause aus. Am Anfang fand ich das super, weil ich nicht mehr pendeln musste. Inzwischen fehlen mir aber meine Kollegen, und ich fühle mich manchmal einsam. Deshalb gehe ich jetzt zweimal pro Woche ins Büro.',
    'Why does the writer now go to the office twice a week?',
    ['They miss their colleagues and sometimes feel lonely', 'Their boss requires it', 'Their internet at home is too slow', 'They want to avoid commuting'],
    'They miss their colleagues and sometimes feel lonely',
  ),
  listening(
    'de', 'B1',
    'Wenn ich mehr Zeit hätte, würde ich gern einen Kochkurs machen, aber im Moment arbeite ich zu viel.',
    'Listen and choose: why doesn\'t the speaker take a cooking class?',
    ['They work too much at the moment', 'They don\'t like cooking', 'The course is too expensive', 'They have already taken one'],
    'They work too much at the moment',
  ),
  writing('de', 'B1', 'If I had more money, I would travel more.', 'Wenn ich mehr Geld hätte, würde ich mehr reisen.', [
    'Hätte ich mehr Geld, würde ich mehr reisen.',
    'Wenn ich mehr Geld hätte, würde ich öfter reisen.',
    'Hätte ich mehr Geld, würde ich öfter reisen.',
    'Ich würde mehr reisen, wenn ich mehr Geld hätte.',
  ]),
  speaking('de', 'B1', 'Obwohl es geregnet hat, sind wir spazieren gegangen.', ['Obwohl es geregnet hat, sind wir spazierengegangen.']),
  // B2
  vocab('de', 'B2', 'Choose the best word: "Die Regierung hat neue Maßnahmen ___, um den Energieverbrauch zu senken."', ['ergriffen', 'begriffen', 'angegriffen', 'vergriffen'], 'ergriffen'),
  vocab('de', 'B2', 'What does "etwas in Kauf nehmen" mean?', ['to accept a disadvantage', 'to buy something on impulse', 'to return something to a shop', 'to pay for something in instalments'], 'to accept a disadvantage'),
  reading(
    'de', 'B2',
    'Immer mehr Städte richten autofreie Zonen in ihren Innenstädten ein. Befürworter argumentieren, dass dadurch die Luftqualität steigt und der öffentliche Raum lebenswerter wird. Einzelhändler hingegen befürchten Umsatzeinbußen, da viele Kunden lieber dorthin fahren, wo sie parken können. Erste Studien deuten allerdings darauf hin, dass Fußgänger häufiger einkaufen gehen und insgesamt sogar mehr ausgeben. Ob sich dieser Trend langfristig bestätigt, bleibt jedoch abzuwarten.',
    'What do early studies suggest?',
    ['Pedestrians shop more often and spend more overall', 'Retailers lose most of their customers', 'Air quality does not improve', 'The long-term trend has already been confirmed'],
    'Pedestrians shop more often and spend more overall',
  ),
  listening(
    'de', 'B2',
    'Hätte ich damals gewusst, wie anstrengend das Studium neben dem Job sein würde, hätte ich mich vermutlich anders entschieden. Trotzdem bereue ich es nicht.',
    'Listen and choose: how does the speaker feel about their decision now?',
    ['They don\'t regret it, despite the difficulty', 'They regret it deeply', 'They found studying easy', 'They quit their job to study'],
    'They don\'t regret it, despite the difficulty',
  ),
  writing('de', 'B2', 'Despite the bad weather, the concert took place.', 'Trotz des schlechten Wetters fand das Konzert statt.', [
    'Das Konzert fand trotz des schlechten Wetters statt.',
    'Trotz des schlechten Wetters hat das Konzert stattgefunden.',
    'Das Konzert hat trotz des schlechten Wetters stattgefunden.',
    'Trotz dem schlechten Wetter fand das Konzert statt.',
    'Obwohl das Wetter schlecht war, fand das Konzert statt.',
  ]),
  speaking('de', 'B2', 'Es wäre sinnvoll, die Entscheidung noch einmal gründlich zu überdenken.', [
    'Es wäre sinnvoll, die Entscheidung nochmal gründlich zu überdenken.',
    'Es wäre sinnvoll, die Entscheidung noch mal gründlich zu überdenken.',
  ]),
];

const ENGLISH: PlacementItemDef[] = [
  // A1
  vocab('en', 'A1', 'Which word is a fruit?', ['apple', 'chair', 'shirt', 'bread'], 'apple'),
  vocab('en', 'A1', 'Choose the best word: "I wash my hands with soap and ___."', ['water', 'milk', 'paper', 'sugar'], 'water'),
  reading('en', 'A1', 'My name is Sam. I have a dog called Max.', 'What is the dog\'s name?', ['Max', 'Sam', 'Tom', 'Ben'], 'Max'),
  listening('en', 'A1', 'The shop opens at nine o\'clock.', 'Listen and choose: when does the shop open?', ['At 9:00', 'At 5:00', 'At 10:00', 'At 7:00'], 'At 9:00'),
  rewrite('A1', 'Write this sentence in the negative:', 'I like coffee.', 'I don\'t like coffee.', ['I do not like coffee.', 'I don\'t like coffee at all.', 'I do not like coffee at all.']),
  speaking('en', 'A1', 'I have two sisters and one brother.', ['I have 2 sisters and 1 brother.', 'I have 2 sisters and one brother.']),
  // A2
  vocab('en', 'A2', 'What does "borrow" mean?', ['to take something and give it back later', 'to give something as a present', 'to buy something cheaply', 'to lose something'], 'to take something and give it back later'),
  vocab('en', 'A2', 'Choose the best words: "I\'m tired, so I\'m going to ___ early tonight."', ['go to bed', 'wake up', 'get up', 'stay up'], 'go to bed'),
  reading(
    'en', 'A2',
    'Last weekend Tom went camping with his friends. On Saturday it was sunny, so they went swimming in the lake. On Sunday it rained, so they stayed in the tent and played cards.',
    'What did they do on Sunday?',
    ['They played cards in the tent', 'They swam in the lake', 'They went home early', 'They went hiking'],
    'They played cards in the tent',
  ),
  listening(
    'en', 'A2',
    'Sorry, I can\'t come to the meeting on Tuesday. Can we move it to Thursday afternoon?',
    'Listen and choose: when does the speaker want to have the meeting?',
    ['On Thursday afternoon', 'On Tuesday afternoon', 'On Thursday morning', 'On Tuesday morning'],
    'On Thursday afternoon',
  ),
  rewrite('A2', 'Rewrite this sentence in the past simple:', 'We eat dinner at seven.', 'We ate dinner at seven.', [
    'We ate dinner at 7.',
    'We had dinner at seven.',
    'We had dinner at 7.',
    'We ate dinner at seven o\'clock.',
    'We ate dinner at 7 o\'clock.',
  ]),
  speaking('en', 'A2', 'Could you tell me where the nearest bus stop is?', ['Can you tell me where the nearest bus stop is?']),
  // B1
  vocab('en', 'B1', 'Choose the best word: "The flight was ___ because of the storm, so we had to stay at the airport overnight."', ['cancelled', 'booked', 'boarded', 'landed'], 'cancelled'),
  vocab('en', 'B1', 'What does "put off" mean in "We had to put off the meeting"?', ['to postpone', 'to cancel completely', 'to start', 'to organise'], 'to postpone'),
  reading(
    'en', 'B1',
    'When Laura started her new job, she found the long commute exhausting. After a few weeks, she decided to buy a second-hand bike. Now she cycles to work three days a week and takes the train on the other days. She says she feels fitter and saves money too.',
    'How does Laura get to work on the days she doesn\'t cycle?',
    ['By train', 'By car', 'On foot', 'By bus'],
    'By train',
  ),
  listening(
    'en', 'B1',
    'I used to live in the city centre, but I moved to a small village last year because I wanted a quieter life. The only downside is that I now have to drive everywhere.',
    'Listen and choose: what is the disadvantage of living in the village?',
    ['The speaker has to drive everywhere', 'It is too noisy', 'The rent is too high', 'There are no neighbours'],
    'The speaker has to drive everywhere',
  ),
  rewrite('B1', 'Rewrite this sentence in the passive:', 'Someone stole my bike last night.', 'My bike was stolen last night.', [
    'My bike was stolen last night by someone.',
    'Last night my bike was stolen.',
    'My bicycle was stolen last night.',
    'My bike got stolen last night.',
  ]),
  speaking('en', 'B1', 'If it doesn\'t rain tomorrow, we\'ll go for a walk by the river.', [
    'If it does not rain tomorrow, we will go for a walk by the river.',
    'If it doesn\'t rain tomorrow, we will go for a walk by the river.',
  ]),
  // B2
  vocab('en', 'B2', 'Choose the best word: "Her argument was so ___ that even her critics had to agree with her."', ['compelling', 'compulsive', 'complacent', 'compliant'], 'compelling'),
  vocab('en', 'B2', 'What does "take something for granted" mean?', ['to fail to appreciate something because it is always there', 'to receive something as a gift', 'to accept an offer immediately', 'to take something without asking'], 'to fail to appreciate something because it is always there'),
  reading(
    'en', 'B2',
    'Remote work was once seen as a perk offered by only a handful of forward-thinking companies. Since the pandemic, however, it has become a standard expectation for many office workers. Employers point to lower office costs and access to a wider pool of talent. Critics, on the other hand, argue that junior staff miss out on the informal learning that happens when colleagues share a space. Some firms are therefore experimenting with hybrid models that require two or three days a week in the office.',
    'According to critics, who loses out most from remote work?',
    ['Junior staff', 'Senior managers', 'Employers', 'Customers'],
    'Junior staff',
  ),
  listening(
    'en', 'B2',
    'Had the council consulted local residents before approving the project, much of the current opposition could probably have been avoided.',
    'Listen and choose: what is the speaker\'s main point?',
    ['The council should have consulted residents first', 'Residents fully support the project', 'The project has been cancelled', 'The council consulted residents too often'],
    'The council should have consulted residents first',
  ),
  rewrite('B2', 'Rewrite this sentence starting with "Had":', 'If I had known about the traffic, I would have left earlier.', 'Had I known about the traffic, I would have left earlier.', [
    'Had I known about the traffic, I\'d have left earlier.',
    'Had I known about the traffic, I would\'ve left earlier.',
    'Had I known about the traffic, I would have left sooner.',
  ]),
  speaking('en', 'B2', 'Despite the initial setbacks, the project was eventually completed ahead of schedule.', [
    'Despite the initial set backs, the project was eventually completed ahead of schedule.',
  ]),
];

const SPANISH: PlacementItemDef[] = [
  // A1
  vocab('es', 'A1', 'What does "el perro" mean?', ['the dog', 'the cat', 'the bird', 'the horse'], 'the dog'),
  vocab('es', 'A1', 'Choose the best word: "Bebo un vaso de ___ porque tengo sed."', ['agua', 'pan', 'mesa', 'libro'], 'agua'),
  reading('es', 'A1', 'Me llamo Lucía y tengo veinte años. Vivo en Sevilla con mi familia.', 'Who does Lucía live with?', ['With her family', 'With friends', 'Alone', 'With her grandmother'], 'With her family'),
  listening('es', 'A1', 'Mi cumpleaños es el cinco de mayo.', 'Listen and choose: when is the speaker\'s birthday?', ['On 5 May', 'On 5 March', 'On 15 May', 'On 5 June'], 'On 5 May'),
  writing('es', 'A1', 'My name is Ana.', 'Me llamo Ana.', ['Mi nombre es Ana.', 'Yo me llamo Ana.', 'Soy Ana.']),
  speaking('es', 'A1', 'Tengo dos hermanos y una hermana.', ['Tengo 2 hermanos y una hermana.', 'Tengo 2 hermanos y 1 hermana.']),
  // A2
  vocab('es', 'A2', 'Choose the best word: "Hace mucho frío. Ponte el ___."', ['abrigo', 'bañador', 'cuchillo', 'espejo'], 'abrigo'),
  vocab('es', 'A2', 'What does "despertarse" mean?', ['to wake up', 'to fall asleep', 'to get dressed', 'to have breakfast'], 'to wake up'),
  reading(
    'es', 'A2',
    'El sábado pasado fui al mercado con mi madre. Compramos fruta, verdura y pescado fresco. Después comimos en un restaurante pequeño cerca de la plaza.',
    'Where did they eat?',
    ['In a small restaurant near the square', 'At home', 'At the market', 'In a café on the beach'],
    'In a small restaurant near the square',
  ),
  listening(
    'es', 'A2',
    'El autobús a Toledo sale a las diez y media, pero hoy va con veinte minutos de retraso.',
    'Listen and choose: what time will the bus to Toledo leave today?',
    ['At 10:50', 'At 10:30', 'At 10:20', 'At 11:00'],
    'At 10:50',
  ),
  writing('es', 'A2', 'Yesterday I ate at a restaurant.', 'Ayer comí en un restaurante.', [
    'Comí en un restaurante ayer.',
    'Ayer yo comí en un restaurante.',
    'Comí ayer en un restaurante.',
  ]),
  speaking('es', 'A2', '¿Me puede decir dónde está la estación de tren?', ['¿Puede decirme dónde está la estación de tren?', '¿Me podría decir dónde está la estación de tren?']),
  // B1
  vocab('es', 'B1', 'What does "Me he quedado sin batería" mean?', ['My battery has run out.', 'I\'ve left my battery at home.', 'I\'ve bought a new battery.', 'I\'ve charged my battery.'], 'My battery has run out.'),
  vocab('es', 'B1', 'Choose the best word: "Mañana tengo una ___ de trabajo y estoy muy nervioso."', ['entrevista', 'entrada', 'encuesta', 'enfermedad'], 'entrevista'),
  reading(
    'es', 'B1',
    'Cuando me mudé a Madrid para estudiar, no sabía cocinar nada. Durante los primeros meses comía casi siempre comida rápida y me sentía cansado. Un día mi compañera de piso me enseñó a preparar una tortilla de patatas, y desde entonces cocino casi todos los días.',
    'What changed after his flatmate\'s lesson?',
    ['He cooks almost every day', 'He stopped eating at home', 'He moved back home', 'He started working in a restaurant'],
    'He cooks almost every day',
  ),
  listening(
    'es', 'B1',
    'Llevo tres años estudiando inglés, pero todavía me cuesta entender las películas sin subtítulos.',
    'Listen and choose: what does the speaker still find difficult?',
    ['Understanding films without subtitles', 'Speaking on the phone', 'Writing emails', 'Reading newspapers'],
    'Understanding films without subtitles',
  ),
  writing('es', 'B1', 'I have never been to Mexico.', 'Nunca he estado en México.', [
    'No he estado nunca en México.',
    'Nunca he ido a México.',
    'No he ido nunca a México.',
    'Yo nunca he estado en México.',
    'Jamás he estado en México.',
  ]),
  speaking('es', 'B1', 'Cuando era pequeño, pasaba los veranos en casa de mis abuelos.', ['Cuando era pequeña, pasaba los veranos en casa de mis abuelos.']),
  // B2
  vocab('es', 'B2', 'Choose the best word: "El gobierno ha decidido ___ medidas para reducir la contaminación."', ['adoptar', 'adaptar', 'adeudar', 'adornar'], 'adoptar'),
  vocab('es', 'B2', 'What does "estar hasta las narices" mean?', ['to be fed up', 'to have a cold', 'to be very curious', 'to be extremely busy'], 'to be fed up'),
  reading(
    'es', 'B2',
    'En los últimos años, el turismo masivo se ha convertido en un tema polémico en muchas ciudades costeras. Aunque genera empleo e ingresos, los vecinos se quejan de que los alquileres han subido tanto que ya no pueden permitirse vivir en su propio barrio. Algunos ayuntamientos han empezado a limitar los pisos turísticos, una medida que muchos propietarios consideran injusta. Los expertos, por su parte, advierten de que no existe una solución única. Cada ciudad, según ellos, tendrá que encontrar su propio equilibrio.',
    'What do the experts say?',
    ['There is no one-size-fits-all solution', 'Tourist flats should be banned everywhere', 'Tourism creates no jobs', 'Rents will soon fall'],
    'There is no one-size-fits-all solution',
  ),
  listening(
    'es', 'B2',
    'Si me hubieran avisado con antelación, habría podido reorganizar mi agenda, pero me enteré de la reunión una hora antes.',
    'Listen and choose: why couldn\'t the speaker reorganise their schedule?',
    ['They only found out about the meeting an hour before', 'They were ill', 'They forgot about the meeting', 'Their boss cancelled the meeting'],
    'They only found out about the meeting an hour before',
  ),
  writing('es', 'B2', 'If I had known, I would have come earlier.', 'Si lo hubiera sabido, habría venido antes.', [
    'Si lo hubiese sabido, habría venido antes.',
    'Si lo hubiera sabido, hubiera venido antes.',
    'Si lo hubiese sabido, hubiera venido antes.',
    'Habría venido antes si lo hubiera sabido.',
    'De haberlo sabido, habría venido antes.',
  ]),
  speaking('es', 'B2', 'Aunque el proyecto costó más de lo previsto, se terminó en solo seis meses.', [
    'Aunque el proyecto costó más de lo previsto, se terminó en solo 6 meses.',
    'Aunque el proyecto costó más de lo previsto, se terminó en sólo seis meses.',
    'Aunque el proyecto costó más de lo previsto, se terminó en sólo 6 meses.',
  ]),
];

const FRENCH: PlacementItemDef[] = [
  // A1
  vocab('fr', 'A1', 'What does "le chat" mean?', ['the cat', 'the dog', 'the horse', 'the fish'], 'the cat'),
  vocab('fr', 'A1', 'Choose the best word: "Le matin, je bois un café avec du ___."', ['lait', 'fromage', 'poulet', 'riz'], 'lait'),
  reading('fr', 'A1', 'Je m\'appelle Léa. J\'habite à Lyon avec mon frère.', 'Who does Léa live with?', ['With her brother', 'With her sister', 'With her parents', 'Alone'], 'With her brother'),
  listening('fr', 'A1', 'J\'ai trois enfants : deux filles et un garçon.', 'Listen and choose: how many daughters does the speaker have?', ['Two', 'Three', 'One', 'None'], 'Two'),
  writing('fr', 'A1', 'My name is Paul.', 'Je m\'appelle Paul.', ['Mon nom est Paul.', 'Moi, c\'est Paul.', 'Je suis Paul.']),
  speaking('fr', 'A1', 'J\'ai vingt ans et j\'habite à Paris.', ['J\'ai 20 ans et j\'habite à Paris.']),
  // A2
  vocab('fr', 'A2', 'What does "la gare" mean?', ['the train station', 'the airport', 'the garage', 'the bank'], 'the train station'),
  vocab('fr', 'A2', 'Choose the best word: "Il pleut ! N\'oublie pas ton ___."', ['parapluie', 'maillot de bain', 'oreiller', 'four'], 'parapluie'),
  reading(
    'fr', 'A2',
    'Samedi dernier, je suis allée au marché avec ma grand-mère. Nous avons acheté des fruits et du fromage. Ensuite, nous avons mangé une crêpe dans un petit café.',
    'What did they do after the market?',
    ['They ate a crêpe in a small café', 'They went to the cinema', 'They cooked at home', 'They visited a museum'],
    'They ate a crêpe in a small café',
  ),
  listening(
    'fr', 'A2',
    'Le train pour Marseille ne part pas à huit heures, mais à neuf heures et quart.',
    'Listen and choose: when does the train to Marseille leave?',
    ['At 9:15', 'At 8:00', 'At 8:15', 'At 9:45'],
    'At 9:15',
  ),
  writing('fr', 'A2', 'We went to the beach yesterday.', 'Nous sommes allés à la plage hier.', [
    'Hier, nous sommes allés à la plage.',
    'Nous sommes allées à la plage hier.',
    'On est allés à la plage hier.',
    'On est allé à la plage hier.',
    'Hier, on est allés à la plage.',
  ]),
  speaking('fr', 'A2', 'Est-ce que vous pouvez m\'aider, s\'il vous plaît ?', ['Pouvez-vous m\'aider, s\'il vous plaît ?', 'Est-ce que vous pouvez m\'aider ?']),
  // B1
  vocab('fr', 'B1', 'Choose the best word: "J\'ai ___ ma candidature pour ce poste, mais je n\'ai pas encore de réponse."', ['envoyé', 'rangé', 'cuisiné', 'rêvé'], 'envoyé'),
  vocab('fr', 'B1', 'What does "Je n\'en peux plus" mean?', ['I can\'t take it anymore.', 'I can\'t find it.', 'I don\'t have any more.', 'I can\'t go there.'], 'I can\'t take it anymore.'),
  reading(
    'fr', 'B1',
    'Depuis six mois, je vais au travail à vélo. Au début, c\'était difficile parce qu\'il y a beaucoup de côtes dans ma ville. Maintenant, je suis en meilleure forme et je ne pourrais plus m\'en passer. En plus, j\'économise l\'argent de l\'essence.',
    'Why was cycling to work difficult at first?',
    ['There are many hills in the town', 'The weather was bad', 'The bike was broken', 'The office is very far away'],
    'There are many hills in the town',
  ),
  listening(
    'fr', 'B1',
    'Si j\'avais plus de temps libre, je prendrais des cours de théâtre, mais en ce moment je travaille trop.',
    'Listen and choose: why doesn\'t the speaker take drama classes?',
    ['They work too much at the moment', 'They don\'t like the theatre', 'The classes are too expensive', 'They have already taken some'],
    'They work too much at the moment',
  ),
  writing('fr', 'B1', 'I have been living here for two years.', 'J\'habite ici depuis deux ans.', [
    'J\'habite ici depuis 2 ans.',
    'Je vis ici depuis deux ans.',
    'Je vis ici depuis 2 ans.',
    'Ça fait deux ans que j\'habite ici.',
    'Ça fait deux ans que je vis ici.',
  ]),
  speaking('fr', 'B1', 'Quand j\'étais petit, je passais mes vacances chez mes grands-parents.', ['Quand j\'étais petite, je passais mes vacances chez mes grands-parents.']),
  // B2
  vocab('fr', 'B2', 'Choose the best word: "Le gouvernement a pris des mesures pour ___ la pollution dans les grandes villes."', ['réduire', 'déduire', 'induire', 'séduire'], 'réduire'),
  vocab('fr', 'B2', 'What does "avoir du pain sur la planche" mean?', ['to have a lot of work to do', 'to be very hungry', 'to be rich', 'to be lazy'], 'to have a lot of work to do'),
  reading(
    'fr', 'B2',
    'Le télétravail, autrefois réservé à quelques entreprises pionnières, s\'est largement généralisé ces dernières années. Les employeurs y voient l\'occasion de réduire leurs coûts immobiliers et de recruter au-delà de leur région. Les syndicats, eux, s\'inquiètent de la frontière de plus en plus floue entre vie professionnelle et vie privée. Par ailleurs, certains jeunes salariés regrettent de ne pas pouvoir apprendre au contact de collègues plus expérimentés. C\'est pourquoi de nombreuses entreprises optent désormais pour un modèle hybride.',
    'What worries the trade unions?',
    ['The increasingly blurred line between work and private life', 'Rising property costs', 'Recruiting outside the region', 'The end of hybrid models'],
    'The increasingly blurred line between work and private life',
  ),
  listening(
    'fr', 'B2',
    'Bien que le projet ait pris du retard, l\'équipe a réussi à le livrer avant la fin de l\'année.',
    'Listen and choose: what happened to the project?',
    ['It was delayed but delivered before the end of the year', 'It was cancelled', 'It was finished early without any problems', 'It will be delivered next year'],
    'It was delayed but delivered before the end of the year',
  ),
  writing('fr', 'B2', 'I would have come if I had known.', 'Je serais venu si j\'avais su.', [
    'Je serais venue si j\'avais su.',
    'Si j\'avais su, je serais venu.',
    'Si j\'avais su, je serais venue.',
    'Je serais venu si je l\'avais su.',
    'Si je l\'avais su, je serais venu.',
  ]),
  speaking('fr', 'B2', 'Il faut que nous trouvions une solution avant la fin du mois.', ['Il faut qu\'on trouve une solution avant la fin du mois.']),
];

const ITALIAN: PlacementItemDef[] = [
  // A1
  vocab('it', 'A1', 'What does "il cane" mean?', ['the dog', 'the cat', 'the house', 'the car'], 'the dog'),
  vocab('it', 'A1', 'Choose the best word: "Ho fame. Vorrei mangiare una ___."', ['pizza', 'sedia', 'finestra', 'macchina'], 'pizza'),
  reading('it', 'A1', 'Mi chiamo Marco e abito a Roma. Lavoro in un ristorante.', 'Where does Marco work?', ['In a restaurant', 'In a school', 'In a bank', 'In a hospital'], 'In a restaurant'),
  listening('it', 'A1', 'Il negozio apre alle otto e chiude alle sette di sera.', 'Listen and choose: when does the shop open?', ['At 8:00', 'At 7:00', 'At 9:00', 'At 6:00'], 'At 8:00'),
  writing('it', 'A1', 'My name is Giulia.', 'Mi chiamo Giulia.', ['Il mio nome è Giulia.', 'Io mi chiamo Giulia.', 'Sono Giulia.']),
  speaking('it', 'A1', 'Ho ventidue anni e abito a Milano.', ['Ho 22 anni e abito a Milano.']),
  // A2
  vocab('it', 'A2', 'What does "la stazione" mean?', ['the station', 'the season', 'the square', 'the shop'], 'the station'),
  vocab('it', 'A2', 'Choose the best word: "Fa freddo, mettiti il ___."', ['cappotto', 'costume da bagno', 'cuscino', 'forno'], 'cappotto'),
  reading(
    'it', 'A2',
    'Sabato scorso sono andata al mare con le mie amiche. Abbiamo fatto il bagno e preso il sole tutto il giorno. La sera abbiamo mangiato una pizza in un piccolo ristorante sul lungomare.',
    'What did they do in the evening?',
    ['They ate pizza in a small restaurant', 'They went swimming', 'They went to a club', 'They cooked at home'],
    'They ate pizza in a small restaurant',
  ),
  listening(
    'it', 'A2',
    'Il treno per Firenze non parte alle nove, ma alle dieci e mezza.',
    'Listen and choose: when does the train to Florence leave?',
    ['At 10:30', 'At 9:00', 'At 9:30', 'At 10:00'],
    'At 10:30',
  ),
  writing('it', 'A2', 'Yesterday I went to the cinema.', 'Ieri sono andato al cinema.', [
    'Ieri sono andata al cinema.',
    'Sono andato al cinema ieri.',
    'Sono andata al cinema ieri.',
    'Ieri io sono andato al cinema.',
    'Ieri io sono andata al cinema.',
  ]),
  speaking('it', 'A2', 'Scusi, mi sa dire dov\'è la fermata dell\'autobus?', [
    'Scusi, mi sa dire dove è la fermata dell\'autobus?',
    'Scusi, mi può dire dov\'è la fermata dell\'autobus?',
  ]),
  // B1
  vocab('it', 'B1', 'What does "Non vedo l\'ora" mean?', ['I can\'t wait.', 'I don\'t know the time.', 'I can\'t see well.', 'I\'m running late.'], 'I can\'t wait.'),
  vocab('it', 'B1', 'Choose the best word: "Domani ho un ___ di lavoro e sono un po\' nervoso."', ['colloquio', 'contorno', 'cortile', 'coltello'], 'colloquio'),
  reading(
    'it', 'B1',
    'Da quando mi sono trasferito a Bologna, vado al lavoro in bicicletta. All\'inizio era faticoso, perché non ero abituato a pedalare ogni giorno. Adesso mi sento molto più in forma e risparmio anche i soldi della benzina. L\'unico problema è quando piove.',
    'What is the only problem the writer mentions?',
    ['When it rains', 'The hills', 'The heavy traffic', 'The price of bikes'],
    'When it rains',
  ),
  listening(
    'it', 'B1',
    'Se avessi più tempo libero, imparerei a suonare il pianoforte, ma in questo periodo lavoro troppo.',
    'Listen and choose: what would the speaker do with more free time?',
    ['Learn to play the piano', 'Travel more', 'Take a cooking class', 'Learn a new language'],
    'Learn to play the piano',
  ),
  writing('it', 'B1', 'I have never been to Sicily.', 'Non sono mai stato in Sicilia.', [
    'Non sono mai stata in Sicilia.',
    'Io non sono mai stato in Sicilia.',
    'Io non sono mai stata in Sicilia.',
    'Non sono mai andato in Sicilia.',
    'Non sono mai andata in Sicilia.',
  ]),
  speaking('it', 'B1', 'Quando ero piccolo, passavo l\'estate dai miei nonni.', ['Quando ero piccola, passavo l\'estate dai miei nonni.']),
  // B2
  vocab('it', 'B2', 'Choose the best word: "Il governo ha deciso di ___ nuove misure contro l\'inquinamento."', ['adottare', 'adattare', 'addestrare', 'addolcire'], 'adottare'),
  vocab('it', 'B2', 'What does "essere al verde" mean?', ['to be broke', 'to be inexperienced', 'to be envious', 'to be in the countryside'], 'to be broke'),
  reading(
    'it', 'B2',
    'Negli ultimi anni il turismo di massa è diventato un tema molto discusso in città come Venezia e Firenze. Se da un lato porta lavoro e ricchezza, dall\'altro gli abitanti lamentano che gli affitti sono aumentati al punto da costringerli a trasferirsi altrove. Alcuni comuni hanno introdotto limiti agli affitti brevi, una scelta che molti proprietari giudicano ingiusta. Gli esperti sottolineano che non esiste una soluzione valida per tutti. Ogni città, secondo loro, dovrà trovare il proprio equilibrio.',
    'Why do residents complain?',
    ['Rents have risen so much that they are forced to move away', 'There are not enough tourists', 'Short-term rentals have been banned everywhere', 'Restaurants are closing down'],
    'Rents have risen so much that they are forced to move away',
  ),
  listening(
    'it', 'B2',
    'Se mi avessero avvisato in tempo, avrei potuto spostare l\'appuntamento, ma l\'ho saputo solo stamattina.',
    'Listen and choose: why couldn\'t the speaker move the appointment?',
    ['They only found out this morning', 'They were ill', 'They forgot about it', 'The office was closed'],
    'They only found out this morning',
  ),
  writing('it', 'B2', 'Although it was raining, we went out.', 'Anche se pioveva, siamo usciti.', [
    'Benché piovesse, siamo usciti.',
    'Sebbene piovesse, siamo usciti.',
    'Nonostante piovesse, siamo usciti.',
    'Siamo usciti anche se pioveva.',
    'Anche se pioveva, siamo uscite.',
  ]),
  speaking('it', 'B2', 'È importante che tutti facciano la loro parte per proteggere l\'ambiente.', [
    'E\' importante che tutti facciano la loro parte per proteggere l\'ambiente.',
  ]),
];

export const PLACEMENT_ITEMS: PlacementItemDef[] = [...GERMAN, ...ENGLISH, ...SPANISH, ...FRENCH, ...ITALIAN];
