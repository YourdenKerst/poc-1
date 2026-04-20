import { useRef, useCallback, useState } from 'react'

export function useSpeechRecognition() {
  const recognitionRef = useRef(null)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  )

  const start = useCallback(() => {
    if (!isSupported) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'nl-NL'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) final += r[0].transcript + ' '
        else interim += r[0].transcript
      }
      if (final) setFinalTranscript((prev) => prev + final)
      setInterimTranscript(interim)
    }

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }
    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        console.warn('Speech recognition error:', e.error)
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const reset = useCallback(() => {
    stop()
    setFinalTranscript('')
    setInterimTranscript('')
  }, [stop])

  return {
    finalTranscript,
    interimTranscript,
    isListening,
    isSupported,
    start,
    stop,
    reset,
  }
}
