import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { EMOTION_LABEL } from '../utils/emotions'

let modelsLoaded = false
let faceapi = null

async function loadModels() {
  if (modelsLoaded && faceapi) return faceapi
  const fa = await import('@vladmandic/face-api')
  faceapi = fa
  await Promise.all([
    fa.nets.tinyFaceDetector.loadFromUri('/models'),
    fa.nets.faceExpressionNet.loadFromUri('/models'),
  ])
  modelsLoaded = true
  return faceapi
}

export function useFaceDetection(videoRef, active) {
  const intervalRef = useRef(null)
  const prevEmotionRef = useRef('neutraal')
  const addEmotionSnapshot = useAppStore((s) => s.addEmotionSnapshot)
  const addCameraPeak    = useAppStore((s) => s.addCameraPeak)
  const updateLiveMetrics = useAppStore((s) => s.updateLiveMetrics)

  const detect = useCallback(async (fa) => {
    const video = videoRef.current
    if (!video || video.paused || video.ended || video.readyState < 2) return

    try {
      const result = await fa
        .detectSingleFace(video, new fa.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.2 }))
        .withFaceExpressions()

      if (!result?.expressions) return

      const dominant = Object.entries(result.expressions)
        .sort(([, a], [, b]) => b - a)[0][0]

      const label = EMOTION_LABEL[dominant] || 'neutraal'

      addEmotionSnapshot(label)
      updateLiveMetrics({ emotion: label })

      if (label !== prevEmotionRef.current && label !== 'neutraal') {
        addCameraPeak(label)
        prevEmotionRef.current = label
      }
    } catch {
      // No face in frame — silently ignore
    }
  }, [videoRef, addEmotionSnapshot, updateLiveMetrics, addCameraPeak])

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    let mounted = true
    loadModels()
      .then((fa) => {
        if (!mounted) return
        intervalRef.current = setInterval(() => detect(fa), 600)
      })
      .catch((err) => console.warn('Face detection unavailable:', err.message))

    return () => {
      mounted = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, detect])
}
