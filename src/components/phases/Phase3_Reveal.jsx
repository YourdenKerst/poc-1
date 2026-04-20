import { motion } from 'framer-motion'
import { useAppStore, PHASE } from '../../store/useAppStore'
import { EMOTION_EMOJI, EMOTION_COLOR } from '../../utils/emotions'

// ─── Animation helpers ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}

const stagger = (delay = 0.75) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay, delayChildren: 0.3 } },
})

// ─── Animated fill bar ───────────────────────────────────────────────────────

function Bar({ pct, color = 'var(--accent)', delay = 0 }) {
  return (
    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay }}
        style={{ height: '100%', background: color, borderRadius: 3 }}
      />
    </div>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ children, accent = 'var(--accent)' }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        background: '#0e0e14',
        border: `1px solid ${accent}22`,
        borderTop: `2px solid ${accent}`,
        borderRadius: 12,
        padding: '22px 24px',
        overflow: 'hidden',
      }}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children, color = 'var(--accent)' }) {
  return (
    <div style={{ fontSize: 9, color, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, opacity: 0.8 }}>
      {children}
    </div>
  )
}

// ─── 1. Personality keywords ─────────────────────────────────────────────────

function PersonalitySection({ trefwoorden, uitleg }) {
  return (
    <Section accent="var(--accent)">
      <SectionLabel>Persoonlijkheid</SectionLabel>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {trefwoorden.map((word, i) => (
          <motion.div
            key={word}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.18, type: 'spring', stiffness: 200 }}
            style={{
              padding: '8px 18px',
              border: '1px solid rgba(0,170,255,0.4)',
              borderRadius: 40,
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--accent)',
              background: 'rgba(0,170,255,0.08)',
              letterSpacing: 0.5,
            }}
          >
            {word}
          </motion.div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{uitleg}</p>
    </Section>
  )
}

// ─── 2. Interests from swipe data ────────────────────────────────────────────

function InterestsSection({ swipeCards }) {
  const liked     = swipeCards.filter((c) => c.direction === 'right')
  const disliked  = swipeCards.filter((c) => c.direction === 'left')
  const hesitated = swipeCards.filter((c) => c.hesitated)

  if (liked.length === 0 && disliked.length === 0) return null

  return (
    <Section accent="#00ff88">
      <SectionLabel color="#00ff88">Interesseprofiel — uit swipe-gedrag</SectionLabel>

      {liked.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: '#00ff8866', letterSpacing: 2, marginBottom: 8 }}>AANGETROKKEN DOOR</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {liked.map((c) => (
              <div
                key={c.category}
                style={{
                  padding: '5px 12px',
                  background: 'rgba(0,255,136,0.1)',
                  border: '1px solid rgba(0,255,136,0.35)',
                  borderRadius: 20,
                  fontSize: 12,
                  color: '#00ff88',
                }}
              >
                ✓ {c.category}
              </div>
            ))}
          </div>
        </div>
      )}

      {disliked.length > 0 && (
        <div style={{ marginBottom: hesitated.length > 0 ? 12 : 0 }}>
          <div style={{ fontSize: 9, color: '#ff333366', letterSpacing: 2, marginBottom: 8 }}>WEGGEVEEGD</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {disliked.map((c) => (
              <div
                key={c.category}
                style={{
                  padding: '5px 12px',
                  background: 'rgba(255,51,51,0.07)',
                  border: '1px solid rgba(255,51,51,0.2)',
                  borderRadius: 20,
                  fontSize: 12,
                  color: 'rgba(255,51,51,0.6)',
                }}
              >
                ✕ {c.category}
              </div>
            ))}
          </div>
        </div>
      )}

      {hesitated.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: '#ff990066', letterSpacing: 2, marginBottom: 8 }}>TWIJFEL GEDETECTEERD BIJ</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hesitated.map((c) => (
              <div
                key={c.category}
                style={{
                  padding: '5px 12px',
                  background: 'rgba(255,153,0,0.08)',
                  border: '1px solid rgba(255,153,0,0.3)',
                  borderRadius: 20,
                  fontSize: 12,
                  color: '#ff9900',
                }}
              >
                ⟳ {c.category}
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

// ─── 3. Emotion timeline ─────────────────────────────────────────────────────

function EmotionTimeline({ emotionHistory }) {
  if (emotionHistory.length === 0) return null

  // Sample ~14 evenly spaced snapshots across the session
  const step = Math.max(1, Math.floor(emotionHistory.length / 14))
  const sample = emotionHistory.filter((_, i) => i % step === 0).slice(0, 14)

  // Count totals for the summary row
  const counts = {}
  emotionHistory.forEach(({ emotion }) => { counts[emotion] = (counts[emotion] || 0) + 1 })
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 4)
  const total  = emotionHistory.length

  return (
    <Section accent="#cc66ff">
      <SectionLabel color="#cc66ff">Emotie tijdens de sessie</SectionLabel>

      {/* Timeline row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 16 }}>
        {sample.map(({ emotion }, i) => {
          const color = EMOTION_COLOR[emotion] || '#555'
          const emoji = EMOTION_EMOJI[emotion] || '😐'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}
            >
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <div style={{ width: '100%', height: 3, background: color, borderRadius: 2, opacity: 0.7 }} />
              <div style={{ fontSize: 7, color: '#444', letterSpacing: 0 }}>{i === 0 ? 'start' : i === sample.length - 1 ? 'einde' : ''}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {sorted.map(([emotion, count]) => {
          const color = EMOTION_COLOR[emotion] || '#555'
          const emoji = EMOTION_EMOJI[emotion] || '😐'
          const pct = Math.round((count / total) * 100)
          return (
            <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, width: 20 }}>{emoji}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: 80, whiteSpace: 'nowrap' }}>{emotion}</span>
              <Bar pct={pct} color={color} />
              <span style={{ fontSize: 10, color, width: 30, textAlign: 'right' }}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ─── 4. Behaviour metrics ─────────────────────────────────────────────────────

function BehaviourSection({ speechAnswers, swipeCards, dilemmaResponses }) {
  const avgSwipePause = swipeCards.length > 0
    ? Math.round(swipeCards.reduce((a, c) => a + c.pauseMs, 0) / swipeCards.length)
    : 0

  const avgWps = speechAnswers.length > 0
    ? speechAnswers.reduce((a, s) => a + (s.wps || 0), 0) / speechAnswers.length
    : 0

  const totalHesitations = speechAnswers.reduce((a, s) => a + (s.hesitations || 0), 0)

  const avgDecision = dilemmaResponses.length > 0
    ? Math.round(dilemmaResponses.reduce((a, d) => a + d.decisionTimeMs, 0) / dilemmaResponses.length)
    : 0

  const metrics = [
    {
      label: 'Swipe-pauzeduur',
      value: avgSwipePause > 0 ? `${(avgSwipePause / 1000).toFixed(1)}s` : '—',
      pct: Math.min(100, (avgSwipePause / 4000) * 100),
      color: 'var(--accent)',
      sub: 'gemiddeld per kaart',
    },
    {
      label: 'Spreektempo',
      value: avgWps > 0 ? `${avgWps.toFixed(1)} w/s` : '—',
      pct: Math.min(100, (avgWps / 4) * 100),
      color: '#00ff88',
      sub: 'woorden per seconde',
    },
    {
      label: 'Beslissingstijd',
      value: avgDecision > 0 ? `${(avgDecision / 1000).toFixed(1)}s` : '—',
      pct: Math.min(100, (avgDecision / 6000) * 100),
      color: '#ff9900',
      sub: "gemiddeld bij dilemma\u2019s",
    },
    {
      label: 'Aarzelingen',
      value: totalHesitations > 0 ? `${totalHesitations}×` : '0×',
      pct: Math.min(100, (totalHesitations / 10) * 100),
      color: '#cc66ff',
      sub: 'uh / uhm / eh in antwoorden',
    },
  ]

  return (
    <Section accent="#ff9900">
      <SectionLabel color="#ff9900">Gedragsmeetpunten</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {metrics.map(({ label, value, pct, color, sub }, i) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bar pct={pct} color={color} delay={0.2 + i * 0.1} />
            </div>
            <div style={{ fontSize: 9, color: '#444', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── 5. Ad profile ───────────────────────────────────────────────────────────

function AdProfileSection({ advertentieprofiel, koopgedrag }) {
  const { doelgroep, beste_moment, methode } = advertentieprofiel

  return (
    <Section accent="#ff3333">
      <SectionLabel color="#ff3333">Advertentieprofiel — gesimuleerd</SectionLabel>

      {/* Target indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        {/* Concentric rings */}
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.4 }}
              style={{
                position: 'absolute',
                inset: i * 9,
                borderRadius: '50%',
                border: `1px solid ${i === 2 ? '#ff3333' : 'rgba(255,51,51,' + (0.3 - i * 0.1) + ')'}`,
              }}
            />
          ))}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            style={{
              position: 'absolute',
              inset: '40%',
              borderRadius: '50%',
              background: '#ff3333',
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#ff3333aa', marginBottom: 4 }}>DOELGROEP</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{doelgroep}</div>
        </div>
      </div>

      {/* Timing + method */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div style={{ padding: '12px 14px', background: 'rgba(255,51,51,0.06)', borderRadius: 8, border: '1px solid rgba(255,51,51,0.15)' }}>
          <div style={{ fontSize: 9, color: '#ff333366', letterSpacing: 2, marginBottom: 6 }}>BESTE MOMENT</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{beste_moment}</div>
        </div>
        <div style={{ padding: '12px 14px', background: 'rgba(255,51,51,0.06)', borderRadius: 8, border: '1px solid rgba(255,51,51,0.15)' }}>
          <div style={{ fontSize: 9, color: '#ff333366', letterSpacing: 2, marginBottom: 6 }}>METHODE</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{methode}</div>
        </div>
      </div>

      {/* Purchase behaviour text */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, borderTop: '1px solid rgba(255,51,51,0.12)', paddingTop: 14 }}>
        {koopgedrag}
      </p>
    </Section>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Phase3_Reveal() {
  const {
    profile,
    swipeCards,
    speechAnswers,
    dilemmaResponses,
    emotionHistory,
    setPhase,
  } = useAppStore()

  if (!profile) return null

  const { persoonlijkheid, koopgedrag, advertentieprofiel } = profile

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ height: '100vh', overflowY: 'auto', padding: '36px 20px 80px' }}
    >
      <div style={{ maxWidth: 580, margin: '0 auto' }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 10, color: 'var(--accent-red)', letterSpacing: 5, textTransform: 'uppercase', marginBottom: 12 }}
          >
            ● DOSSIER GEOPEND
          </motion.div>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>
            Jouw gedragsprofiel
          </h2>
          <p style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
            Opgebouwd uit {swipeCards.length} swipes · {speechAnswers.length} antwoorden · {dilemmaResponses.length} keuzes
          </p>
        </motion.div>

        {/* ── Sections — staggered ── */}
        <motion.div
          variants={stagger(0.65)}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <PersonalitySection
            trefwoorden={persoonlijkheid.trefwoorden}
            uitleg={persoonlijkheid.uitleg}
          />

          <InterestsSection swipeCards={swipeCards} />

          <EmotionTimeline emotionHistory={emotionHistory} />

          <BehaviourSection
            speechAnswers={speechAnswers}
            swipeCards={swipeCards}
            dilemmaResponses={dilemmaResponses}
          />

          <AdProfileSection
            advertentieprofiel={advertentieprofiel}
            koopgedrag={koopgedrag}
          />
        </motion.div>

        {/* ── Continue ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.5 }}
          style={{ textAlign: 'center', marginTop: 36 }}
        >
          <motion.button
            whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPhase(PHASE.CONTEXT)}
            style={{
              padding: '13px 44px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              color: 'var(--text)',
              fontSize: 12,
              letterSpacing: 2,
              textTransform: 'uppercase',
              transition: 'border-color 0.2s',
            }}
          >
            Wat betekent dit? →
          </motion.button>
        </motion.div>

      </div>
    </motion.div>
  )
}
