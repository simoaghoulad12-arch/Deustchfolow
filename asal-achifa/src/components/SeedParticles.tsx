import { useMemo } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'

interface Seed {
  id: number
  angle: number
  distance: number
  size: number
  rotate: number
  drift: number
}

function makeSeeds(count: number): Seed[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    angle: (id / count) * Math.PI * 2 + Math.random() * 0.4,
    distance: 90 + Math.random() * 150,
    size: 4 + Math.random() * 5,
    rotate: Math.random() * 360,
    drift: Math.random() * 30 - 15,
  }))
}

function Seed({ seed, progress }: { seed: Seed; progress: MotionValue<number> }) {
  const x = useTransform(progress, [0.5, 1], [0, Math.cos(seed.angle) * seed.distance])
  const y = useTransform(progress, [0.5, 1], [0, Math.sin(seed.angle) * seed.distance * 0.7 + 40])
  const opacity = useTransform(progress, [0.5, 0.58, 0.95, 1], [0, 1, 1, 0.9])
  const rotate = useTransform(progress, [0.5, 1], [0, seed.rotate])
  const scale = useTransform(progress, [0.5, 0.65], [0.3, 1])

  return (
    <motion.span
      className="absolute left-1/2 top-[58%] block rounded-[45%] bg-gradient-to-br from-[#3a2c1a] via-[#161008] to-black shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
      style={{
        width: seed.size,
        height: seed.size * 1.8,
        x,
        y,
        opacity,
        rotate,
        scale,
      }}
    />
  )
}

export default function SeedParticles({ progress }: { progress: MotionValue<number> }) {
  const seeds = useMemo(() => makeSeeds(26), [])

  return (
    <div className="pointer-events-none absolute inset-0">
      {seeds.map((s) => (
        <Seed key={s.id} seed={s} progress={progress} />
      ))}
    </div>
  )
}
