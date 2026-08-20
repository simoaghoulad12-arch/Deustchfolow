import { motion, useTransform, type MotionValue } from 'framer-motion'

/**
 * The bottle is drawn once in SVG and driven entirely by scroll progress (0 → 1)
 * coming from the parent's useScroll(). Lid lift/rotate, honey pour, and seed
 * dispersal are all derived transforms of that single progress value.
 */
export default function HoneyBottle({ progress }: { progress: MotionValue<number> }) {
  // Phase mapping across the pinned scroll range:
  // 0.00–0.28  lid opens
  // 0.22–0.60  honey flows
  // 0.50–1.00  seeds disperse
  const lidRotate = useTransform(progress, [0, 0.28], [0, -34])
  const lidLift = useTransform(progress, [0, 0.28], [0, -46])
  const lidOpacity = useTransform(progress, [0, 0.05], [1, 1])

  const honeyPourHeight = useTransform(progress, [0.2, 0.62], [0, 210])
  const honeyPourOpacity = useTransform(progress, [0.18, 0.26, 0.95, 1], [0, 1, 1, 0.85])
  const honeyPoolScale = useTransform(progress, [0.3, 0.62], [0, 1])
  const bottleGlow = useTransform(progress, [0, 0.3, 1], [0.55, 1, 0.7])

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Ambient glow behind bottle */}
      <motion.div
        className="absolute h-[260px] w-[260px] rounded-full blur-3xl sm:h-[320px] sm:w-[320px]"
        style={{
          opacity: bottleGlow,
          background: 'radial-gradient(circle, rgba(217,178,106,0.55) 0%, rgba(217,178,106,0.08) 55%, transparent 75%)',
        }}
      />

      <svg
        viewBox="0 0 300 480"
        className="relative h-[38vh] max-h-[360px] w-auto drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)] sm:h-[42vh] sm:max-h-[400px]"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a2b16" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#1b120a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3a2b16" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3d98a" />
            <stop offset="50%" stopColor="#d9a13c" />
            <stop offset="100%" stopColor="#a8681f" />
          </linearGradient>
          <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3e2b3" />
            <stop offset="50%" stopColor="#c69a4e" />
            <stop offset="100%" stopColor="#8a642c" />
          </linearGradient>
          <radialGradient id="labelGlow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f3e2b3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c69a4e" stopOpacity="0.15" />
          </radialGradient>
        </defs>

        {/* Bottle body */}
        <path
          d="M100 150 C90 160 88 175 88 195 L88 400 C88 425 108 440 150 440 C192 440 212 425 212 400 L212 195 C212 175 210 160 200 150 Z"
          fill="url(#glassGrad)"
          stroke="#c69a4e"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />

        {/* honey pool inside bottle, grows as it "empties" visually via opacity shift */}
        <motion.rect
          x="90"
          y="260"
          width="120"
          height="170"
          rx="30"
          fill="url(#honeyGrad)"
          style={{ opacity: useTransform(progress, [0, 0.4], [0.9, 0.35]) }}
        />

        {/* Label */}
        <rect x="98" y="270" width="104" height="86" rx="10" fill="url(#labelGlow)" fillOpacity="0.12" stroke="#d9b26a" strokeOpacity="0.55" strokeWidth="1" />
        <text x="150" y="300" textAnchor="middle" fontFamily="Amiri, serif" fontSize="16" fill="#f3e2b3">
          عسل الشفاء
        </text>
        <text x="150" y="322" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="13" letterSpacing="2" fill="#e9cd8a">
          ASAL ACHIFA
        </text>
        <line x1="118" y1="332" x2="182" y2="332" stroke="#c69a4e" strokeOpacity="0.6" />
        <text x="150" y="348" textAnchor="middle" fontFamily="Jost, sans-serif" fontSize="8.5" letterSpacing="1.5" fill="#d9b26a">
          HONIG · SCHWARZKÜMMEL
        </text>

        {/* Bottle neck */}
        <path d="M118 150 L118 118 C118 108 126 102 150 102 C174 102 182 108 182 118 L182 150 Z" fill="url(#glassGrad)" stroke="#c69a4e" strokeOpacity="0.45" strokeWidth="1.5" />

        {/* Lid group: rotates + lifts */}
        <motion.g
          style={{
            rotate: lidRotate,
            y: lidLift,
            opacity: lidOpacity,
            transformOrigin: '150px 95px',
          }}
        >
          <rect x="112" y="78" width="76" height="26" rx="8" fill="url(#lidGrad)" stroke="#8a642c" strokeWidth="1" />
          <rect x="118" y="70" width="64" height="14" rx="6" fill="url(#lidGrad)" stroke="#8a642c" strokeWidth="1" />
        </motion.g>

        {/* Honey pour stream from neck opening */}
        <motion.path
          d="M150 108 C146 140 158 170 150 200 C144 224 156 250 150 280"
          fill="none"
          stroke="url(#honeyGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          style={{
            opacity: honeyPourOpacity,
            pathLength: 1,
          }}
        />
        <motion.rect
          x="140"
          y="108"
          width="20"
          height={honeyPourHeight}
          fill="url(#honeyGrad)"
          style={{ opacity: honeyPourOpacity }}
          rx="8"
        />

        {/* Honey droplet pooling below the bottle */}
        <motion.ellipse
          cx="150"
          cy="452"
          rx="46"
          ry="12"
          fill="url(#honeyGrad)"
          style={{ scale: honeyPoolScale, opacity: honeyPourOpacity }}
        />
      </svg>
    </div>
  )
}
