import type { Level } from './types';

export const ENVIRONMENTS: { slug: string; name: string; description: string; icon: string; accent: string; minLevel: Level }[] = [
  { slug: 'cafe', name: 'Café', description: 'Order, chat and pay like a local.', icon: '☕', accent: 'amber', minLevel: 'A1' },
  { slug: 'home', name: 'Home', description: 'Neighbours, landlords and life in your new apartment.', icon: '🏠', accent: 'rose', minLevel: 'A1' },
  { slug: 'city', name: 'City', description: 'Find your way, meet people, explore.', icon: '🏙️', accent: 'sky', minLevel: 'A1' },
  { slug: 'restaurant', name: 'Restaurant', description: 'Reservations, menus and the occasional complaint.', icon: '🍽️', accent: 'orange', minLevel: 'A1' },
  { slug: 'supermarket', name: 'Supermarket', description: 'Shopping, prices and returns.', icon: '🛒', accent: 'lime', minLevel: 'A1' },
  { slug: 'train-station', name: 'Train Station', description: 'Tickets, platforms and delays.', icon: '🚆', accent: 'indigo', minLevel: 'A1' },
  { slug: 'hotel', name: 'Hotel', description: 'Check in, solve problems, check out.', icon: '🏨', accent: 'violet', minLevel: 'A1' },
  { slug: 'hospital', name: 'Hospital', description: 'Doctors, pharmacies and describing symptoms.', icon: '🏥', accent: 'red', minLevel: 'A1' },
  { slug: 'airport', name: 'Airport', description: 'Check-in, security and lost luggage.', icon: '✈️', accent: 'cyan', minLevel: 'A2' },
  { slug: 'workplace', name: 'Workplace', description: 'Colleagues, customers and meetings.', icon: '💼', accent: 'slate', minLevel: 'A2' },
  { slug: 'university', name: 'University', description: 'Enrolment, seminars and group projects.', icon: '🎓', accent: 'blue', minLevel: 'A2' },
  { slug: 'government-office', name: 'Government Office', description: 'Registration, permits and paperwork.', icon: '🏛️', accent: 'stone', minLevel: 'A2' },
  { slug: 'social-life', name: 'Social Life', description: 'Friends, plans, films and opinions.', icon: '🎉', accent: 'pink', minLevel: 'A2' },
  { slug: 'travel', name: 'Travel', description: 'Rental cars, tours and adventures.', icon: '🧭', accent: 'teal', minLevel: 'B1' },
  { slug: 'business', name: 'Business', description: 'Interviews, presentations and negotiations.', icon: '📈', accent: 'emerald', minLevel: 'B1' },
];

export const CHARACTERS: {
  slug: string;
  name: string;
  role: string;
  personality: string;
  speakingStyle: string;
  avatar: string;
  env: string | null;
}[] = [
  { slug: 'lena-barista', name: 'Lena', role: 'barista at Café Morgenrot', personality: 'warm, chatty, loves recommending cakes', speakingStyle: 'friendly, uses short sentences and polite "Sie"', avatar: '👩🏼‍🍳', env: 'cafe' },
  { slug: 'tom-waiter', name: 'Tom', role: 'waiter at Restaurant Lindenhof', personality: 'professional, a little dry humour', speakingStyle: 'polite and efficient', avatar: '🧑🏻‍🍳', env: 'restaurant' },
  { slug: 'frau-weber', name: 'Frau Weber', role: 'your elderly neighbour', personality: 'curious, kind, likes order', speakingStyle: 'slow, clear, formal', avatar: '👵🏻', env: 'home' },
  { slug: 'herr-schulz', name: 'Herr Schulz', role: 'your landlord', personality: 'busy but fair', speakingStyle: 'formal, to the point', avatar: '👨🏼‍💼', env: 'home' },
  { slug: 'jonas-passenger', name: 'Jonas', role: 'a student on the train', personality: 'relaxed, helpful', speakingStyle: 'casual "du", everyday words', avatar: '🧑🏽‍🎓', env: 'train-station' },
  { slug: 'mehmet-ticket', name: 'Mehmet', role: 'ticket office clerk', personality: 'patient, precise', speakingStyle: 'clear, formal', avatar: '👨🏽‍💼', env: 'train-station' },
  { slug: 'anna-reception', name: 'Anna', role: 'hotel receptionist', personality: 'calm, solution-oriented', speakingStyle: 'polite, professional', avatar: '👩🏻‍💼', env: 'hotel' },
  { slug: 'dr-hoffmann', name: 'Dr. Hoffmann', role: 'family doctor', personality: 'reassuring, thorough', speakingStyle: 'calm, asks follow-up questions', avatar: '👩🏼‍⚕️', env: 'hospital' },
  { slug: 'kai-pharmacist', name: 'Kai', role: 'pharmacist', personality: 'friendly, careful', speakingStyle: 'clear instructions', avatar: '🧑🏼‍⚕️', env: 'hospital' },
  { slug: 'sara-checkin', name: 'Sara', role: 'airline check-in agent', personality: 'efficient, cheerful', speakingStyle: 'quick but clear', avatar: '👩🏾‍✈️', env: 'airport' },
  { slug: 'markus-colleague', name: 'Markus', role: 'your new colleague', personality: 'open, a bit chaotic', speakingStyle: 'informal "du" at work', avatar: '👨🏻‍💻', env: 'workplace' },
  { slug: 'frau-klein', name: 'Frau Klein', role: 'an unhappy customer', personality: 'frustrated but reasonable', speakingStyle: 'direct, emotional', avatar: '👩🏻‍🦰', env: 'workplace' },
  { slug: 'prof-yilmaz', name: 'Prof. Yılmaz', role: 'university lecturer', personality: 'encouraging, academic', speakingStyle: 'precise, uses some academic words', avatar: '👨🏽‍🏫', env: 'university' },
  { slug: 'herr-braun', name: 'Herr Braun', role: 'clerk at the citizens office', personality: 'strict about forms, secretly kind', speakingStyle: 'formal bureaucratic German', avatar: '👨🏼‍💼', env: 'government-office' },
  { slug: 'mia-friend', name: 'Mia', role: 'a friend from your language course', personality: 'spontaneous, funny', speakingStyle: 'casual, enthusiastic', avatar: '👩🏽', env: 'social-life' },
  { slug: 'dr-neumann', name: 'Dr. Neumann', role: 'HR manager', personality: 'friendly but probing', speakingStyle: 'professional, structured questions', avatar: '👩🏼‍💼', env: 'business' },
  { slug: 'lukas-debater', name: 'Lukas', role: 'debate partner', personality: 'sharp, enjoys arguing the other side', speakingStyle: 'confident, uses connectors', avatar: '🧔🏻', env: null },
  { slug: 'emma-barista', name: 'Emma', role: 'barista in London', personality: 'upbeat, quick', speakingStyle: 'British English, friendly', avatar: '👩🏼', env: 'cafe' },
  { slug: 'lucia-camarera', name: 'Lucía', role: 'camarera en Madrid', personality: 'lively, warm', speakingStyle: 'Castilian Spanish, friendly', avatar: '💃🏽', env: 'cafe' },
  { slug: 'camille-serveuse', name: 'Camille', role: 'serveuse à Paris', personality: 'elegant, a little ironic', speakingStyle: 'polite French with "vous"', avatar: '👩🏻‍🎨', env: 'cafe' },
  { slug: 'marco-barista', name: 'Marco', role: 'barista a Roma', personality: 'theatrical, passionate about coffee', speakingStyle: 'expressive Italian', avatar: '👨🏻‍🍳', env: 'cafe' },
];

export const ACHIEVEMENTS = [
  { code: 'first-conversation', title: 'First Conversation', description: 'Complete your first mission conversation.', icon: '💬', xpReward: 50, criteria: { metric: 'missions_completed', threshold: 1 }, order: 1 },
  { code: 'first-mission', title: 'First Mission', description: 'Your first mission in the language world.', icon: '🎯', xpReward: 0, criteria: { metric: 'missions_completed', threshold: 1 }, order: 2 },
  { code: 'mission-explorer', title: 'Explorer', description: 'Complete 10 missions.', icon: '🧭', xpReward: 150, criteria: { metric: 'missions_completed', threshold: 10 }, order: 3 },
  { code: 'streak-7', title: '7 Day Streak', description: 'Learn seven days in a row.', icon: '🔥', xpReward: 100, criteria: { metric: 'streak', threshold: 7 }, order: 4 },
  { code: 'streak-30', title: '30 Day Streak', description: 'A month without a break.', icon: '🌋', xpReward: 300, criteria: { metric: 'streak', threshold: 30 }, order: 5 },
  { code: 'words-100', title: '100 Words', description: 'Have 100 words in active learning.', icon: '📚', xpReward: 100, criteria: { metric: 'words', threshold: 100 }, order: 6 },
  { code: 'words-500', title: '500 Words', description: 'A real vocabulary.', icon: '🏛️', xpReward: 300, criteria: { metric: 'words', threshold: 500 }, order: 7 },
  { code: 'first-speaking', title: 'First Speaking Session', description: 'Use your voice for the first time.', icon: '🎙️', xpReward: 50, criteria: { metric: 'speaking_sessions', threshold: 1 }, order: 8 },
  { code: 'speaking-100', title: '100 Minutes Speaking', description: 'One hundred minutes of speaking practice.', icon: '🗣️', xpReward: 250, criteria: { metric: 'speaking_minutes', threshold: 100 }, order: 9 },
  { code: 'journal-first', title: 'Dear Diary', description: 'Write your first journal entry.', icon: '📓', xpReward: 25, criteria: { metric: 'journal_entries', threshold: 1 }, order: 10 },
  { code: 'a2-completed', title: 'A2 Completed', description: 'Reach B1 level.', icon: '🥉', xpReward: 500, criteria: { metric: 'level_reached', threshold: 3 }, order: 11 },
  { code: 'b1-completed', title: 'B1 Completed', description: 'Reach B2 level.', icon: '🥈', xpReward: 500, criteria: { metric: 'level_reached', threshold: 4 }, order: 12 },
  { code: 'b2-completed', title: 'B2 Completed', description: 'Complete B2.', icon: '🥇', xpReward: 500, criteria: { metric: 'level_reached', threshold: 5 }, order: 13 },
];
