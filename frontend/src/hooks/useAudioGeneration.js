import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  generateMusic,
  processMusic,
  getAudioUrl,
  getSongs,
  updateSong,
  deleteSong,
  separateStems as apiSeparateStems,
  denoiseAudio as apiDenoiseAudio,
} from '../api/resonator'

// Transform backend song to frontend track format
function songToTrack(song) {
  return {
    id: song.id,
    prompt: song.prompt,
    duration: song.duration,
    filename: song.filename,
    url: getAudioUrl(song.filename),
    processed: !!song.processed_filename,
    processedFilename: song.processed_filename,
    processedUrl: song.processed_filename ? getAudioUrl(song.processed_filename) : null,
    customName: song.custom_name,
    isFavorite: song.is_favorite,
    createdAt: new Date(song.created_at),
  }
}

export function useAudioGeneration() {
  const [tracks, setTracks] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isAIProcessing, setIsAIProcessing] = useState(false)

  // Filtered tracks based on favorites toggle
  const filteredTracks = useMemo(() => {
    if (!showFavoritesOnly) return tracks
    return tracks.filter((t) => t.isFavorite)
  }, [tracks, showFavoritesOnly])

  const toggleFavoritesFilter = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev)
  }, [])

  // Load songs from backend on mount
  useEffect(() => {
    async function loadSongs() {
      try {
        const { songs } = await getSongs()
        const loadedTracks = songs.map(songToTrack)
        setTracks(loadedTracks)

        if (loadedTracks.length === 0) {
          console.info('Song library is empty')
        }
      } catch (err) {
        console.error('Failed to load songs:', err)
        const message = err.response?.data?.detail || err.message || 'Unknown error'
        setError(`Failed to load song library: ${message}. Try refreshing.`)
        // Still set empty tracks so UI is usable
        setTracks([])
      } finally {
        setIsLoading(false)
      }
    }
    loadSongs()
  }, [])

  const generate = useCallback(async (prompt, duration) => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateMusic(prompt, duration)

      // Reload songs to get the newly created one with proper ID
      const { songs } = await getSongs()
      const newTracks = songs.map(songToTrack)
      setTracks(newTracks)

      // Select the newest track
      const newTrack = newTracks[0]
      setCurrentTrack(newTrack)
      return newTrack
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const applyEffects = useCallback(async () => {
    if (!currentTrack) return

    setIsProcessing(true)
    setError(null)

    try {
      const result = await processMusic(currentTrack.filename)
      const updatedTrack = {
        ...currentTrack,
        processed: true,
        processedFilename: result.filename,
        processedUrl: getAudioUrl(result.filename),
      }

      setTracks((prev) =>
        prev.map((t) => (t.id === currentTrack.id ? updatedTrack : t))
      )
      setCurrentTrack(updatedTrack)
      return updatedTrack
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [currentTrack])

  const selectTrack = useCallback((track) => {
    setCurrentTrack(track)
  }, [])

  const toggleFavorite = useCallback(async (track) => {
    try {
      const updated = await updateSong(track.id, {
        is_favorite: !track.isFavorite,
      })
      const updatedTrack = songToTrack(updated)
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? updatedTrack : t))
      )
      if (currentTrack?.id === track.id) {
        setCurrentTrack(updatedTrack)
      }
    } catch (err) {
      setError('Failed to update favorite status')
    }
  }, [currentTrack])

  const renameTrack = useCallback(async (track, newName) => {
    try {
      const updated = await updateSong(track.id, { custom_name: newName })
      const updatedTrack = songToTrack(updated)
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? updatedTrack : t))
      )
      if (currentTrack?.id === track.id) {
        setCurrentTrack(updatedTrack)
      }
    } catch (err) {
      setError('Failed to rename track')
    }
  }, [currentTrack])

  const deleteTrack = useCallback(async (track) => {
    try {
      await deleteSong(track.id)
      setTracks((prev) => prev.filter((t) => t.id !== track.id))
      if (currentTrack?.id === track.id) {
        setCurrentTrack(null)
      }
    } catch (err) {
      setError('Failed to delete track')
    }
  }, [currentTrack])

  const separateStems = useCallback(async () => {
    if (!currentTrack) return

    setIsAIProcessing(true)
    setError(null)

    try {
      const result = await apiSeparateStems(currentTrack.filename)
      // Stems are saved as separate files - just show success message
      // In a future enhancement, we could create track entries for each stem
      setError(`Stems created: ${Object.keys(result.stems).join(', ')}`)
    } catch (err) {
      const message = err.response?.data?.detail || err.message
      setError(`Stem separation failed: ${message}`)
    } finally {
      setIsAIProcessing(false)
    }
  }, [currentTrack])

  const denoiseTrack = useCallback(async () => {
    if (!currentTrack) return

    setIsAIProcessing(true)
    setError(null)

    try {
      const result = await apiDenoiseAudio(currentTrack.filename)
      setError(`Denoised audio saved: ${result.filename}`)
    } catch (err) {
      const message = err.response?.data?.detail || err.message
      setError(`Denoising failed: ${message}`)
    } finally {
      setIsAIProcessing(false)
    }
  }, [currentTrack])

  return {
    tracks,
    filteredTracks,
    currentTrack,
    isGenerating,
    isProcessing,
    isAIProcessing,
    isLoading,
    error,
    showFavoritesOnly,
    generate,
    applyEffects,
    selectTrack,
    toggleFavorite,
    toggleFavoritesFilter,
    renameTrack,
    deleteTrack,
    separateStems,
    denoiseTrack,
  }
}
