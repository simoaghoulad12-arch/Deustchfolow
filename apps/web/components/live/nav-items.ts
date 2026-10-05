export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: '/home', label: 'Home', icon: '🏠' },
  { href: '/world', label: 'World', icon: '🌍' },
  { href: '/speak', label: 'Speak', icon: '🎙️' },
  { href: '/words', label: 'Words', icon: '📚' },
  { href: '/progress', label: 'Progress', icon: '📈' },
];

export const PRACTICE_NAV: NavItem[] = [
  { href: '/grammar', label: 'Grammar', icon: '🧩' },
  { href: '/brain', label: 'Brain mode', icon: '⚡' },
  { href: '/chaos', label: 'Chaos mode', icon: '🌀' },
  { href: '/story', label: 'Story mode', icon: '📖' },
  { href: '/debate', label: 'Debate', icon: '⚖️' },
  { href: '/emotion', label: 'Emotion mode', icon: '🎭' },
  { href: '/journal', label: 'Journal', icon: '📓' },
  { href: '/mistakes', label: 'My mistakes', icon: '🎯' },
];
