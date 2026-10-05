import type { Level } from './types';

/**
 * CEFR curriculum outline. Each module expands into five lessons
 * (vocabulary → grammar → reading → listening → speaking & writing), so
 * German yields 4 levels × 10 modules × 5 lessons = 200 lessons. Lesson
 * bodies are stored as structured JSON (Lesson.content) and stay editable
 * through the admin CMS.
 */
export interface ModuleTheme {
  slug: string;
  title: string;
  goal: string;
  /** Vocabulary category from vocabulary.ts used to fill the lesson word list. */
  vocab: string;
  /** Grammar topic slug from grammar.ts. */
  grammar: string;
  /** Short reading text in the target language. */
  text: string;
  /** English gloss of the text, for the explanation-language toggle. */
  gloss: string;
  speaking: string;
  writing: string;
  /** Mission slug that applies the module in the language world. */
  mission?: string;
}

export const CURRICULUM_DE: Record<Level, ModuleTheme[]> = {
  A1: [
    { slug: 'hello', title: 'Hello & introductions', goal: 'Greet people and introduce yourself.', vocab: 'basics', grammar: 'personal-pronouns',
      text: 'Hallo! Ich heiße Sofia. Ich komme aus Spanien und wohne jetzt in Berlin. Ich lerne Deutsch.', gloss: 'Hello! My name is Sofia. I come from Spain and now live in Berlin. I am learning German.',
      speaking: 'Introduce yourself: name, country, city.', writing: 'Write three sentences about yourself.', mission: 'introduce-yourself' },
    { slug: 'cafe-basics', title: 'At the café', goal: 'Order drinks and food politely.', vocab: 'food & drink', grammar: 'accusative',
      text: 'Im Café bestellt Paul einen Kaffee mit Milch und ein Stück Kuchen. Das kostet sieben Euro.', gloss: 'In the café Paul orders a coffee with milk and a piece of cake. That costs seven euros.',
      speaking: 'Order a drink and a snack.', writing: 'Write your perfect café order.', mission: 'at-the-cafe' },
    { slug: 'numbers-time', title: 'Numbers & time', goal: 'Talk about times, dates and prices.', vocab: 'time', grammar: 'word-order',
      text: 'Der Kurs beginnt um neun Uhr. Am Montag habe ich frei. Am Dienstag arbeite ich bis fünf.', gloss: 'The course starts at nine. On Monday I am off. On Tuesday I work until five.',
      speaking: 'Describe your week with days and times.', writing: 'Write your schedule for tomorrow.' },
    { slug: 'family', title: 'Family & people', goal: 'Talk about family and friends.', vocab: 'people', grammar: 'verb-haben',
      text: 'Ich habe einen Bruder und eine Schwester. Mein Bruder ist zwanzig Jahre alt. Meine Schwester studiert.', gloss: 'I have a brother and a sister. My brother is twenty. My sister is studying.',
      speaking: 'Describe one family member.', writing: 'Write about your family.' },
    { slug: 'home', title: 'Home & living', goal: 'Describe your apartment and daily life.', vocab: 'home', grammar: 'articles',
      text: 'Meine Wohnung ist klein, aber hell. Die Küche ist neu. Das Bad ist leider sehr klein.', gloss: 'My apartment is small but bright. The kitchen is new. Unfortunately the bathroom is very small.',
      speaking: 'Describe your home.', writing: 'Describe your favourite room.', mission: 'calling-the-landlord' },
    { slug: 'shopping', title: 'Shopping', goal: 'Buy things and ask for prices.', vocab: 'shopping', grammar: 'plural',
      text: 'Im Supermarkt kaufe ich Brot, Äpfel und zwei Flaschen Wasser. Die Äpfel sind heute billig.', gloss: 'At the supermarket I buy bread, apples and two bottles of water. The apples are cheap today.',
      speaking: 'Make a shopping list out loud.', writing: 'Write a shopping list with quantities.', mission: 'where-is-the-milk' },
    { slug: 'directions', title: 'Around town', goal: 'Ask for and understand directions.', vocab: 'directions', grammar: 'dative',
      text: 'Entschuldigung, wo ist der Bahnhof? Gehen Sie geradeaus und dann die zweite Straße links.', gloss: 'Excuse me, where is the station? Go straight ahead and then the second street on the left.',
      speaking: 'Explain the way from your home to a café.', writing: 'Write directions to your favourite place.', mission: 'asking-for-directions' },
    { slug: 'transport', title: 'Getting around', goal: 'Buy tickets and use public transport.', vocab: 'travel', grammar: 'present-tense',
      text: 'Ich fahre jeden Tag mit der U-Bahn. Heute nehme ich den Bus, denn die U-Bahn hat Verspätung.', gloss: 'I take the underground every day. Today I take the bus, because the underground is delayed.',
      speaking: 'Buy a ticket to the city centre.', writing: 'Describe your way to work or school.', mission: 'buying-a-ticket' },
    { slug: 'health-basics', title: 'Feeling unwell', goal: 'Describe simple symptoms.', vocab: 'health', grammar: 'verb-sein',
      text: 'Ich bin krank. Ich habe Kopfschmerzen und Fieber. Ich gehe heute zum Arzt.', gloss: 'I am ill. I have a headache and a fever. I am going to the doctor today.',
      speaking: 'Tell a doctor how you feel.', writing: 'Write a short sick note to your teacher.', mission: 'at-the-doctor' },
    { slug: 'restaurant', title: 'Eating out', goal: 'Reserve a table and order a meal.', vocab: 'food & drink', grammar: 'accusative',
      text: 'Wir möchten einen Tisch für zwei Personen um acht Uhr reservieren. Ich nehme die Suppe.', gloss: 'We would like to reserve a table for two at eight. I will have the soup.',
      speaking: 'Reserve a table by phone.', writing: 'Write a short restaurant review.', mission: 'table-for-two' },
  ],
  A2: [
    { slug: 'past-weekend', title: 'Last weekend', goal: 'Talk about past events.', vocab: 'everyday', grammar: 'perfect-tense',
      text: 'Am Wochenende bin ich nach Hamburg gefahren. Ich habe Freunde besucht und wir haben am Hafen gegessen.', gloss: 'At the weekend I went to Hamburg. I visited friends and we ate at the harbour.',
      speaking: 'Tell someone about your last weekend.', writing: 'Write a postcard about a trip.' },
    { slug: 'plans', title: 'Plans & wishes', goal: 'Talk about plans, obligations and wishes.', vocab: 'everyday', grammar: 'modal-verbs',
      text: 'Nächste Woche muss ich viel arbeiten. Am Freitag möchte ich ins Kino gehen. Kannst du mitkommen?', gloss: 'Next week I have to work a lot. On Friday I would like to go to the cinema. Can you come along?',
      speaking: 'Make plans with a friend.', writing: 'Write an invitation.', mission: 'weekend-plans' },
    { slug: 'reasons', title: 'Giving reasons', goal: 'Explain why with weil and dass.', vocab: 'everyday', grammar: 'subordinate-clauses',
      text: 'Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte. Ich glaube, dass es mir hilft.', gloss: 'I am learning German because I want to work in Germany. I think that it will help me.',
      speaking: 'Explain why you learn this language.', writing: 'Write about a decision and its reasons.' },
    { slug: 'comparing', title: 'Comparing things', goal: 'Compare places and products.', vocab: 'shopping', grammar: 'comparative',
      text: 'Berlin ist größer als München, aber München ist teurer. Am schönsten finde ich Hamburg.', gloss: 'Berlin is bigger than Munich, but Munich is more expensive. I find Hamburg the most beautiful.',
      speaking: 'Compare two cities you know.', writing: 'Compare two phones or laptops.', mission: 'returning-a-product' },
    { slug: 'routines', title: 'Daily routines', goal: 'Describe routines with reflexive verbs.', vocab: 'home', grammar: 'reflexive-verbs',
      text: 'Ich stehe um sieben auf, dusche mich und ziehe mich schnell an. Abends entspanne ich mich.', gloss: 'I get up at seven, shower and get dressed quickly. In the evening I relax.',
      speaking: 'Describe your morning routine.', writing: 'Write about your perfect day.' },
    { slug: 'travel', title: 'Travelling', goal: 'Handle hotels, airports and problems.', vocab: 'travel', grammar: 'common-prepositions',
      text: 'Mein Koffer ist nicht angekommen. Ich gehe zum Schalter und erkläre das Problem.', gloss: 'My suitcase did not arrive. I go to the counter and explain the problem.',
      speaking: 'Report lost luggage.', writing: 'Write a complaint email to a hotel.', mission: 'lost-luggage' },
    { slug: 'health', title: 'At the doctor', goal: 'Describe symptoms and understand advice.', vocab: 'health', grammar: 'modal-verbs',
      text: 'Die Ärztin sagt, ich soll viel trinken und drei Tage im Bett bleiben. Ich darf keinen Sport machen.', gloss: 'The doctor says I should drink a lot and stay in bed for three days. I am not allowed to do sport.',
      speaking: 'Explain your symptoms in detail.', writing: 'Write down the doctor\'s advice.', mission: 'at-the-pharmacy' },
    { slug: 'work-intro', title: 'First day at work', goal: 'Introduce yourself at work.', vocab: 'work', grammar: 'perfect-tense',
      text: 'Heute ist mein erster Tag im Büro. Meine Kollegin zeigt mir alles. Die Kantine ist im Erdgeschoss.', gloss: 'Today is my first day at the office. My colleague shows me everything. The canteen is on the ground floor.',
      speaking: 'Introduce yourself to a new team.', writing: 'Write an email to your new team.', mission: 'first-day-at-work' },
    { slug: 'paperwork', title: 'Paperwork', goal: 'Register an address and fill in forms.', vocab: 'bureaucracy', grammar: 'word-order',
      text: 'Ich muss mich beim Bürgeramt anmelden. Ich brauche meinen Pass und den Mietvertrag.', gloss: 'I have to register at the citizens office. I need my passport and the rental contract.',
      speaking: 'Ask which documents you need.', writing: 'Fill in a registration form.', mission: 'registering-your-address' },
    { slug: 'free-time', title: 'Free time', goal: 'Talk about hobbies and preferences.', vocab: 'everyday', grammar: 'superlative',
      text: 'In meiner Freizeit lese ich gern. Am liebsten lese ich Krimis. Am Wochenende gehe ich oft wandern.', gloss: 'In my free time I like reading. Most of all I like crime novels. At the weekend I often go hiking.',
      speaking: 'Talk about your favourite hobby.', writing: 'Write a profile for a language exchange.' },
  ],
  B1: [
    { slug: 'hypotheticals', title: 'If I could…', goal: 'Talk about wishes and hypotheticals.', vocab: 'opinion', grammar: 'konjunktiv-2',
      text: 'Wenn ich mehr Zeit hätte, würde ich ein Instrument lernen. Ich wäre gern Musikerin geworden.', gloss: 'If I had more time, I would learn an instrument. I would have liked to become a musician.',
      speaking: 'Describe what you would do with a free year.', writing: 'Write about a dream.' },
    { slug: 'processes', title: 'How things are done', goal: 'Describe processes with the passive.', vocab: 'work', grammar: 'passive',
      text: 'Die Bestellung wird heute bearbeitet und morgen verschickt. Die Rechnung wird per E-Mail gesendet.', gloss: 'The order is processed today and shipped tomorrow. The invoice is sent by email.',
      speaking: 'Explain how something is produced.', writing: 'Describe a process at your workplace.' },
    { slug: 'describing-people', title: 'Describing people', goal: 'Add detail with relative clauses.', vocab: 'work', grammar: 'relative-clauses',
      text: 'Die Kollegin, die neben mir sitzt, kommt aus Wien. Das Projekt, an dem wir arbeiten, ist spannend.', gloss: 'The colleague who sits next to me comes from Vienna. The project we are working on is exciting.',
      speaking: 'Describe a person who inspired you.', writing: 'Write about a memorable person.' },
    { slug: 'polite-questions', title: 'Asking politely', goal: 'Ask indirect questions.', vocab: 'bureaucracy', grammar: 'indirect-questions',
      text: 'Könnten Sie mir sagen, wann das Büro öffnet? Ich wüsste gern, ob ich einen Termin brauche.', gloss: 'Could you tell me when the office opens? I would like to know if I need an appointment.',
      speaking: 'Ask an official three polite questions.', writing: 'Write a formal enquiry email.', mission: 'residence-permit' },
    { slug: 'job-search', title: 'Job search', goal: 'Talk about experience and strengths.', vocab: 'work', grammar: 'complex-subordinate-clauses',
      text: 'Nachdem ich mein Studium beendet hatte, habe ich zwei Jahre in einer Agentur gearbeitet.', gloss: 'After I had finished my degree, I worked at an agency for two years.',
      speaking: 'Answer: "Tell me about yourself."', writing: 'Write a short cover letter.', mission: 'job-interview' },
    { slug: 'opinions', title: 'Opinions', goal: 'Express and justify opinions.', vocab: 'opinion', grammar: 'subordinate-clauses',
      text: 'Meiner Meinung nach sollte man weniger fliegen. Ich finde aber, dass Züge billiger werden müssen.', gloss: 'In my opinion we should fly less. But I think trains must get cheaper.',
      speaking: 'Give your opinion on remote work.', writing: 'Write a comment on a news article.', mission: 'debate-remote-work' },
    { slug: 'complaints', title: 'Complaints', goal: 'Complain politely but firmly.', vocab: 'shopping', grammar: 'konjunktiv-2',
      text: 'Leider funktioniert das Gerät nicht. Ich hätte gern mein Geld zurück oder ein neues Gerät.', gloss: 'Unfortunately the device does not work. I would like my money back or a new device.',
      speaking: 'Complain about a delayed order.', writing: 'Write a complaint letter.', mission: 'difficult-customer' },
    { slug: 'media', title: 'Media & news', goal: 'Summarise and discuss news.', vocab: 'society', grammar: 'passive',
      text: 'In der Zeitung wird berichtet, dass die Mieten weiter steigen. Viele Menschen suchen günstigere Wohnungen.', gloss: 'The newspaper reports that rents keep rising. Many people are looking for cheaper apartments.',
      speaking: 'Summarise a news story you read.', writing: 'Write a short news summary.' },
    { slug: 'connecting-ideas', title: 'Connecting ideas', goal: 'Use connectors for longer answers.', vocab: 'connectors', grammar: 'complex-subordinate-clauses',
      text: 'Obwohl es regnete, sind wir spazieren gegangen. Danach haben wir Tee getrunken, damit uns warm wird.', gloss: 'Although it was raining, we went for a walk. Afterwards we drank tea to get warm.',
      speaking: 'Tell a story using obwohl and nachdem.', writing: 'Write a short story with five connectors.' },
    { slug: 'study', title: 'Studying abroad', goal: 'Handle university situations.', vocab: 'everyday', grammar: 'relative-clauses',
      text: 'Das Seminar, das ich gewählt habe, findet dienstags statt. Die Hausarbeit muss bis Ende Juli abgegeben werden.', gloss: 'The seminar I chose takes place on Tuesdays. The term paper must be handed in by the end of July.',
      speaking: 'Ask a lecturer about an assignment.', writing: 'Write an email to a professor.', mission: 'group-project' },
  ],
  B2: [
    { slug: 'formal-writing', title: 'Formal writing', goal: 'Write in a formal register.', vocab: 'business', grammar: 'formal-language',
      text: 'Hiermit möchte ich mich auf die ausgeschriebene Stelle bewerben. Für Rückfragen stehe ich Ihnen gern zur Verfügung.', gloss: 'I hereby apply for the advertised position. I am happy to answer any questions.',
      speaking: 'Present yourself formally in two minutes.', writing: 'Write a formal application.' },
    { slug: 'argumentation', title: 'Building arguments', goal: 'Argue a position convincingly.', vocab: 'opinion', grammar: 'argumentation',
      text: 'Einerseits bietet Homeoffice mehr Flexibilität, andererseits fehlt der persönliche Austausch.', gloss: 'On the one hand, working from home offers more flexibility; on the other, personal exchange is missing.',
      speaking: 'Argue for and against a four-day week.', writing: 'Write a short argumentative essay.', mission: 'debate-social-media' },
    { slug: 'nominal-style', title: 'Nominal style', goal: 'Understand and use nominalisation.', vocab: 'business', grammar: 'nominalization',
      text: 'Nach der Prüfung der Unterlagen erfolgt die Entscheidung über die Vergabe des Auftrags.', gloss: 'After the documents have been reviewed, the decision on awarding the contract is made.',
      speaking: 'Explain a complex process clearly.', writing: 'Rewrite a text in nominal style.' },
    { slug: 'negotiation', title: 'Negotiating', goal: 'Negotiate and find compromises.', vocab: 'business', grammar: 'konjunktiv-2',
      text: 'Wir könnten Ihnen entgegenkommen, wenn Sie eine längere Vertragslaufzeit akzeptieren würden.', gloss: 'We could meet you halfway if you would accept a longer contract term.',
      speaking: 'Negotiate a salary.', writing: 'Write a counter-offer.', mission: 'salary-negotiation' },
    { slug: 'presentations', title: 'Presentations', goal: 'Structure and deliver a presentation.', vocab: 'business', grammar: 'advanced-sentence-structures',
      text: 'Zunächst stelle ich Ihnen die Ergebnisse vor. Anschließend gehe ich auf die nächsten Schritte ein.', gloss: 'First I will present the results. Then I will go into the next steps.',
      speaking: 'Give a two-minute presentation.', writing: 'Write the outline of a presentation.', mission: 'presenting-a-project' },
    { slug: 'society', title: 'Society & change', goal: 'Discuss social topics in depth.', vocab: 'society', grammar: 'complex-connectors',
      text: 'Je mehr Menschen in die Städte ziehen, desto knapper wird der Wohnraum.', gloss: 'The more people move to the cities, the scarcer housing becomes.',
      speaking: 'Discuss a social challenge in your country.', writing: 'Write about a trend in society.' },
    { slug: 'register', title: 'Spoken vs. written', goal: 'Switch between registers.', vocab: 'connectors', grammar: 'stylistic-differences',
      text: 'Mündlich sagt man oft „Ich hab keine Zeit“, schriftlich aber „Leider habe ich keine Zeit“.', gloss: 'In speech people often say "I got no time", but in writing "Unfortunately I have no time".',
      speaking: 'Retell a formal text casually.', writing: 'Rewrite a chat message as a formal email.' },
    { slug: 'conflict', title: 'Handling conflict', goal: 'Resolve disagreements diplomatically.', vocab: 'business', grammar: 'formal-language',
      text: 'Ich verstehe Ihren Standpunkt, allerdings sehe ich das etwas anders. Lassen Sie uns eine Lösung finden.', gloss: 'I understand your point of view, but I see it slightly differently. Let us find a solution.',
      speaking: 'Calm down an unhappy customer.', writing: 'Write a diplomatic reply to criticism.', mission: 'difficult-customer' },
    { slug: 'science', title: 'Science & technology', goal: 'Explain abstract topics.', vocab: 'society', grammar: 'nominalization',
      text: 'Durch den Einsatz künstlicher Intelligenz verändert sich die Arbeitswelt grundlegend.', gloss: 'The use of artificial intelligence is fundamentally changing the world of work.',
      speaking: 'Explain how a technology affects you.', writing: 'Write a short opinion piece on AI.' },
    { slug: 'culture', title: 'Culture & identity', goal: 'Talk about culture and belonging.', vocab: 'opinion', grammar: 'complex-connectors',
      text: 'Sowohl die Sprache als auch die Traditionen prägen, wie wir uns in einem neuen Land fühlen.', gloss: 'Both language and traditions shape how we feel in a new country.',
      speaking: 'Describe a cultural difference you noticed.', writing: 'Write about what home means to you.' },
  ],
};

/** A1 starter courses for the other target languages. */
export const CURRICULUM_INTL: Record<string, ModuleTheme[]> = {
  en: [
    { slug: 'hello', title: 'Hello & introductions', goal: 'Introduce yourself.', vocab: 'basics', grammar: 'present-simple', text: 'Hi! I\'m Ana. I\'m from Brazil and I live in London. I work in a bookshop.', gloss: '', speaking: 'Introduce yourself.', writing: 'Write three sentences about yourself.' },
    { slug: 'cafe-basics', title: 'At the café', goal: 'Order politely.', vocab: 'food & drink', grammar: 'polite-requests', text: 'Could I have a flat white and a croissant, please? That\'s six pounds fifty.', gloss: '', speaking: 'Order a drink.', writing: 'Write your café order.', mission: 'at-the-cafe' },
    { slug: 'travel', title: 'Travelling', goal: 'Check in and ask for directions.', vocab: 'travel', grammar: 'prepositions-transport', text: 'I\'m on the train to Manchester. The hotel is at the station, in the city centre.', gloss: '', speaking: 'Check in at a hotel.', writing: 'Describe your last trip.', mission: 'hotel-check-in' },
    { slug: 'experiences', title: 'Experiences', goal: 'Talk about experiences.', vocab: 'everyday', grammar: 'present-perfect', text: 'Have you ever been to Scotland? I have visited Edinburgh twice.', gloss: '', speaking: 'Talk about a place you have visited.', writing: 'Write about an experience.' },
    { slug: 'work', title: 'Work', goal: 'Talk about your job.', vocab: 'work', grammar: 'present-simple', text: 'I work for a small company. I usually start at nine and finish at five.', gloss: '', speaking: 'Describe your job.', writing: 'Write a short bio.', mission: 'job-interview' },
  ],
  es: [
    { slug: 'hello', title: 'Hola & introductions', goal: 'Introduce yourself.', vocab: 'basics', grammar: 'ser-estar', text: 'Hola, soy Tom. Soy de Irlanda y estoy en Madrid por trabajo.', gloss: '', speaking: 'Preséntate.', writing: 'Escribe tres frases sobre ti.' },
    { slug: 'cafe-basics', title: 'En la cafetería', goal: 'Order politely.', vocab: 'food & drink', grammar: 'polite-requests-es', text: 'Quería un café con leche y una tostada, por favor. Son cuatro euros.', gloss: '', speaking: 'Pide algo de beber.', writing: 'Escribe tu pedido.', mission: 'at-the-cafe' },
    { slug: 'age', title: 'Age & feelings', goal: 'Use tener expressions.', vocab: 'basics', grammar: 'tener-age', text: 'Tengo veintiocho años. Hoy tengo mucha hambre y un poco de sueño.', gloss: '', speaking: 'Di cómo estás hoy.', writing: 'Describe a tu familia.' },
    { slug: 'travel', title: 'De viaje', goal: 'Handle travel situations.', vocab: 'travel', grammar: 'preterito-perfecto', text: 'Hoy he llegado a Sevilla. He dejado la maleta en el hotel.', gloss: '', speaking: 'Pregunta por el camino.', writing: 'Escribe sobre tu día.', mission: 'asking-for-directions' },
    { slug: 'doctor', title: 'En el médico', goal: 'Describe symptoms.', vocab: 'everyday', grammar: 'ser-estar', text: 'Estoy enfermo. Me duele la cabeza y tengo fiebre.', gloss: '', speaking: 'Explica tus síntomas.', writing: 'Escribe un mensaje a tu jefe.', mission: 'at-the-doctor' },
  ],
  fr: [
    { slug: 'hello', title: 'Bonjour & introductions', goal: 'Introduce yourself.', vocab: 'basics', grammar: 'etre-avoir', text: 'Bonjour, je suis Lina. J\'ai vingt-cinq ans et j\'habite à Lyon.', gloss: '', speaking: 'Présentez-vous.', writing: 'Écrivez trois phrases sur vous.' },
    { slug: 'cafe-basics', title: 'Au café', goal: 'Order politely.', vocab: 'food & drink', grammar: 'conditionnel-politesse', text: 'Je voudrais un café crème et un croissant, s\'il vous plaît.', gloss: '', speaking: 'Commandez une boisson.', writing: 'Écrivez votre commande.', mission: 'at-the-cafe' },
    { slug: 'city', title: 'En ville', goal: 'Ask for directions.', vocab: 'travel', grammar: 'articles-contractions', text: 'Je vais au musée, puis à la gare. Le café est à côté de la poste.', gloss: '', speaking: 'Demandez le chemin.', writing: 'Décrivez votre quartier.', mission: 'asking-for-directions' },
    { slug: 'weekend', title: 'Le week-end', goal: 'Talk about the past.', vocab: 'everyday', grammar: 'passe-compose', text: 'Samedi, je suis allée au marché et j\'ai acheté des fruits.', gloss: '', speaking: 'Racontez votre week-end.', writing: 'Écrivez une carte postale.' },
    { slug: 'hotel', title: 'À l\'hôtel', goal: 'Check in.', vocab: 'travel', grammar: 'conditionnel-politesse', text: 'J\'ai réservé une chambre pour deux nuits. Le petit-déjeuner est compris ?', gloss: '', speaking: 'Faites le check-in.', writing: 'Écrivez un e-mail à l\'hôtel.', mission: 'hotel-check-in' },
  ],
  it: [
    { slug: 'hello', title: 'Ciao & introductions', goal: 'Introduce yourself.', vocab: 'basics', grammar: 'essere-avere', text: 'Ciao, sono Max. Sono tedesco e ho trent\'anni. Abito a Bologna.', gloss: '', speaking: 'Presentati.', writing: 'Scrivi tre frasi su di te.' },
    { slug: 'cafe-basics', title: 'Al bar', goal: 'Order politely.', vocab: 'food & drink', grammar: 'condizionale-cortesia', text: 'Vorrei un cappuccino e un cornetto, per favore. Quant\'è?', gloss: '', speaking: 'Ordina qualcosa da bere.', writing: 'Scrivi la tua ordinazione.', mission: 'at-the-cafe' },
    { slug: 'city', title: 'In città', goal: 'Ask for directions.', vocab: 'travel', grammar: 'articles-it', text: 'Scusi, dov\'è la stazione? Vada dritto e poi giri a destra.', gloss: '', speaking: 'Chiedi la strada.', writing: 'Descrivi la tua città.', mission: 'asking-for-directions' },
    { slug: 'weekend', title: 'Il fine settimana', goal: 'Talk about the past.', vocab: 'everyday', grammar: 'passato-prossimo', text: 'Sabato sono andato al mare e ho mangiato una pizza buonissima.', gloss: '', speaking: 'Racconta il tuo weekend.', writing: 'Scrivi una cartolina.' },
    { slug: 'doctor', title: 'Dal medico', goal: 'Describe symptoms.', vocab: 'everyday', grammar: 'essere-avere', text: 'Ho mal di testa e ho la febbre. Sono stanco.', gloss: '', speaking: 'Spiega i tuoi sintomi.', writing: 'Scrivi un messaggio al lavoro.', mission: 'at-the-doctor' },
  ],
};

/** Daily challenge prompts; `{lang}` is replaced with the language name. */
export const CHALLENGE_PROMPTS: Record<Level, { focus: string; prompt: string }[]> = {
  A1: [
    { focus: 'speaking', prompt: 'Introduce yourself in {lang}: name, where you live and one hobby.' },
    { focus: 'speaking', prompt: 'Order your favourite drink in {lang} as if you were at a café.' },
    { focus: 'grammar', prompt: 'Write three sentences in {lang} about what you have and what you are (have / be).' },
    { focus: 'grammar', prompt: 'Describe your room in {lang} using at least three different nouns with articles.' },
    { focus: 'vocabulary', prompt: 'Name five things you can buy at a supermarket and use two of them in a sentence in {lang}.' },
    { focus: 'vocabulary', prompt: 'Describe your morning in {lang} using at least three time expressions.' },
    { focus: 'writing', prompt: 'Write a short message in {lang} inviting a friend for coffee.' },
    { focus: 'writing', prompt: 'Write three sentences in {lang} about your family.' },
  ],
  A2: [
    { focus: 'speaking', prompt: 'Tell me in {lang} what you did last weekend.' },
    { focus: 'speaking', prompt: 'Explain in {lang} why you are learning this language.' },
    { focus: 'grammar', prompt: 'Write four sentences in {lang} in the past tense about your last holiday.' },
    { focus: 'grammar', prompt: 'Explain in {lang} what you must, can and want to do this week.' },
    { focus: 'vocabulary', prompt: 'Describe your job or studies in {lang} using five work-related words.' },
    { focus: 'vocabulary', prompt: 'Compare two cities in {lang}.' },
    { focus: 'writing', prompt: 'Write a short complaint in {lang} to a hotel about a noisy room.' },
    { focus: 'writing', prompt: 'Write a postcard in {lang} from a trip.' },
  ],
  B1: [
    { focus: 'speaking', prompt: 'In {lang}: what would you do if you could live anywhere for a year?' },
    { focus: 'speaking', prompt: 'Give your opinion in {lang} on working from home, with two reasons.' },
    { focus: 'grammar', prompt: 'Describe a person you admire in {lang} using at least two relative clauses.' },
    { focus: 'grammar', prompt: 'Explain in {lang} how your favourite dish is made, using the passive.' },
    { focus: 'vocabulary', prompt: 'Summarise a news story you read recently in {lang}.' },
    { focus: 'vocabulary', prompt: 'Describe your ideal job in {lang} using five new words.' },
    { focus: 'writing', prompt: 'Write a formal email in {lang} asking for information about a course.' },
    { focus: 'writing', prompt: 'Write a short story in {lang} that starts with "Although it was raining…".' },
  ],
  B2: [
    { focus: 'speaking', prompt: 'Argue in {lang} for or against a four-day working week.' },
    { focus: 'speaking', prompt: 'Present a project you are proud of in {lang}, as if in a meeting.' },
    { focus: 'grammar', prompt: 'Rewrite this idea formally in {lang}: "We need to fix the problem fast."' },
    { focus: 'grammar', prompt: 'Use three complex connectors in {lang} to discuss social media.' },
    { focus: 'vocabulary', prompt: 'Explain in {lang} how artificial intelligence changes your field.' },
    { focus: 'vocabulary', prompt: 'Discuss in {lang} a cultural difference you have noticed.' },
    { focus: 'writing', prompt: 'Write a diplomatic reply in {lang} to a colleague who criticised your work.' },
    { focus: 'writing', prompt: 'Write a short opinion piece in {lang} about city housing.' },
  ],
};
