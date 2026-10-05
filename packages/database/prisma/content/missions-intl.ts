import { crit, type MissionDef, type Level, type Skill } from './types';

/**
 * Starter missions for English, Spanish, French and Italian: six core
 * real-life scenarios per language (café, hotel, directions, wrong train,
 * doctor, job interview). Same scenario structure as German so the AI
 * and the offline engine treat every language identically.
 */

interface Localised {
  lang: string;
  character: string;
  title: string;
  opening: string;
  keyPhrases: [string, string][];
  grammarFocus: string;
  criteria: ReturnType<typeof crit>[];
  closingLine: string;
}

interface Scenario {
  slug: string;
  env: string;
  level: Level;
  difficulty: number;
  skills: Skill[];
  minutes: number;
  xp?: number;
  description: string;
  objective: string;
  scenario: string;
  variants: Localised[];
}

const SCENARIOS: Scenario[] = [
  {
    slug: 'at-the-cafe',
    env: 'cafe',
    level: 'A1',
    difficulty: 1,
    skills: ['SPEAKING', 'VOCABULARY'],
    minutes: 5,
    description: 'Your first real conversation: order a drink and a snack, then pay.',
    objective: 'Order a drink and a snack, answer the barista\'s questions and pay.',
    scenario: 'A busy, friendly café on a weekday morning. The learner is at the counter.',
    variants: [
      {
        lang: 'en', character: 'emma-barista', title: 'At the Café',
        opening: 'Morning! What can I get you?',
        keyPhrases: [["I'd like …", 'I would like'], ['Could I have …?', 'polite request'], ['a flat white', 'coffee with steamed milk'], ['to take away', 'to go'], ['How much is that?', 'price question']],
        grammarFocus: 'Polite requests with would/could',
        criteria: [
          crit('drink', 'Order a drink', ['coffee', 'tea', 'latte', 'cappuccino', 'flat white', 'espresso', 'juice', 'water', 'hot chocolate'], "I'd like a … please. / Could I have a …?", "Could I have a flat white, please?", 'What would you like to drink?', 'Lovely choice!'),
          crit('details', 'Say if it\'s to stay or take away / the size', ['take away', 'to go', 'for here', 'small', 'large', 'regular', 'oat milk'], 'To take away, please. / A large one.', 'Large, to take away, please.', 'Is that to have here or take away?', 'No problem.'),
          crit('food', 'Order something to eat (or decline)', ['croissant', 'muffin', 'cake', 'sandwich', 'scone', 'cookie', 'no thanks', 'nothing'], "I'll have a … too. / No thanks.", "I'll have a blueberry muffin too.", 'Anything to eat with that? The banana bread is fresh.', 'Great, good choice.'),
          crit('pay', 'Ask the price and pay', ['how much', 'pay', 'card', 'cash', 'contactless'], 'How much is that? / Can I pay by card?', 'How much is that? Can I pay by card?', 'Anything else, or shall I ring you up?', "That's £6.80. Tap whenever you're ready."),
        ],
        closingLine: 'Here you go — have a lovely day!',
      },
      {
        lang: 'es', character: 'lucia-camarera', title: 'En la cafetería',
        opening: '¡Buenos días! ¿Qué le pongo?',
        keyPhrases: [['Quisiera …', 'I would like'], ['¿Me pone …?', 'Could you give me …?'], ['un café con leche', 'a coffee with milk'], ['para llevar', 'to take away'], ['¿Cuánto es?', 'How much is it?']],
        grammarFocus: 'Polite requests: quisiera, me pone',
        criteria: [
          crit('drink', 'Order a drink', ['cafe', 'te', 'cortado', 'con leche', 'zumo', 'agua', 'chocolate'], '¿Me pone un …, por favor?', '¿Me pone un café con leche, por favor?', '¿Qué quiere tomar?', '¡Muy bien!'),
          crit('details', 'Say if it\'s to stay or take away', ['para llevar', 'para tomar aqui', 'aqui', 'grande', 'pequeno', 'sin azucar'], 'Para llevar / Para tomar aquí.', 'Para tomar aquí, por favor.', '¿Para tomar aquí o para llevar?', 'Perfecto.'),
          crit('food', 'Order something to eat', ['tostada', 'croissant', 'cruasan', 'churros', 'bocadillo', 'tortilla', 'nada', 'no gracias'], 'Y una …, por favor.', 'Y una tostada con tomate, por favor.', '¿Algo de comer? Los churros están recién hechos.', '¡Buena elección!'),
          crit('pay', 'Ask the price and pay', ['cuanto', 'pagar', 'tarjeta', 'efectivo', 'la cuenta'], '¿Cuánto es? / ¿Puedo pagar con tarjeta?', '¿Cuánto es, por favor?', '¿Algo más?', 'Son cuatro euros con cincuenta.'),
        ],
        closingLine: '¡Gracias, que tenga un buen día!',
      },
      {
        lang: 'fr', character: 'camille-serveuse', title: 'Au café',
        opening: 'Bonjour ! Qu\'est-ce que je vous sers ?',
        keyPhrases: [['Je voudrais …', 'I would like'], ['un café crème', 'a coffee with milk'], ['un croissant', 'a croissant'], ['sur place / à emporter', 'to stay / to go'], ["L'addition, s'il vous plaît.", 'The bill, please.']],
        grammarFocus: 'Conditional for politeness: je voudrais',
        criteria: [
          crit('drink', 'Order a drink', ['cafe', 'the', 'creme', 'chocolat', 'jus', 'eau', 'noisette', 'expresso'], "Je voudrais un …, s'il vous plaît.", "Je voudrais un café crème, s'il vous plaît.", 'Que désirez-vous boire ?', 'Très bien.'),
          crit('details', 'Say if it\'s to stay or take away', ['sur place', 'a emporter', 'ici', 'grand', 'petit'], 'Sur place. / À emporter.', 'Sur place, merci.', 'Sur place ou à emporter ?', "D'accord."),
          crit('food', 'Order something to eat', ['croissant', 'pain au chocolat', 'tartine', 'gateau', 'crepe', 'rien', 'non merci'], 'Et un …, aussi.', 'Et un pain au chocolat, aussi.', 'Avec ceci ? Nos croissants sortent du four.', 'Excellent choix.'),
          crit('pay', 'Ask the price and pay', ['combien', 'payer', 'carte', 'addition', 'especes'], "Ça fait combien ? / L'addition, s'il vous plaît.", "L'addition, s'il vous plaît.", 'Ce sera tout ?', 'Ça fait 5,20 €.'),
        ],
        closingLine: 'Merci, bonne journée !',
      },
      {
        lang: 'it', character: 'marco-barista', title: 'Al bar',
        opening: 'Buongiorno! Cosa le preparo?',
        keyPhrases: [['Vorrei …', 'I would like'], ['un cappuccino', 'a cappuccino'], ['un cornetto', 'a croissant'], ['al banco', 'at the counter'], ['Quanto le devo?', 'How much do I owe you?']],
        grammarFocus: 'Conditional for politeness: vorrei',
        criteria: [
          crit('drink', 'Order a drink', ['caffe', 'cappuccino', 'espresso', 'latte', 'macchiato', 'te', 'succo', 'acqua'], 'Vorrei un …, per favore.', 'Vorrei un cappuccino, per favore.', 'Cosa prende da bere?', 'Perfetto!'),
          crit('details', 'Say how you want it', ['al banco', 'al tavolo', 'senza zucchero', 'macchiato', 'caldo', 'freddo', 'doppio'], 'Al banco, grazie. / Senza zucchero.', 'Al banco, senza zucchero.', 'Al banco o al tavolo?', 'Va bene.'),
          crit('food', 'Order something to eat', ['cornetto', 'brioche', 'panino', 'tramezzino', 'dolce', 'niente', 'no grazie'], 'E un …, per favore.', 'E un cornetto alla crema, per favore.', 'Qualcosa da mangiare? I cornetti sono appena sfornati.', 'Ottima scelta!'),
          crit('pay', 'Ask the price and pay', ['quanto', 'pagare', 'carta', 'contanti', 'conto'], 'Quanto le devo? / Posso pagare con la carta?', 'Quanto le devo?', 'Altro?', 'Sono tre euro e venti.'),
        ],
        closingLine: 'Grazie e buona giornata!',
      },
    ],
  },
  {
    slug: 'hotel-check-in',
    env: 'hotel',
    level: 'A1',
    difficulty: 1,
    skills: ['SPEAKING', 'LISTENING'],
    minutes: 5,
    description: 'Check in to your hotel and ask about breakfast and Wi-Fi.',
    objective: 'Give your name and booking, ask about breakfast and the Wi-Fi.',
    scenario: 'A small city hotel, early evening. The receptionist is friendly.',
    variants: [
      {
        lang: 'en', character: 'anna-reception', title: 'Hotel Check-in',
        opening: 'Good evening and welcome! How can I help you?',
        keyPhrases: [["I've got a reservation.", 'I have a booking.'], ['under the name …', 'booked as …'], ['What time is breakfast?', 'breakfast time'], ["What's the Wi-Fi password?", 'Wi-Fi password']],
        grammarFocus: 'Present perfect "I\'ve booked"',
        criteria: [
          crit('booking', 'Give your booking and name', ['reservation', 'booked', 'booking', 'under the name', 'my name'], "I've got a reservation under the name …", "Hi, I've got a reservation under the name Haddad.", 'Do you have a reservation?', 'Ah yes, a double room for two nights. Room 12.'),
          crit('breakfast', 'Ask about breakfast', ['breakfast', 'what time'], 'What time is breakfast?', 'What time is breakfast?', 'Any questions?', "Breakfast is from 7 to 10 in the dining room."),
          crit('wifi', 'Ask about the Wi-Fi', ['wifi', 'wi fi', 'internet', 'password'], "What's the Wi-Fi password?", "What's the Wi-Fi password?", 'Anything else?', "It's on your key card — 'harbour2024'."),
        ],
        closingLine: 'Here is your key. Enjoy your stay!',
      },
      {
        lang: 'es', character: 'anna-reception', title: 'Check-in en el hotel',
        opening: 'Buenas tardes, bienvenido. ¿En qué puedo ayudarle?',
        keyPhrases: [['Tengo una reserva.', 'I have a booking.'], ['a nombre de …', 'under the name …'], ['el desayuno', 'breakfast'], ['la contraseña del wifi', 'the Wi-Fi password']],
        grammarFocus: 'tener and question words',
        criteria: [
          crit('booking', 'Give your booking and name', ['reserva', 'reservado', 'a nombre de', 'me llamo'], 'Tengo una reserva a nombre de …', 'Tengo una reserva a nombre de Haddad.', '¿Tiene reserva?', 'Sí, una habitación doble para dos noches.'),
          crit('breakfast', 'Ask about breakfast', ['desayuno', 'a que hora'], '¿A qué hora es el desayuno?', '¿A qué hora es el desayuno?', '¿Alguna pregunta?', 'De siete a diez, en el comedor.'),
          crit('wifi', 'Ask about the Wi-Fi', ['wifi', 'internet', 'contrasena', 'clave'], '¿Cuál es la contraseña del wifi?', '¿Cuál es la contraseña del wifi?', '¿Algo más?', 'Está en la tarjeta de la habitación.'),
        ],
        closingLine: 'Aquí tiene su llave. ¡Que disfrute su estancia!',
      },
      {
        lang: 'fr', character: 'anna-reception', title: "L'arrivée à l'hôtel",
        opening: 'Bonsoir et bienvenue ! Je peux vous aider ?',
        keyPhrases: [["J'ai une réservation.", 'I have a booking.'], ['au nom de …', 'under the name …'], ['le petit-déjeuner', 'breakfast'], ['le code wifi', 'the Wi-Fi code']],
        grammarFocus: 'avoir and questions with "à quelle heure"',
        criteria: [
          crit('booking', 'Give your booking and name', ['reservation', 'reserve', 'au nom de', 'je m appelle'], "J'ai une réservation au nom de …", "J'ai une réservation au nom de Haddad.", 'Vous avez réservé ?', 'Oui, une chambre double pour deux nuits.'),
          crit('breakfast', 'Ask about breakfast', ['petit dejeuner', 'quelle heure'], 'À quelle heure est le petit-déjeuner ?', 'À quelle heure est le petit-déjeuner ?', 'Des questions ?', 'De 7 h à 10 h, au rez-de-chaussée.'),
          crit('wifi', 'Ask about the Wi-Fi', ['wifi', 'internet', 'code', 'mot de passe'], 'Quel est le code wifi ?', 'Quel est le mot de passe du wifi ?', 'Autre chose ?', 'Il est sur votre carte.'),
        ],
        closingLine: 'Voici votre clé. Bon séjour !',
      },
      {
        lang: 'it', character: 'anna-reception', title: "Check-in in albergo",
        opening: 'Buonasera e benvenuto! Come posso aiutarla?',
        keyPhrases: [['Ho una prenotazione.', 'I have a booking.'], ['a nome di …', 'under the name …'], ['la colazione', 'breakfast'], ['la password del wifi', 'the Wi-Fi password']],
        grammarFocus: 'avere and question words',
        criteria: [
          crit('booking', 'Give your booking and name', ['prenotazione', 'prenotato', 'a nome di', 'mi chiamo'], 'Ho una prenotazione a nome di …', 'Ho una prenotazione a nome di Haddad.', 'Ha una prenotazione?', 'Sì, una camera doppia per due notti.'),
          crit('breakfast', 'Ask about breakfast', ['colazione', 'a che ora'], 'A che ora è la colazione?', 'A che ora è la colazione?', 'Domande?', 'Dalle sette alle dieci.'),
          crit('wifi', 'Ask about the Wi-Fi', ['wifi', 'internet', 'password'], 'Qual è la password del wifi?', 'Qual è la password del wifi?', 'Altro?', 'È sulla tessera della camera.'),
        ],
        closingLine: 'Ecco la chiave. Buon soggiorno!',
      },
    ],
  },
  {
    slug: 'asking-for-directions',
    env: 'city',
    level: 'A1',
    difficulty: 1,
    skills: ['LISTENING', 'SPEAKING'],
    minutes: 5,
    description: 'You are lost. Ask a local how to get to the museum.',
    objective: 'Ask the way, check you understood and ask how far it is.',
    scenario: 'The old town. A friendly local is walking a dog.',
    variants: [
      {
        lang: 'en', character: 'frau-weber', title: 'Asking for Directions',
        opening: 'You look a bit lost, dear. Can I help?',
        keyPhrases: [['How do I get to …?', 'directions'], ['straight on', 'geradeaus'], ['turn left/right', 'abbiegen'], ['Is it far?', 'distance']],
        grammarFocus: 'Imperatives for directions',
        criteria: [
          crit('ask', 'Ask the way to the museum', ['how do i get', 'museum', 'where is', 'looking for'], 'Excuse me, how do I get to the museum?', 'Excuse me, how do I get to the museum?', 'Where are you heading?', 'Go straight on and take the second left.'),
          crit('repeat', 'Check you understood', ['straight', 'left', 'right', 'second', 'so'], 'So, straight on and then left?', 'So straight on, then the second left?', 'Did you get that?', "Exactly! It's on your right."),
          crit('distance', 'Ask how far it is', ['far', 'minutes', 'walk', 'how long'], 'Is it far? / How long does it take to walk?', 'Is it far to walk?', 'Anything else?', 'Only about five minutes.'),
        ],
        closingLine: 'You\'re welcome — enjoy the museum!',
      },
      {
        lang: 'es', character: 'frau-weber', title: 'Preguntar el camino',
        opening: 'Parece un poco perdido. ¿Le ayudo?',
        keyPhrases: [['¿Cómo llego a …?', 'How do I get to …?'], ['todo recto', 'straight on'], ['a la izquierda / derecha', 'left / right'], ['¿Está lejos?', 'Is it far?']],
        grammarFocus: 'Imperative for directions',
        criteria: [
          crit('ask', 'Ask the way to the museum', ['como llego', 'museo', 'donde esta', 'busco'], 'Perdone, ¿cómo llego al museo?', 'Perdone, ¿cómo llego al museo?', '¿Adónde va?', 'Siga todo recto y luego la segunda a la izquierda.'),
          crit('repeat', 'Check you understood', ['recto', 'izquierda', 'derecha', 'segunda', 'entonces'], 'Entonces, ¿todo recto y a la izquierda?', 'Entonces, ¿todo recto y la segunda a la izquierda?', '¿Lo ha entendido?', '¡Exacto!'),
          crit('distance', 'Ask how far it is', ['lejos', 'minutos', 'andando', 'cuanto tiempo'], '¿Está lejos?', '¿Está lejos andando?', '¿Algo más?', 'No, cinco minutos andando.'),
        ],
        closingLine: '¡De nada! Que disfrute del museo.',
      },
      {
        lang: 'fr', character: 'frau-weber', title: 'Demander son chemin',
        opening: 'Vous avez l\'air un peu perdu. Je peux vous aider ?',
        keyPhrases: [['Pour aller au …, s\'il vous plaît ?', 'How do I get to …?'], ['tout droit', 'straight on'], ['à gauche / à droite', 'left / right'], ['C\'est loin ?', 'Is it far?']],
        grammarFocus: 'Imperative and "au/à la"',
        criteria: [
          crit('ask', 'Ask the way to the museum', ['pour aller', 'musee', 'ou est', 'je cherche'], "Pardon, pour aller au musée, s'il vous plaît ?", "Pardon, pour aller au musée, s'il vous plaît ?", 'Vous cherchez quoi ?', 'Allez tout droit, puis la deuxième à gauche.'),
          crit('repeat', 'Check you understood', ['tout droit', 'gauche', 'droite', 'deuxieme', 'donc'], 'Donc, tout droit puis à gauche ?', 'Donc tout droit, puis la deuxième à gauche ?', 'Vous avez compris ?', 'Exactement !'),
          crit('distance', 'Ask how far it is', ['loin', 'minutes', 'a pied', 'combien de temps'], "C'est loin à pied ?", "C'est loin à pied ?", 'Autre chose ?', 'Non, cinq minutes.'),
        ],
        closingLine: 'Je vous en prie, bonne visite !',
      },
      {
        lang: 'it', character: 'frau-weber', title: 'Chiedere la strada',
        opening: 'Sembra un po\' perso. Posso aiutarla?',
        keyPhrases: [['Come arrivo a …?', 'How do I get to …?'], ['sempre dritto', 'straight on'], ['a sinistra / a destra', 'left / right'], ['È lontano?', 'Is it far?']],
        grammarFocus: 'Imperative for directions',
        criteria: [
          crit('ask', 'Ask the way to the museum', ['come arrivo', 'museo', 'dove', 'cerco'], 'Scusi, come arrivo al museo?', 'Scusi, come arrivo al museo?', 'Dove deve andare?', 'Vada sempre dritto e poi la seconda a sinistra.'),
          crit('repeat', 'Check you understood', ['dritto', 'sinistra', 'destra', 'seconda', 'quindi'], 'Quindi sempre dritto e poi a sinistra?', 'Quindi dritto e poi la seconda a sinistra?', 'Ha capito?', 'Esatto!'),
          crit('distance', 'Ask how far it is', ['lontano', 'minuti', 'a piedi', 'quanto tempo'], 'È lontano a piedi?', 'È lontano a piedi?', 'Altro?', 'No, cinque minuti.'),
        ],
        closingLine: 'Prego, buona visita!',
      },
    ],
  },
  {
    slug: 'the-wrong-train',
    env: 'train-station',
    level: 'A2',
    difficulty: 2,
    skills: ['SPEAKING', 'LISTENING'],
    minutes: 6,
    description: 'You are on the wrong train. Ask another passenger for help and find the correct route.',
    objective: 'Explain your problem, ask what to do and confirm where to change.',
    scenario: 'A regional train going in the opposite direction from where the learner wants to go.',
    variants: [
      {
        lang: 'en', character: 'jonas-passenger', title: 'The Wrong Train',
        opening: 'You alright? You keep staring at the screen.',
        keyPhrases: [["I'm on the wrong train.", 'falscher Zug'], ['Does this train go to …?', 'destination question'], ['change trains', 'umsteigen'], ['the next stop', 'nächste Haltestelle']],
        grammarFocus: 'Prepositions "on the train", questions with do/does',
        criteria: [
          crit('problem', 'Explain you are on the wrong train', ['wrong train', 'oxford', 'wrong', 'does this train go'], "I think I'm on the wrong train.", "I think I'm on the wrong train. I need to get to Oxford.", 'Where are you trying to go?', "Ah — unfortunately this one's going to Reading, the opposite direction."),
          crit('what-now', 'Ask what you should do', ['what should i', 'what can i', 'get off', 'change', 'how do i get'], 'What should I do?', 'What should I do now?', 'What do you reckon?', 'Get off at the next stop and take the train back.'),
          crit('thanks', 'Confirm and thank them', ['thank', 'thanks', 'next stop', 'cheers'], 'So I get off at the next stop? Thanks a lot!', 'So I get off at the next stop? Thanks so much!', 'Got it?', 'No worries. Good luck!'),
        ],
        closingLine: "That's your stop coming up — good luck!",
      },
      {
        lang: 'es', character: 'jonas-passenger', title: 'El tren equivocado',
        opening: '¿Estás bien? Pareces preocupado.',
        keyPhrases: [['Me he equivocado de tren.', 'I took the wrong train.'], ['¿Este tren va a …?', 'Does this train go to …?'], ['hacer transbordo', 'to change trains'], ['la próxima parada', 'the next stop']],
        grammarFocus: 'Pretérito perfecto: me he equivocado',
        criteria: [
          crit('problem', 'Explain you are on the wrong train', ['equivocado', 'tren equivocado', 'toledo', 'este tren va'], 'Creo que me he equivocado de tren.', 'Creo que me he equivocado de tren. Quiero ir a Toledo.', '¿Adónde vas?', 'Uy, este tren va en la dirección contraria.'),
          crit('what-now', 'Ask what to do', ['que hago', 'que puedo hacer', 'bajarme', 'transbordo', 'como llego'], '¿Qué hago ahora?', '¿Qué hago ahora?', '¿Qué piensas hacer?', 'Bájate en la próxima parada y toma el tren de vuelta.'),
          crit('thanks', 'Confirm and thank', ['gracias', 'proxima parada', 'vale'], 'Vale, en la próxima parada. ¡Muchas gracias!', 'Vale, en la próxima parada. ¡Muchas gracias!', '¿Todo claro?', '¡De nada, suerte!'),
        ],
        closingLine: '¡Aquí es tu parada, suerte!',
      },
      {
        lang: 'fr', character: 'jonas-passenger', title: 'Le mauvais train',
        opening: 'Ça va ? Tu as l\'air inquiet.',
        keyPhrases: [['Je me suis trompé de train.', 'I took the wrong train.'], ['Ce train va à … ?', 'Does this train go to …?'], ['changer de train', 'to change trains'], ['le prochain arrêt', 'the next stop']],
        grammarFocus: 'Passé composé with être (se tromper)',
        criteria: [
          crit('problem', 'Explain you are on the wrong train', ['trompe', 'mauvais train', 'versailles', 'ce train va'], 'Je crois que je me suis trompé de train.', 'Je crois que je me suis trompé de train. Je vais à Versailles.', 'Tu vas où ?', 'Ah, ce train va dans l\'autre sens.'),
          crit('what-now', 'Ask what to do', ['qu est ce que je fais', 'que faire', 'descendre', 'changer', 'comment aller'], 'Qu\'est-ce que je fais maintenant ?', 'Qu\'est-ce que je dois faire ?', 'Tu fais quoi alors ?', 'Descends au prochain arrêt et reprends le train dans l\'autre sens.'),
          crit('thanks', 'Confirm and thank', ['merci', 'prochain arret', 'd accord'], 'D\'accord, au prochain arrêt. Merci beaucoup !', 'D\'accord, au prochain arrêt. Merci beaucoup !', 'C\'est clair ?', 'De rien, bonne chance !'),
        ],
        closingLine: 'C\'est ton arrêt, bonne chance !',
      },
      {
        lang: 'it', character: 'jonas-passenger', title: 'Il treno sbagliato',
        opening: 'Tutto bene? Sembri preoccupato.',
        keyPhrases: [['Ho sbagliato treno.', 'I took the wrong train.'], ['Questo treno va a …?', 'Does this train go to …?'], ['cambiare treno', 'to change trains'], ['la prossima fermata', 'the next stop']],
        grammarFocus: 'Passato prossimo: ho sbagliato',
        criteria: [
          crit('problem', 'Explain you are on the wrong train', ['sbagliato', 'treno sbagliato', 'firenze', 'questo treno va'], 'Credo di aver sbagliato treno.', 'Credo di aver sbagliato treno. Devo andare a Firenze.', 'Dove devi andare?', 'Eh, questo treno va nella direzione opposta.'),
          crit('what-now', 'Ask what to do', ['cosa faccio', 'cosa posso fare', 'scendere', 'cambiare', 'come arrivo'], 'Cosa faccio adesso?', 'Cosa faccio adesso?', 'Che pensi di fare?', 'Scendi alla prossima fermata e prendi il treno di ritorno.'),
          crit('thanks', 'Confirm and thank', ['grazie', 'prossima fermata', 'va bene'], 'Va bene, alla prossima fermata. Grazie mille!', 'Va bene, alla prossima fermata. Grazie mille!', 'Tutto chiaro?', 'Figurati, buona fortuna!'),
        ],
        closingLine: 'Ecco la tua fermata, buona fortuna!',
      },
    ],
  },
  {
    slug: 'at-the-doctor',
    env: 'hospital',
    level: 'A2',
    difficulty: 2,
    skills: ['SPEAKING', 'LISTENING'],
    minutes: 6,
    description: 'Explain how you feel to the doctor and understand the advice.',
    objective: 'Describe your symptoms, say since when and ask what to do.',
    scenario: 'A GP practice. The learner has had a fever for two days.',
    variants: [
      {
        lang: 'en', character: 'dr-hoffmann', title: 'At the Doctor',
        opening: 'Hello, have a seat. What seems to be the problem?',
        keyPhrases: [["I've got a temperature.", 'Fieber'], ['for two days', 'seit zwei Tagen'], ['a sore throat', 'Halsschmerzen'], ['Should I take anything?', 'medication']],
        grammarFocus: 'Present perfect with for/since',
        criteria: [
          crit('symptoms', 'Describe your symptoms', ['temperature', 'fever', 'headache', 'sore throat', 'cough', 'feel sick'], "I've got a … and a …", "I've got a fever and a terrible headache.", 'What symptoms do you have?', 'I see.'),
          crit('since', 'Say since when', ['since', 'for two days', 'days', 'yesterday', 'week'], "I've had it for … / since …", "I've had it for two days.", 'How long have you had it?', 'Two days, okay.'),
          crit('advice', 'Ask what you should do', ['should i', 'what can i', 'medicine', 'take anything', 'sick note'], 'Should I take anything?', 'Should I take anything for it?', 'Any questions?', 'Rest, drink lots of water and take paracetamol if needed.'),
        ],
        closingLine: 'Get well soon!',
      },
      {
        lang: 'es', character: 'dr-hoffmann', title: 'En el médico',
        opening: 'Hola, siéntese. ¿Qué le pasa?',
        keyPhrases: [['Tengo fiebre.', 'I have a fever.'], ['desde hace dos días', 'for two days'], ['Me duele la cabeza.', 'My head hurts.'], ['¿Qué tengo que tomar?', 'What should I take?']],
        grammarFocus: 'doler + body parts, desde hace',
        criteria: [
          crit('symptoms', 'Describe your symptoms', ['fiebre', 'me duele', 'tos', 'cabeza', 'garganta'], 'Tengo … y me duele …', 'Tengo fiebre y me duele mucho la cabeza.', '¿Qué síntomas tiene?', 'Entiendo.'),
          crit('since', 'Say since when', ['desde hace', 'dias', 'ayer', 'semana'], 'Desde hace … días.', 'Desde hace dos días.', '¿Desde cuándo?', 'Dos días, vale.'),
          crit('advice', 'Ask what to do', ['que tengo que', 'que puedo', 'medicina', 'tomar', 'pastilla'], '¿Qué tengo que tomar?', '¿Tengo que tomar algo?', '¿Alguna pregunta?', 'Descanse, beba mucha agua y tome paracetamol.'),
        ],
        closingLine: '¡Que se mejore!',
      },
      {
        lang: 'fr', character: 'dr-hoffmann', title: 'Chez le médecin',
        opening: 'Bonjour, asseyez-vous. Qu\'est-ce qui ne va pas ?',
        keyPhrases: [["J'ai de la fièvre.", 'I have a fever.'], ['depuis deux jours', 'for two days'], ["J'ai mal à la tête.", 'I have a headache.'], ['Je dois prendre quelque chose ?', 'Should I take something?']],
        grammarFocus: 'avoir mal à + body parts, depuis',
        criteria: [
          crit('symptoms', 'Describe your symptoms', ['fievre', 'j ai mal', 'tete', 'gorge', 'tousse'], "J'ai … et j'ai mal à …", "J'ai de la fièvre et j'ai mal à la tête.", 'Quels sont vos symptômes ?', 'Je vois.'),
          crit('since', 'Say since when', ['depuis', 'jours', 'hier', 'semaine'], 'Depuis … jours.', 'Depuis deux jours.', 'Depuis quand ?', 'Deux jours, d\'accord.'),
          crit('advice', 'Ask what to do', ['je dois', 'que faire', 'medicament', 'prendre'], 'Je dois prendre quelque chose ?', 'Je dois prendre un médicament ?', 'Des questions ?', 'Reposez-vous, buvez beaucoup et prenez du paracétamol.'),
        ],
        closingLine: 'Bon rétablissement !',
      },
      {
        lang: 'it', character: 'dr-hoffmann', title: 'Dal medico',
        opening: 'Buongiorno, si accomodi. Cosa si sente?',
        keyPhrases: [['Ho la febbre.', 'I have a fever.'], ['da due giorni', 'for two days'], ['Mi fa male la testa.', 'My head hurts.'], ['Devo prendere qualcosa?', 'Should I take something?']],
        grammarFocus: 'fare male + body parts, da + time',
        criteria: [
          crit('symptoms', 'Describe your symptoms', ['febbre', 'mi fa male', 'testa', 'gola', 'tosse'], 'Ho … e mi fa male …', 'Ho la febbre e mi fa male la testa.', 'Che sintomi ha?', 'Capisco.'),
          crit('since', 'Say since when', ['da due giorni', 'giorni', 'ieri', 'settimana'], 'Da … giorni.', 'Da due giorni.', 'Da quando?', 'Due giorni, va bene.'),
          crit('advice', 'Ask what to do', ['devo', 'cosa posso', 'medicina', 'prendere'], 'Devo prendere qualcosa?', 'Devo prendere qualcosa?', 'Domande?', 'Riposi, beva molta acqua e prenda il paracetamolo.'),
        ],
        closingLine: 'Guarisca presto!',
      },
    ],
  },
  {
    slug: 'job-interview',
    env: 'business',
    level: 'B1',
    difficulty: 4,
    skills: ['SPEAKING', 'GRAMMAR'],
    minutes: 10,
    xp: 150,
    description: 'A real interview for a job you want. Present yourself convincingly.',
    objective: 'Present your experience, explain your motivation and ask a question yourself.',
    scenario: 'Video interview with an HR manager for an international company.',
    variants: [
      {
        lang: 'en', character: 'dr-neumann', title: 'The Job Interview',
        opening: 'Thanks for joining. Could you start by telling me a bit about yourself?',
        keyPhrases: [["I've worked as … for … years.", 'experience'], ["I'm particularly interested in …", 'motivation'], ['One of my strengths is …', 'strengths'], ['Could you tell me more about …?', 'asking questions']],
        grammarFocus: 'Present perfect vs past simple',
        criteria: [
          crit('experience', 'Present your experience', ['experience', 'worked', 'years', 'studied', 'degree'], "I've worked as … for … years.", "I've worked in logistics for five years, most recently at DHL.", 'What have you done so far?', 'That sounds very relevant.'),
          crit('motivation', 'Explain your motivation', ['interested', 'motivated', 'because', 'your company', 'this role'], "I'm particularly interested in this role because …", "I'm particularly interested in this role because you work internationally.", 'Why do you want to work with us?', 'Great to hear.'),
          crit('question', 'Ask the interviewer a question', ['could you tell me', 'what does', 'team', 'onboarding', 'next steps', 'remote'], 'Could you tell me more about …?', 'Could you tell me more about the onboarding process?', 'Do you have any questions for us?', 'Good question — you\'d have a mentor for your first three months.'),
        ],
        closingLine: "Thanks for your time. We'll be in touch by Friday.",
      },
      {
        lang: 'es', character: 'dr-neumann', title: 'La entrevista de trabajo',
        opening: 'Gracias por venir. ¿Podría hablarme un poco de usted?',
        keyPhrases: [['Tengo … años de experiencia en …', 'experience'], ['Me interesa especialmente …', 'motivation'], ['Uno de mis puntos fuertes es …', 'strengths'], ['¿Podría contarme más sobre …?', 'asking questions']],
        grammarFocus: 'Pretérito indefinido vs perfecto',
        criteria: [
          crit('experience', 'Present your experience', ['experiencia', 'trabaje', 'he trabajado', 'anos', 'estudie'], 'Tengo … años de experiencia en …', 'Tengo cinco años de experiencia en logística.', '¿Qué ha hecho hasta ahora?', 'Muy interesante.'),
          crit('motivation', 'Explain your motivation', ['me interesa', 'motivado', 'porque', 'su empresa', 'puesto'], 'Me interesa este puesto porque …', 'Me interesa este puesto porque trabajan a nivel internacional.', '¿Por qué quiere trabajar con nosotros?', 'Me alegra oírlo.'),
          crit('question', 'Ask a question', ['podria contarme', 'equipo', 'formacion', 'proximos pasos', 'teletrabajo'], '¿Podría contarme más sobre …?', '¿Podría contarme más sobre el equipo?', '¿Tiene alguna pregunta?', 'Claro, es un equipo de ocho personas.'),
        ],
        closingLine: 'Gracias por su tiempo. Le contactaremos pronto.',
      },
      {
        lang: 'fr', character: 'dr-neumann', title: "L'entretien d'embauche",
        opening: 'Merci d\'être venu. Pouvez-vous vous présenter ?',
        keyPhrases: [["J'ai … ans d'expérience dans …", 'experience'], ['Ce poste m\'intéresse parce que …', 'motivation'], ['Un de mes points forts est …', 'strengths'], ['Pourriez-vous m\'en dire plus sur … ?', 'asking questions']],
        grammarFocus: 'Passé composé vs imparfait',
        criteria: [
          crit('experience', 'Present your experience', ['experience', 'j ai travaille', 'ans', 'etudie', 'diplome'], "J'ai … ans d'expérience dans …", "J'ai cinq ans d'expérience dans la logistique.", 'Qu\'avez-vous fait jusqu\'ici ?', 'Très intéressant.'),
          crit('motivation', 'Explain your motivation', ['m interesse', 'motive', 'parce que', 'votre entreprise', 'poste'], 'Ce poste m\'intéresse parce que …', 'Ce poste m\'intéresse parce que vous travaillez à l\'international.', 'Pourquoi nous ?', 'Ravi de l\'entendre.'),
          crit('question', 'Ask a question', ['pourriez vous', 'equipe', 'formation', 'prochaines etapes', 'teletravail'], 'Pourriez-vous m\'en dire plus sur … ?', 'Pourriez-vous m\'en dire plus sur l\'équipe ?', 'Avez-vous des questions ?', 'Bien sûr, l\'équipe compte huit personnes.'),
        ],
        closingLine: 'Merci pour votre temps. Nous vous recontacterons.',
      },
      {
        lang: 'it', character: 'dr-neumann', title: 'Il colloquio di lavoro',
        opening: 'Grazie di essere qui. Può parlarmi un po\' di sé?',
        keyPhrases: [['Ho … anni di esperienza in …', 'experience'], ['Mi interessa particolarmente …', 'motivation'], ['Uno dei miei punti di forza è …', 'strengths'], ['Potrebbe dirmi di più su …?', 'asking questions']],
        grammarFocus: 'Passato prossimo vs imperfetto',
        criteria: [
          crit('experience', 'Present your experience', ['esperienza', 'ho lavorato', 'anni', 'studiato', 'laurea'], 'Ho … anni di esperienza in …', 'Ho cinque anni di esperienza nella logistica.', 'Cosa ha fatto finora?', 'Molto interessante.'),
          crit('motivation', 'Explain your motivation', ['mi interessa', 'motivato', 'perche', 'la vostra azienda', 'posizione'], 'Mi interessa questa posizione perché …', 'Mi interessa questa posizione perché lavorate a livello internazionale.', 'Perché vuole lavorare con noi?', 'Mi fa piacere.'),
          crit('question', 'Ask a question', ['potrebbe dirmi', 'squadra', 'team', 'formazione', 'prossimi passi'], 'Potrebbe dirmi di più su …?', 'Potrebbe dirmi di più sul team?', 'Ha domande?', 'Certo, il team è di otto persone.'),
        ],
        closingLine: 'Grazie per il suo tempo. La contatteremo presto.',
      },
    ],
  },
];

export const MISSIONS_INTL: MissionDef[] = SCENARIOS.flatMap((s) =>
  s.variants.map((v) => ({
    slug: s.slug,
    lang: v.lang,
    env: s.env,
    character: v.character,
    title: v.title,
    description: s.description,
    objective: s.objective,
    scenario: s.scenario,
    level: s.level,
    difficulty: s.difficulty,
    skills: s.skills,
    minutes: s.minutes,
    xp: s.xp,
    keyPhrases: v.keyPhrases,
    grammarFocus: v.grammarFocus,
    opening: v.opening,
    criteria: v.criteria,
    closingLine: v.closingLine,
  })),
);

export const EXTRA_MODES_EN: MissionDef[] = [
  {
    slug: 'chaos-travel-day', lang: 'en', env: 'airport', character: 'sara-checkin', mode: 'CHAOS',
    title: 'Chaos: Travel Day', description: "Something will go wrong on your trip. You don't know what. Handle it.",
    objective: 'Understand the problem, explain what you need and get a concrete solution.',
    scenario: 'A travel day that does not go to plan.', level: 'A2', difficulty: 3, skills: ['SPEAKING', 'LISTENING'], minutes: 7, xp: 120,
    keyPhrases: [['What happened?', 'question'], ['What are my options?', 'alternatives'], ['I need to …', 'needs'], ['Could you rebook me?', 'rebooking']],
    grammarFocus: 'Questions and modal verbs', opening: 'Excuse me, have you got a moment?',
    criteria: [
      crit('understand', 'Find out exactly what happened', ['what happened', 'why', 'what does that mean', 'sorry'], 'What happened? / Why …?', 'What happened exactly?', 'Do you understand what\'s going on?', 'Let me explain again.'),
      crit('need', 'Explain what you need', ['i need', 'i have to', 'important', 'tonight', 'because'], 'I need to … because …', 'I need to be in Edinburgh tonight because I start work tomorrow.', 'What matters most to you right now?', 'Okay, I understand.'),
      crit('solution', 'Get a concrete solution', ['options', 'alternative', 'rebook', 'next', 'hotel', 'voucher', 'refund'], 'What are my options? / Could you rebook me?', 'Could you rebook me on the next flight?', 'What would you suggest?', "Right, let's do that."),
    ],
    closingLine: 'Phew — sorted! Safe travels.',
    extra: { twists: [
      { title: 'Flight cancelled', situation: 'Your flight has been cancelled due to fog.', openingLine: "I'm afraid your flight to Edinburgh has just been cancelled due to fog." },
      { title: 'Hotel booking lost', situation: 'The hotel has no record of your booking.', openingLine: "Sorry, I can't find a booking under your name — and we're fully booked tonight." },
      { title: 'Phone stolen', situation: 'Your phone was stolen at the station.', openingLine: 'Hello, police. You look upset — has something been stolen?' },
    ] },
  },
  {
    slug: 'debate-remote-work', lang: 'en', env: 'business', character: 'lukas-debater', mode: 'DEBATE',
    title: 'Debate: Should People Work Remotely?', description: 'Your partner thinks everyone should be back in the office. Argue the other side.',
    objective: 'Defend remote work with two arguments, respond to a counter-argument and conclude.',
    scenario: 'A structured debate. The AI argues against remote work.', level: 'B1', difficulty: 4, skills: ['SPEAKING', 'GRAMMAR'], minutes: 8, xp: 150,
    keyPhrases: [['In my view, …', 'opinion'], ['I see your point, but …', 'concession'], ['What\'s more, …', 'adding'], ['To sum up, …', 'conclusion']],
    grammarFocus: 'Linking words and conditionals', opening: "I'm convinced remote work damages teams. People simply collaborate better in an office. What do you think?",
    criteria: [
      crit('argument1', 'Give your first argument', ['in my view', 'i think', 'commute', 'flexible', 'productive'], 'In my view, … because …', 'In my view, people are more productive at home because they don\'t commute.', 'Have you got an argument?', 'Hm, the commute — fair point.'),
      crit('counter', 'Respond to the counter-argument', ['i see your point', 'but', 'however', 'tools', 'video calls'], 'I see your point, but …', 'I see your point, but with good tools teamwork works online too.', 'But collaboration suffers!', 'Interesting, but not everyone can do that.'),
      crit('conclude', 'Conclude', ['to sum up', 'overall', 'in conclusion', 'that\'s why'], 'To sum up, …', 'To sum up, remote work is better for most jobs.', 'And your conclusion?', 'Well argued. I\'m almost convinced.'),
    ],
    closingLine: 'A strong case. A draw — with a slight edge to you!',
    extra: { stance: 'Against remote work: offices are better for collaboration and culture.', topic: 'Remote work' },
  },
];
