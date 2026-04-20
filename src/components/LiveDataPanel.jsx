import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, PHASE } from '../store/useAppStore'
import { EMOTION_EMOJI, EMOTION_COLOR } from '../utils/emotions'

function VolumeBar({ volume }) {
  const filled = Math.ceil((volume / 100) * 10)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: i < filled ? 6 + i * 1.4 : 3,
            opacity: i < filled ? 1 : 0.12,
            background: i < filled ? (i >= 8 ? '#ff3333' : 'var(--accent)') : '#fff',
          }}
          transition={{ duration: 0.07 }}
          style={{ width: 3, borderRadius: 1 }}
        />
      ))}
    </div>
  )
}

export function LiveDataPanel() {
  const { liveMetrics, phase } = useAppStore()
  const { emotion, volume, pace, pauseDuration } = liveMetrics

  const safeEmotion = emotion === '—' ? 'neutraal' : emotion
  const emoji = EMOTION_EMOJI[safeEmotion] || '😐'
  const color = EMOTION_COLOR[safeEmotion] || '#555'

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        background: 'rgba(6,6,10,0.93)',
        border: '1px solid #1e1e2a',
        borderRadius: 10,
        padding: '14px 16px',
        zIndex: 200,
        width: 180,
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <motion.div
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff88', flexShrink: 0 }}
        />
        <span style={{ fontSize: 8, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>
          Live signalen
        </span>
      </div>

      {/* ── Emotion ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 8, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Gezicht
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={safeEmotion}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'backOut' }}
              style={{
                fontSize: 34,
                lineHeight: 1,
                filter: `drop-shadow(0 0 10px ${color}88)`,
              }}
            >
              {emoji}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={safeEmotion}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: 0.5 }}
            >
              {safeEmotion}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div style={{ height: 1, background: '#1a1a22' }} />

      {/* ── Volume ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 8, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Microfoon
        </span>
        <VolumeBar volume={volume} />
      </div>

      <div style={{ height: 1, background: '#1a1a22' }} />

      {/* ── Phase metric ── */}
      {phase === PHASE.SWIPE && (
        <div>
          <span style={{ fontSize: 8, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
            Pauzeduur
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
            {pauseDuration > 0 ? `${pauseDuration}s` : '—'}
          </span>
        </div>
      )}

      {phase === PHASE.QUIZ && (
        <div>
          <span style={{ fontSize: 8, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
            Spreektempo
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
            {pace !== '—' ? `${pace} w/s` : '—'}
          </span>
        </div>
      )}

      {phase === PHASE.DILEMMAS && (
        <div>
          <span style={{ fontSize: 8, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
            Beslissingstijd
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
            {pauseDuration > 0 ? `${pauseDuration}s` : '—'}
          </span>
        </div>
      )}
    </motion.div>
  )
}
