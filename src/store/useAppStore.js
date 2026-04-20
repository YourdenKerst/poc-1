import { create } from 'zustand'

export const PHASE = {
  START: 0,
  SWIPE: 1,
  QUIZ: 2,
  DILEMMAS: 3,
  ANALYSIS: 4,
  REVEAL: 5,
  CONTEXT: 6,
}

const initialData = {
  phase: PHASE.START,
  mediaStream: null,

  liveMetrics: {
    emotion: '—',
    volume: 0,
    pace: '—',
    pauseDuration: 0,
  },

  swipeCards: [],
  speechAnswers: [],
  dilemmaResponses: [],
  emotionHistory: [],
  cameraPeaks: [],

  profile: null,
}

export const useAppStore = create((set, get) => ({
  ...initialData,

  setPhase: (phase) => set({ phase }),

  setMediaStream: (stream) => set({ mediaStream: stream }),

  updateLiveMetrics: (metrics) =>
    set((state) => ({
      liveMetrics: { ...state.liveMetrics, ...metrics },
    })),

  addSwipeCard: (card) =>
    set((state) => ({ swipeCards: [...state.swipeCards, card] })),

  addSpeechAnswer: (answer) =>
    set((state) => ({ speechAnswers: [...state.speechAnswers, answer] })),

  addDilemmaResponse: (response) =>
    set((state) => ({
      dilemmaResponses: [...state.dilemmaResponses, response],
    })),

  addEmotionSnapshot: (emotion) =>
    set((state) => ({
      emotionHistory: [
        ...state.emotionHistory,
        { ts: Date.now(), emotion },
      ],
    })),

  addCameraPeak: (peak) =>
    set((state) => ({ cameraPeaks: [...state.cameraPeaks, peak] })),

  setProfile: (profile) => set({ profile }),

  reset: () => {
    const stream = get().mediaStream
    if (stream) stream.getTracks().forEach((t) => t.stop())
    set({ ...initialData })
  },
}))
