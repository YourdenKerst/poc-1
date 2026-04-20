import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useAudioAnalysis(audioStream, active) {
  const rafRef = useRef(null)
  const updateLiveMetrics = useAppStore((s) => s.updateLiveMetrics)

  useEffect(() => {
    if (!active || !audioStream) return

    let ctx
    try {
      ctx = new AudioContext()
    } catch {
      return
    }

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    const source = ctx.createMediaStreamSource(audioStream)
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(data)
      const rms = Math.sqrt(
        data.reduce((acc, v) => acc + v * v, 0) / data.length
      )
      const volume = Math.min(100, Math.round((rms / 128) * 100))
      updateLiveMetrics({ volume })
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      source.disconnect()
      ctx.close().catch(() => {})
    }
  }, [active, audioStream, updateLiveMetrics])
}
