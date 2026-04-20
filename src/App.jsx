import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore, PHASE } from './store/useAppStore'
import { useFaceDetection } from './hooks/useFaceDetection'
import { useAudioAnalysis } from './hooks/useAudioAnalysis'
import { CameraPreview } from './components/CameraPreview'
import { LiveDataPanel } from './components/LiveDataPanel'
import Phase0Start from './components/phases/Phase0Start'
import Phase1A_Swipe from './components/phases/Phase1A_Swipe'
import Phase1B_Quiz from './components/phases/Phase1B_Quiz'
import Phase1C_Dilemmas from './components/phases/Phase1C_Dilemmas'
import Phase2_Analysis from './components/phases/Phase2_Analysis'
import Phase3_Reveal from './components/phases/Phase3_Reveal'
import Phase4_Context from './components/phases/Phase4_Context'

export default function App() {
  const { phase, mediaStream } = useAppStore()
  const videoRef = useRef(null)

  // Face detection and audio analysis run only during data-collection phases
  const isDataPhase = phase >= PHASE.SWIPE && phase <= PHASE.DILEMMAS

  // Derive audio-only stream for analysis (avoids passing full stream)
  const audioStream = mediaStream
    ? (() => {
        const s = new MediaStream()
        mediaStream.getAudioTracks().forEach((t) => s.addTrack(t))
        return s
      })()
    : null

  useFaceDetection(videoRef, isDataPhase)
  useAudioAnalysis(audioStream, isDataPhase)

  // Wire hidden video element to stream for face detection
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
    }
  }, [mediaStream])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--bg)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Hidden video used by face-api — display handled by CameraPreview */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />

      {/* Phase content with cross-fade transitions */}
      <AnimatePresence mode="wait">
        {phase === PHASE.START && <Phase0Start key="start" />}
        {phase === PHASE.SWIPE && <Phase1A_Swipe key="swipe" />}
        {phase === PHASE.QUIZ && <Phase1B_Quiz key="quiz" />}
        {phase === PHASE.DILEMMAS && <Phase1C_Dilemmas key="dilemmas" />}
        {phase === PHASE.ANALYSIS && <Phase2_Analysis key="analysis" />}
        {phase === PHASE.REVEAL && <Phase3_Reveal key="reveal" />}
        {phase === PHASE.CONTEXT && <Phase4_Context key="context" />}
      </AnimatePresence>

      {/* Overlays: only visible during data phases */}
      {isDataPhase && (
        <>
          <CameraPreview stream={mediaStream} />
          <LiveDataPanel />
        </>
      )}
    </div>
  )
}
