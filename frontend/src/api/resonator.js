import axios from 'axios'

// Use same origin - nginx will proxy to backend
const API_BASE = '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function generateMusic(prompt, duration = 15) {
  const response = await client.post('/generate', { prompt, duration })
  return response.data
}

export async function processMusic(filename) {
  const response = await client.post('/process', { filename })
  return response.data
}

export async function checkHealth() {
  const response = await client.get('/health')
  return response.data
}

export function getAudioUrl(filename) {
  return `/api/output/${filename}`
}

// Song library endpoints
export async function getSongs(limit = 100, offset = 0) {
  const response = await client.get('/songs', { params: { limit, offset } })
  return response.data
}

export async function updateSong(songId, updates) {
  const response = await client.patch(`/songs/${songId}`, updates)
  return response.data
}

export async function deleteSong(songId) {
  const response = await client.delete(`/songs/${songId}`)
  return response.data
}

// Hugging Face processing endpoints
export async function separateStems(filename) {
  const response = await client.post('/hf/separate-stems', { filename })
  return response.data
}

export async function denoiseAudio(filename) {
  const response = await client.post('/hf/denoise', { filename })
  return response.data
}

export async function checkHFModelStatus(task) {
  const response = await client.get(`/hf/status/${task}`)
  return response.data
}
