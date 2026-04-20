import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function CameraPreview({ stream }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (!stream) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 160,
        height: 120,
        borderRadius: 6,
        overflow: 'hidden',
        border: '1px solid var(--accent-red)',
        zIndex: 200,
        background: '#000',
        boxShadow: '0 0 20px rgba(255,51,51,0.2)',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
          display: 'block',
        }}
      />

      {/* REC badge */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(0,0,0,0.75)',
          padding: '2px 6px',
          borderRadius: 3,
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-red)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 9,
            color: 'var(--accent-red)',
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          REC
        </span>
      </div>

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 8,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 1,
        }}
      >
        LIVE CAMERA
      </div>
    </motion.div>
  )
}
