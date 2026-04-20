import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'

const REAL_EXAMPLES = [
  {
    company: 'TikTok',
    icon: '📱',
    text: 'Meet hoelang jij bij een video pauzeerde voor je doorscrolde — en bouwt daarmee een model van jouw emotionele reacties op content.',
  },
  {
    company: 'Spotify',
    icon: '🎵',
    text: 'Gebruikt je skipgedrag om jouw persoonlijkheid te modelleren. Ze verkopen dit profiel aan adverteerders als "Emotional Spotify segment".',
  },
  {
    company: 'Google',
    icon: '🔍',
    text: 'Analyseert hoe lang je over een zoekresultaat nadenkt voor je klikt — en leidt hieruit jouw zekerheid, kennis en koopintentie af.',
  },
  {
    company: 'LinkedIn',
    icon: '💼',
    text: 'Volgt je scroll-snelheid en muisbewegingen op vacatures om je "job-seeking intent score" te berekenen — zichtbaar voor recruiters.',
  },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.4, delayChildren: 0.3 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

export default function Phase4_Context() {
  const { reset } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        height: '100vh',
        overflowY: 'auto',
        padding: '40px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(0,170,255,0.06)',
            border: '1px solid rgba(0,170,255,0.2)',
            borderRadius: 12,
            padding: '28px 32px',
            marginBottom: 36,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 16 }}>🔒</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
            We hebben <strong style={{ color: 'var(--accent)' }}>niets opgeslagen</strong>.
            Dit profiel verdwijnt zodra je verder gaat.
          </p>
          <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7, color: 'var(--text-dim)' }}>
            Maar dit soort analyse gebeurt nu, op dit moment,
            op elke app die je gebruikt —{' '}
            <span style={{ color: 'var(--accent-red)' }}>zonder dat je het weet.</span>
          </p>
        </motion.div>

        {/* Section title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: 20 }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--accent)',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Dit gebeurt nu al
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Concrete voorbeelden uit de praktijk</h3>
        </motion.div>

        {/* Examples */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}
        >
          {REAL_EXAMPLES.map((ex) => (
            <motion.div
              key={ex.company}
              variants={itemVariants}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '18px 22px',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>{ex.icon}</div>
              <div>
                <div
                  style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--accent)' }}
                >
                  {ex.company}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
                  {ex.text}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action / reset */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.7 }}>
            De volgende keer dat je scrollt, pauseert, twijfelt of klikt —
            <br />
            weet dan dat iemand kijkt.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={reset}
            style={{
              padding: '14px 48px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              color: 'var(--text)',
              fontSize: 13,
              letterSpacing: 2,
              textTransform: 'uppercase',
              transition: 'border-color 0.2s',
            }}
          >
            Opnieuw
          </motion.button>

          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-dim)', opacity: 0.5 }}>
            Camera en microfoon worden gestopt
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
