import { createWriteStream, mkdirSync } from 'fs'
import https from 'https'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MODEL_DIR = path.join(__dirname, '..', 'public', 'models')

// Original face-api.js model weights — compatible with @vladmandic/face-api
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'

const FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
]

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = createWriteStream(dest)

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close()
        downloadFile(response.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        file.close()
        reject(new Error(`HTTP ${response.statusCode} for ${url}`))
        return
      }
      response.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', (err) => {
      file.close()
      reject(err)
    })
  })
}

async function main() {
  mkdirSync(MODEL_DIR, { recursive: true })

  for (const file of FILES) {
    const url = `${BASE_URL}/${file}`
    const dest = path.join(MODEL_DIR, file)
    process.stdout.write(`Downloading ${file}... `)
    try {
      await downloadFile(url, dest)
      console.log('done')
    } catch (err) {
      console.error(`FAILED: ${err.message}`)
    }
  }

  console.log('\nModellen gedownload naar public/models/')
  console.log('Start de app nu met: npm run dev')
}

main()
