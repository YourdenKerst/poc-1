# De Spiegel — AI Surveillance Demo

## Setup

```bash
cd de-spiegel
npm install
npm run setup-models   # download face-api model files
```

Maak een `.env` bestand aan:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Starten

```bash
npm run dev
# Open http://localhost:3000 in Chrome
```

## Vereisten

- **Chrome** (Web Speech API + MediaDevices)
- Camera en microfoon aanwezig en toegestaan
- Anthropic API key (zonder key werkt een fallback profiel)
