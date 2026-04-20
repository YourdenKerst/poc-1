import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useAppStore, PHASE } from '../../store/useAppStore'

const CARDS = [
  { emoji: '🎵', category: 'Muziek' },
  { emoji: '🏃', category: 'Sport' },
  { emoji: '📚', category: 'Boeken' },
  { emoji: '🎮', category: 'Games' },
  { emoji: '💰', category: 'Geld & Investeren' },
  { emoji: '🌍', category: 'Klimaat' },
  { emoji: '🍕', category: 'Eten & Drinken' },
  { emoji: '🎬', category: 'Films & Series' },
  { emoji: '✈️', category: 'Reizen' },
  { emoji: '💻', category: 'Tech' },
  { emoji: '🧘', category: 'Meditatie & Mindfulness' },
  { emoji: '🎨', category: 'Kunst & Cultuur' },
  { emoji: '👔', category: 'Mode & Stijl' },
  { emoji: '🐾', category: 'Dieren' },
  { emoji: '🏠', category: 'Interieur & Wonen' },
  { emoji: '🍷', category: 'Uitgaan' },
  { emoji: '📰', category: 'Nieuws & Politiek' },
  { emoji: '🌱', category: 'Duurzaamheid' },
  { emoji: '💪', category: 'Fitness & Gezondheid' },
  { emoji: '🎤', category: 'Podcasts' },
]

function DraggableCard({ card, onSwipe }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-18, 18])
  const cardOpacity = useTransform(x, [-180, -80, 0, 80, 180], [0, 1, 1, 1, 0])
  const leftLabelOpacity = useTransform(x, [-120, -40, 0], [1, 0.4, 0])
  const rightLabelOpacity = useTransform(x, [0, 40, 120], [0, 0.4, 1])

  const appearedAt = useRef(Date.now())

  const handleDragEnd = (_, info) => {
    const threshold = 100
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 600) {
      const dir = info.offset.x > 0 ? 'right' : 'left'
      const pauseMs = Date.now() - appearedAt.current
      onSwipe(dir, pauseMs)
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      style={{ x, rotate, opacity: cardOpacity, position: 'absolute', width: '100%', zIndex: 10 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing', scale: 1.03 }}
      initial={{ scale: 1, y: 0 }}
    >
      {/* NEE label */}
      <motion.div
        style={{
          opacity: leftLabelOpacity,
          position: 'absolute',
          top: 28,
          left: 28,
          padding: '6px 14px',
          border: '2px solid var(--accent-red)',
          borderRadius: 4,
          color: 'var(--accent-red)',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 2,
          transform: 'rotate(-8deg)',
          zIndex: 20,
        }}
      >
        NEE ✕
      </motion.div>

      {/* JA label */}
      <motion.div
        style={{
          opacity: rightLabelOpacity,
          position: 'absolute',
          top: 28,
          right: 28,
          padding: '6px 14px',
          border: '2px solid var(--accent-green)',
          borderRadius: 4,
          color: 'var(--accent-green)',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 2,
          transform: 'rotate(8deg)',
          zIndex: 20,
        }}
      >
        JA ✓
      </motion.div>

      {/* Card face */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          cursor: 'grab',
          userSelect: 'none',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 80, lineHeight: 1 }}>{card.emoji}</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>{card.category}</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 2 }}>
          SLEEP ← of →
        </div>
      </div>
    </motion.div>
  )
}

export default function Phase1A_Swipe() {
  const [index, setIndex] = useState(0)
  const [exiting, setExiting] = useState(null)
  const cardAppearedAt = useRef(Date.now())
  const { addSwipeCard, setPhase, updateLiveMetrics } = useAppStore()

  // Reset timer when card changes
  useEffect(() => {
    cardAppearedAt.current = Date.now()
  }, [index])

  const handleSwipe = (direction, pauseMs) => {
    const hesitated = pauseMs > 2000
    addSwipeCard({
      category: CARDS[index].category,
      direction,
      pauseMs,
      hesitated,
    })
    updateLiveMetrics({ pauseDuration: Math.round(pauseMs / 100) / 10 })

    setExiting(direction)
    setTimeout(() => {
      setExiting(null)
      const next = index + 1
      if (next >= CARDS.length) {
        setPhase(PHASE.QUIZ)
      } else {
        setIndex(next)
      }
    }, 280)
  }

  const handleButton = (direction) => {
    const pauseMs = Date.now() - cardAppearedAt.current
    handleSwipe(direction, pauseMs)
  }

  const card = CARDS[index]
  const progress = (index / CARDS.length) * 100

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
        padding: '20px 20px 100px',
        gap: 32,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase' }}>
          Fase 1 — Voorkeursprofiel
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-dim)' }}>
          Wat trekt jouw aandacht?
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          height: 2,
          background: 'var(--border)',
          borderRadius: 1,
        }}
      >
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 1 }}
        />
      </div>

      {/* Card area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          height: 300,
        }}
      >
        {/* Background card hint */}
        {index + 1 < CARDS.length && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              transform: 'scale(0.94) translateY(8px)',
              zIndex: 1,
            }}
          />
        )}

        {/* Current card */}
        <AnimatePresence mode="wait">
          {!exiting && (
            <DraggableCard
              key={index}
              card={card}
              onSwipe={handleSwipe}
            />
          )}
          {exiting && (
            <motion.div
              key={`exit-${index}`}
              initial={{ x: 0, opacity: 1 }}
              animate={{
                x: exiting === 'right' ? 400 : -400,
                opacity: 0,
                rotate: exiting === 'right' ? 20 : -20,
              }}
              transition={{ duration: 0.25 }}
              style={{ position: 'absolute', width: '100%', zIndex: 10 }}
            >
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '48px 40px',
                  textAlign: 'center',
                  minHeight: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 20,
                }}
              >
                <div style={{ fontSize: 80 }}>{card.emoji}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{card.category}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleButton('left')}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'transparent',
            border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </motion.button>

        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {index + 1} / {CARDS.length}
        </span>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleButton('right')}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'transparent',
            border: '1px solid var(--accent-green)',
            color: 'var(--accent-green)',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✓
        </motion.button>
      </div>
    </motion.div>
  )
}
