// Shared emotion constants used across face detection, live panel, and reveal

export const EMOTION_EMOJI = {
  neutraal:    '😐',
  blij:        '😊',
  verdrietig:  '😢',
  boos:        '😠',
  angstig:     '😨',
  walging:     '🤢',
  verrast:     '😲',
}

export const EMOTION_COLOR = {
  neutraal:   '#555566',
  blij:       '#00ff88',
  verdrietig: '#4499ff',
  boos:       '#ff3333',
  angstig:    '#ff9900',
  walging:    '#aaff00',
  verrast:    '#cc66ff',
}

// Maps face-api English keys to Dutch labels
export const EMOTION_LABEL = {
  neutral:   'neutraal',
  happy:     'blij',
  sad:       'verdrietig',
  angry:     'boos',
  fearful:   'angstig',
  disgusted: 'walging',
  surprised: 'verrast',
}
