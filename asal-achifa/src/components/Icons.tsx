type IconProps = { className?: string }

const base = 'h-6 w-6'

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3l7 3v6c0 5-3.2 8-7 9-3.8-1-7-4-7-9V6l7-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LeafIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path d="M5 19c8 1 14-5 14-14-9 0-14 6-14 14z" strokeLinejoin="round" />
      <path d="M6 18c3-4 6-6 12-11" strokeLinecap="round" />
    </svg>
  )
}

export function BoltIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function HeartIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path
        d="M12 20s-7.5-4.6-10-9.3C.4 7 2.4 3.8 5.8 3.4c2-.2 3.7.8 4.9 2.4 1.2-1.6 2.9-2.6 4.9-2.4 3.4.4 5.4 3.6 3.8 7.3-2.5 4.7-7.4 9.3-7.4 9.3z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BoneIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9" strokeLinejoin="round" />
      <path d="M8 12h8M12 8v8" strokeLinecap="round" />
    </svg>
  )
}

export function MoonIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" strokeLinejoin="round" />
    </svg>
  )
}

export function DropIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10 12 3 12 3z" strokeLinejoin="round" />
    </svg>
  )
}

export function BrainIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path
        d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.8V15a3 3 0 0 0 3 3h1M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.8V15a3 3 0 0 1-3 3h-1M9 4v14M15 4v14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MailIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PinIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

export function InstagramIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TikTokIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <path
        d="M14 3v10.2a3.3 3.3 0 1 1-2.6-3.23"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 3c.5 2.6 2.2 4.3 4.6 4.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FacebookIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9" />
      <path d="M14 8h-1.5A1.5 1.5 0 0 0 11 9.5V12h3l-.5 3H11v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
