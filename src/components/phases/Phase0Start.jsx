import { motion } from 'framer-motion'
import { useAppStore, PHASE } from '../../store/useAppStore'

export default function Phase0Start() {
  const { setPhase, setMediaStream } = useAppStore()

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      })
      setMediaStream(stream)
      setPhase(PHASE.SWIPE)
    } catch {
      alert(
        'Camera en microfoon toegang is vereist voor de installatie.\n\nGeef toegang in je browserinstellingen en probeer opnieuw.'
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '0 40px',
        position: 'relative',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,170,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,170,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          marginBottom: 12,
          color: 'var(--accent)',
          fontSize: 11,
          letterSpacing: 5,
          textTransform: 'uppercase',
        }}
      >
        [ SURVEILLANCE INSTALLATIE ]
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        De Spiegel
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          marginTop: 28,
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          lineHeight: 1.7,
          maxWidth: 480,
        }}
      >
        Doe een spelletje.
        <br />
        <span style={{ color: 'var(--accent-red)' }}>De AI kijkt mee.</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.4 }}
        style={{
          marginTop: 16,
          fontSize: 13,
          color: 'var(--text-dim)',
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        Terwijl jij een onschuldig spel speelt, analyseren we
        jouw gedrag, stem en gezichtsuitdrukking in realtime.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.7 }}
        whileHover={{ scale: 1.04, borderColor: 'var(--accent)', color: 'var(--accent)' }}
        whileTap={{ scale: 0.97 }}
        onClick={handleStart}
        style={{
          marginTop: 52,
          padding: '16px 56px',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 3,
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 4,
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
      >
        Start
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2 }}
        style={{ marginTop: 20, fontSize: 11, color: 'var(--text-dim)' }}
      >
        Camera & microfoon worden geactiveerd na klikken
      </motion.p>

      {/* Corner decorations */}
      {[
        { top: 20, left: 20 },
        { top: 20, right: 20 },
        { bottom: 20, left: 20 },
        { bottom: 20, right: 20 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          style={{
            position: 'absolute',
            ...pos,
            width: 20,
            height: 20,
            borderTop: pos.top !== undefined ? '1px solid var(--accent)' : 'none',
            borderBottom: pos.bottom !== undefined ? '1px solid var(--accent)' : 'none',
            borderLeft: pos.left !== undefined ? '1px solid var(--accent)' : 'none',
            borderRight: pos.right !== undefined ? '1px solid var(--accent)' : 'none',
          }}
        />
      ))}
    </motion.div>
  )
}
