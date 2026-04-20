import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Je bent een gedragspsycholoog die op basis van ruwe gedragssignalen een persoonlijk profiel opstelt.
Je ontvangt een JSON-object met gemeten gedragssignalen van een persoon die net een korte interactie heeft gehad.

Schrijf een profiel in het Nederlands met vier secties:
1. Persoonlijkheid (3 trefwoorden + 2 zinnen uitleg)
2. Emotioneel profiel (2–3 zinnen)
3. Gesimuleerd koopgedrag (2 zinnen)
4. Advertentieprofiel (doelgroep, beste moment, methode)

Toon is: direct, observerend, licht confronterend — maar nooit kwetsend of stigmatiserend.
Schrijf alsof je de persoon echt hebt zitten observeren. Gebruik de signaaldata als bewijs.
Verzin geen signalen die niet in de data staan.

Geef je response als geldig JSON in dit formaat:
{
  "persoonlijkheid": { "trefwoorden": ["...", "...", "..."], "uitleg": "..." },
  "emotioneel_profiel": "...",
  "koopgedrag": "...",
  "advertentieprofiel": { "doelgroep": "...", "beste_moment": "...", "methode": "..." }
}`

export async function generateProfile(sessionData) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is niet ingesteld in .env')

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(sessionData, null, 2),
      },
    ],
  })

  const text = message.content[0].text
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Ongeldige API response — geen JSON gevonden')
  return JSON.parse(match[0])
}

export function buildSessionData(swipeCards, speechAnswers, dilemmaResponses, emotionHistory, cameraPeaks) {
  const preferences = swipeCards.filter((c) => c.direction === 'right').map((c) => c.category)
  const twijfelkaarten = swipeCards.filter((c) => c.hesitated).map((c) => c.category)
  const avgPause =
    swipeCards.length > 0
      ? Math.round(swipeCards.reduce((a, c) => a + c.pauseMs, 0) / swipeCards.length)
      : 0

  const reactietijden = speechAnswers.map((a) => a.reactionTimeMs).filter(Boolean)
  const avgWps =
    speechAnswers.length > 0
      ? Math.round((speechAnswers.reduce((a, s) => a + (s.wps || 0), 0) / speechAnswers.length) * 10) / 10
      : 0
  const totalHesitations = speechAnswers.reduce((a, s) => a + (s.hesitations || 0), 0)
  const emotiesPerVraag = speechAnswers.map((a) => a.emotion || 'neutraal')

  const avgBeslissing =
    dilemmaResponses.length > 0
      ? Math.round(dilemmaResponses.reduce((a, d) => a + d.decisionTimeMs, 0) / dilemmaResponses.length)
      : 0
  const keuzes = dilemmaResponses.map((d) => d.choice)
  const veranderd = dilemmaResponses.filter((d) => d.changed).map((_, i) => `dilemma_${i + 1}`)

  const emotionCounts = {}
  emotionHistory.forEach(({ emotion }) => {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
  })
  const dominantEmotion =
    Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutraal'

  return {
    swipe_data: {
      gemiddelde_pauzeduur_ms: avgPause,
      twijfelkaarten,
      voorkeuren: preferences,
    },
    spraak_data: {
      gemiddeld_spreektempo_wps: avgWps,
      aarzelingen_totaal: totalHesitations,
      reactietijden_ms: reactietijden,
      dominante_emoties_per_vraag: emotiesPerVraag,
    },
    dilemma_data: {
      gemiddelde_beslissingstijd_ms: avgBeslissing,
      keuzes,
      van_mening_veranderd: veranderd,
    },
    camera_data: {
      dominante_emotie_sessie: dominantEmotion,
      emotie_pieken: cameraPeaks.slice(-5),
    },
  }
}
