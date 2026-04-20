import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, PHASE } from '../../store/useAppStore'

const QUESTIONS = [
  'Wat doe je als je je verveelt?',
  'Beschrijf je ideale weekend in één zin.',
  'Wat irriteert jou het meest aan andere mensen?',
  'Ben je iemand die snel beslissingen neemt?',
  'Wat zou je doen als je een dag onzichtbaar kon zijn?',
  'Hoe reageer je als iemand je bekritiseert?',
  'Wat is het laatste dat je kocht waar je blij van werd?',
  'Beschrijf jezelf in drie woorden.',
]

const HESITATION_WORDS = ['uh', 'uhm', 'eh', 'hmm', 'um', 'ah']

function countHesitations(text) {
  return HESITATION_WORDS.reduce((count, word) => {
    const m = text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g'))
    return count + (m ? m.length : 0)
  }, 0)
}

// ─── Waveform bars ──────────────────────────────────────────────────────────

const BAR_HEIGHTS = [6, 10, 16, 22, 18, 24, 18, 22, 16, 10, 6, 14]

function Waveform({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 32 }}>
      {BAR_HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          animate={active ? { height: [h * 0.3, h, h * 0.3] } : { height: 3 }}
          transition={
            active
              ? { duration: 0.5 + i * 0.04, repeat: Infinity, repeatType: 'mirror', delay: i * 0.05 }
              : { duration: 0.3 }
          }
          style={{ width: 3, background: 'var(--accent)', borderRadius: 2 }}
        />
      ))}
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Phase1B_Quiz() {
  // ── UI state (render-triggering) ──
  const [qIndex, setQIndex] = useState(0)
  const [uiPhase, setUiPhase] = useState('speaking') // 'speaking' | 'listening' | 'fallback'
  const [displayTranscript, setDisplayTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [fallbackText, setFallbackText] = useState('')

  // ── Stable refs (never cause stale closures) ──
  const qIndexRef = useRef(0)
  const transcriptRef = useRef('')        // accumulated final transcript
  const recognitionRef = useRef(null)     // active SpeechRecognition instance
  const autoTimerRef = useRef(null)       // auto-advance timer
  const listeningGuardRef = useRef(false) // prevent double startListening()
  const submittedRef = useRef(false)      // prevent double submitAnswer()
  const questionStartRef = useRef(null)   // timestamp when question appeared
  const listenStartRef = useRef(null)     // timestamp when listening began
  const ttsEndedRef = useRef(false)       // prevent double beginListening() from TTS

  const { addSpeechAnswer, setPhase, updateLiveMetrics, liveMetrics } = useAppStore()
  const emotionRef = useRef('neutraal')
  useEffect(() => { emotionRef.current = liveMetrics.emotion }, [liveMetrics.emotion])

  // ── Stop recognition cleanly (null out handlers first to prevent restart) ──
  const stopRecognition = () => {
    const r = recognitionRef.current
    if (r) {
      r.onresult = null
      r.onend = null
      r.onerror = null
      try { r.abort() } catch {}
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  const clearAutoTimer = () => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current)
      autoTimerRef.current = null
    }
  }

  // ── Submit current answer, advance to next question or exit ──
  // Reads from refs only — never stale
  const submitAnswer = () => {
    if (submittedRef.current) return
    submittedRef.current = true

    clearAutoTimer()
    stopRecognition()
    window.speechSynthesis?.cancel()

    const transcript = fallbackText || transcriptRef.current.trim()
    const reactionTimeMs =
      questionStartRef.current && listenStartRef.current
        ? Math.max(0, listenStartRef.current - questionStartRef.current)
        : 0
    const durationMs = listenStartRef.current ? Date.now() - listenStartRef.current : 0
    const words = transcript.split(/\s+/).filter(Boolean).length
    const wps = durationMs > 500 ? Math.round((words / (durationMs / 1000)) * 10) / 10 : 0

    addSpeechAnswer({
      question: QUESTIONS[qIndexRef.current],
      transcript,
      reactionTimeMs,
      wps,
      hesitations: countHesitations(transcript),
      emotion: emotionRef.current,
    })
    if (wps > 0) updateLiveMetrics({ pace: wps.toFixed(1) })

    const next = qIndexRef.current + 1
    if (next >= QUESTIONS.length) {
      setPhase(PHASE.DILEMMAS)
    } else {
      // Advance after short pause
      setTimeout(() => beginQuestion(next), 600)
    }
  }

  // ── Start speech recognition loop ──
  const startListening = () => {
    if (listeningGuardRef.current) return // already started
    listeningGuardRef.current = true

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setUiPhase('fallback')
      return
    }

    listenStartRef.current = Date.now()
    setUiPhase('listening')
    setIsListening(true)

    // Use non-continuous mode + restart on onend — gives natural phrase breaks
    // while staying open for longer answers
    const launch = () => {
      if (submittedRef.current) return

      const r = new SR()
      r.lang = 'nl-NL'
      r.continuous = false        // stops after natural pause → restart below
      r.interimResults = true
      r.maxAlternatives = 1
      recognitionRef.current = r

      r.onresult = (event) => {
        let finalChunk = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalChunk += event.results[i][0].transcript + ' '
          else interim += event.results[i][0].transcript
        }
        if (finalChunk) transcriptRef.current += finalChunk
        setDisplayTranscript(transcriptRef.current + interim)
      }

      r.onend = () => {
        // Restart only if still in listening mode and not submitted
        if (!submittedRef.current && listeningGuardRef.current) {
          setTimeout(launch, 80)
        } else {
          setIsListening(false)
        }
      }

      r.onerror = (e) => {
        if (e.error === 'aborted') return
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          stopRecognition()
          setUiPhase('fallback')
          return
        }
        // no-speech or network — just restart
        if (!submittedRef.current) setTimeout(launch, 300)
      }

      try { r.start() } catch { /* already started */ }
    }

    launch()

    // Auto-advance after 15 s of listening
    autoTimerRef.current = setTimeout(submitAnswer, 15000)
  }

  // ── Speak question then start listening (called once per question) ──
  const beginQuestion = (idx) => {
    // Reset per-question refs
    qIndexRef.current = idx
    transcriptRef.current = ''
    listeningGuardRef.current = false
    submittedRef.current = false
    ttsEndedRef.current = false
    listenStartRef.current = null
    questionStartRef.current = Date.now()

    // Update UI
    setQIndex(idx)
    setDisplayTranscript('')
    setFallbackText('')
    setUiPhase('speaking')

    if (!window.speechSynthesis) {
      startListening()
      return
    }

    window.speechSynthesis.cancel()

    // Guard: beginListening may only be called once even if both onend + fallback timer fire
    const beginListening = () => {
      if (ttsEndedRef.current) return
      ttsEndedRef.current = true
      startListening()
    }

    const utt = new SpeechSynthesisUtterance(QUESTIONS[idx])
    utt.lang = 'nl-NL'
    utt.rate = 0.9
    utt.pitch = 1
    utt.onend = beginListening
    utt.onerror = beginListening

    // Hard fallback: if TTS hangs (common on some browsers), start after 6 s
    const ttsFallbackTimer = setTimeout(beginListening, 6000)
    utt.onend = () => { clearTimeout(ttsFallbackTimer); beginListening() }
    utt.onerror = () => { clearTimeout(ttsFallbackTimer); beginListening() }

    window.speechSynthesis.speak(utt)
  }

  // ── Mount: start first question ──
  useEffect(() => {
    const t = setTimeout(() => beginQuestion(0), 600)
    return () => {
      clearTimeout(t)
      clearAutoTimer()
      stopRecognition()
      window.speechSynthesis?.cancel()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const progress = (qIndex / QUESTIONS.length) * 100

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
        gap: 24,
        maxWidth: 680,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase' }}>
          Fase 1B — Gesproken Quiz
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-dim)' }}>
          Antwoord hardop — de AI luistert
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 480, height: 2, background: 'var(--border)', borderRadius: 1 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 1 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          style={{
            width: '100%',
            maxWidth: 520,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '32px 36px',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, letterSpacing: 2 }}>
            VRAAG {qIndex + 1} / {QUESTIONS.length}
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.55, fontWeight: 500 }}>{QUESTIONS[qIndex]}</div>
        </motion.div>
      </AnimatePresence>

      {/* ── Listening UI ── */}
      {uiPhase === 'listening' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {/* Waveform */}
          <div
            style={{
              padding: '12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <motion.div
              animate={{ opacity: isListening ? [1, 0.3, 1] : 0.3 }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1 }}>
              {isListening ? 'LUISTEREN' : 'HERSTART...'}
            </span>
            <div style={{ flex: 1 }}>
              <Waveform active={isListening} />
            </div>
          </div>

          {/* Transcript box */}
          <div
            style={{
              minHeight: 68,
              padding: '12px 16px',
              background: 'rgba(0,170,255,0.05)',
              border: `1px solid ${displayTranscript ? 'rgba(0,170,255,0.25)' : 'var(--border)'}`,
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.65,
              color: displayTranscript ? 'var(--text)' : 'var(--text-dim)',
              transition: 'border-color 0.3s',
            }}
          >
            {displayTranscript || 'Spreek nu...'}
          </div>

          {/* Next button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={submitAnswer}
              style={{
                padding: '10px 28px',
                background: 'transparent',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: 4,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Volgende →
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── TTS speaking indicator ── */}
      {uiPhase === 'speaking' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1 }}>
            Vraag wordt voorgelezen...
          </span>
        </motion.div>
      )}

      {/* ── Fallback: text input ── */}
      {uiPhase === 'fallback' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            Spraakherkenning niet beschikbaar — typ je antwoord:
          </div>
          <textarea
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
            placeholder="Typ hier..."
            autoFocus
            style={{
              width: '100%',
              minHeight: 80,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              color: 'var(--text)',
              fontFamily: 'var(--font)',
              fontSize: 14,
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={submitAnswer}
              style={{
                padding: '10px 28px',
                background: 'transparent',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: 4,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Volgende →
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
