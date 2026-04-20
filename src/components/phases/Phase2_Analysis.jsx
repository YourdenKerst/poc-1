import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore, PHASE } from '../../store/useAppStore'
import { generateProfile, buildSessionData } from '../../services/claudeApi'

const MIN_DURATION_MS = 8000 // minimum dramatic pause

export default function Phase2_Analysis() {
  const [statusText, setStatusText] = useState('Signalen verwerken...')
  const [error, setError] = useState(null)
  const startRef = useRef(Date.now())

  const {
    swipeCards,
    speechAnswers,
    dilemmaResponses,
    emotionHistory,
    cameraPeaks,
    setProfile,
    setPhase,
  } = useAppStore()

  useEffect(() => {
    const run = async () => {
      const sessionData = buildSessionData(
        swipeCards,
        speechAnswers,
        dilemmaResponses,
        emotionHistory,
        cameraPeaks
      )

      const statusSequence = [
        [1500, 'Gedragspatronen herkennen...'],
        [3000, 'Emotiedata koppelen...'],
        [4500, 'Taalanalyse verwerken...'],
        [6000, 'Profiel samenstellen...'],
      ]

      const timers = statusSequence.map(([delay, text]) =>
        setTimeout(() => setStatusText(text), delay)
      )

      try {
        const [profile] = await Promise.all([
          generateProfile(sessionData),
          new Promise((r) => setTimeout(r, MIN_DURATION_MS)),
        ])

        timers.forEach(clearTimeout)
        setStatusText('Profiel gereed.')
        setTimeout(() => {
          setProfile(profile)
          setPhase(PHASE.REVEAL)
        }, 1200)
      } catch (err) {
        timers.forEach(clearTimeout)
        console.error('Profile generation failed:', err)

        // Generate a fallback profile so the demo still works
        const fallback = {
          persoonlijkheid: {
            trefwoorden: ['Analytisch', 'Bedachtzaam', 'Onafhankelijk'],
            uitleg: `Op basis van de ${swipeCards.length} swipes en ${speechAnswers.length} antwoorden toont deze persoon een gestructureerde besluitvorming. De gemiddelde pauzeduur suggereert zorgvuldig afwegen.`,
          },
          emotioneel_profiel: `Overwegend neutraal met sporadische pieken van betrokkenheid. De reactietijden wijzen op een persoon die eerst nadenkt voor hij of zij reageert.`,
          koopgedrag: `Vergelijkt uitgebreid voor aankoop. Kwaliteit weegt zwaarder dan prijs. Gevoelig voor bewijs en recensies.`,
          advertentieprofiel: {
            doelgroep: 'Analytische professional, 25–45',
            beste_moment: 'Avond, na 20:00',
            methode: 'Langere contentformats, data-gedreven argumenten',
          },
        }

        setError(`API niet bereikbaar — demo-profiel gegenereerd. (${err.message})`)
        setTimeout(() => {
          setProfile(fallback)
          setPhase(PHASE.REVEAL)
        }, 3000)
      }
    }

    run()
  }, []) // eslint-disable-line

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
        gap: 40,
      }}
    >
      {/* Pulsing circle */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 2.2, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid var(--accent)',
            }}
          />
        ))}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            border: '1px solid transparent',
            borderTopColor: 'var(--accent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          🧠
        </div>
      </div>

      {/* Status text */}
      <motion.div
        key={statusText}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: 1 }}>{statusText}</div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-dim)' }}>
          Analyseren op basis van gedragssignalen
        </div>
      </motion.div>

      {/* Data summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        style={{
          display: 'flex',
          gap: 32,
          fontSize: 11,
          color: 'var(--text-dim)',
        }}
      >
        <div>{swipeCards.length} swipes</div>
        <div>{speechAnswers.length} antwoorden</div>
        <div>{dilemmaResponses.length} dilemma's</div>
      </motion.div>

      {/* Error notice */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            maxWidth: 400,
            padding: '12px 16px',
            background: 'rgba(255,51,51,0.1)',
            border: '1px solid rgba(255,51,51,0.3)',
            borderRadius: 8,
            fontSize: 11,
            color: 'var(--accent-red)',
            textAlign: 'center',
          }}
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  )
}
