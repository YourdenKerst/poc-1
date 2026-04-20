import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, PHASE } from '../../store/useAppStore'

const DILEMMAS = [
  {
    id: 1,
    question: 'Je vindt een portemonnee met €50. Wat doe je?',
    options: ['Houd het', 'Lever in bij politie', 'Probeer eigenaar te vinden'],
  },
  {
    id: 2,
    question: 'Een vriend liegt op zijn CV. Jij weet het. Wat doe je?',
    options: ['Zeg niks', 'Vertel het hem', 'Vertel het de werkgever'],
  },
  {
    id: 3,
    question: 'Je kunt één superkracht kiezen. Welke?',
    options: ['Onzichtbaar zijn', 'Gedachten lezen', 'Tijd stilzetten'],
  },
  {
    id: 4,
    question: 'Je krijgt €1000 cadeau. Wat doe je eerst?',
    options: ['Sparen', 'Uitgeven aan iets voor mezelf', 'Weggeven of doneren'],
  },
]

export default function Phase1C_Dilemmas() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [firstSelected, setFirstSelected] = useState(null)
  const dilemmaStartRef = useRef(Date.now())

  const { addDilemmaResponse, setPhase, updateLiveMetrics } = useAppStore()

  const handleSelect = (option) => {
    if (selected === null) {
      setFirstSelected(option)
    }
    setSelected(option)
  }

  const handleConfirm = () => {
    if (selected === null) return

    const decisionTimeMs = Date.now() - dilemmaStartRef.current
    addDilemmaResponse({
      dilemma: DILEMMAS[index].question,
      choice: selected,
      decisionTimeMs,
      changed: firstSelected !== selected,
    })

    updateLiveMetrics({ pauseDuration: Math.round(decisionTimeMs / 100) / 10 })

    const next = index + 1
    if (next >= DILEMMAS.length) {
      setPhase(PHASE.ANALYSIS)
    } else {
      setSelected(null)
      setFirstSelected(null)
      dilemmaStartRef.current = Date.now()
      setIndex(next)
    }
  }

  const dilemma = DILEMMAS[index]
  const progress = (index / DILEMMAS.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px 40px 120px',
        gap: 28,
        maxWidth: 620,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase' }}>
          Fase 1C — Morele Keuzes
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-dim)' }}>
          Wat verraadt jouw keuze over wie je bent?
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 480, height: 2, background: 'var(--border)', borderRadius: 1 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 1 }}
        />
      </div>

      {/* Dilemma card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{ width: '100%', maxWidth: 520 }}
        >
          {/* Question */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '32px 36px',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, letterSpacing: 2 }}>
              DILEMMA {index + 1} / {DILEMMAS.length}
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.5 }}>{dilemma.question}</div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dilemma.options.map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option)}
                style={{
                  padding: '16px 24px',
                  background: selected === option ? 'rgba(0,170,255,0.12)' : 'var(--surface)',
                  border: selected === option
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
                  borderRadius: 10,
                  color: selected === option ? 'var(--accent)' : 'var(--text)',
                  fontSize: 15,
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `1px solid ${selected === option ? 'var(--accent)' : 'var(--text-dim)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selected === option && (
                    <div
                      style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}
                    />
                  )}
                </div>
                {option}
              </motion.button>
            ))}
          </div>

          {/* Confirm button */}
          <motion.button
            whileHover={selected ? { scale: 1.03 } : {}}
            whileTap={selected ? { scale: 0.97 } : {}}
            onClick={handleConfirm}
            style={{
              marginTop: 24,
              width: '100%',
              padding: '14px',
              background: selected ? 'rgba(0,170,255,0.15)' : 'transparent',
              border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              color: selected ? 'var(--accent)' : 'var(--text-dim)',
              fontSize: 13,
              letterSpacing: 2,
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              cursor: selected ? 'pointer' : 'not-allowed',
            }}
          >
            {index === DILEMMAS.length - 1 ? 'Analyseren →' : 'Volgende →'}
          </motion.button>

          {/* Changed mind hint */}
          {firstSelected && selected && firstSelected !== selected && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 12,
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--accent-red)',
                opacity: 0.7,
              }}
            >
              ⚡ Twijfel gedetecteerd — van mening veranderd
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
