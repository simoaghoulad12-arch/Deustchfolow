import { useMemo } from 'react'

interface Particle {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
  opacity: number
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2.6,
    duration: 5 + Math.random() * 8,
    delay: Math.random() * 6,
    opacity: 0.25 + Math.random() * 0.55,
  }))
}

export default function ParticleField({ count = 42 }: { count?: number }) {
  const particles = useMemo(() => makeParticles(count), [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-float rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            background: 'radial-gradient(circle, #f3e2b3 0%, #d9b26a 55%, transparent 75%)',
            boxShadow: '0 0 6px 1px rgba(217,178,106,0.55)',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-radial-fade" />
    </div>
  )
}
