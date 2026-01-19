import { useState, useCallback, useMemo } from 'react'
import {
  buildPromptFromMixer,
  randomizeMixer,
  DEFAULT_MIXER_STATE,
} from '../utils/promptBuilder'

export function usePromptMixer() {
  const [mixerState, setMixerState] = useState(DEFAULT_MIXER_STATE)

  const setFaderValue = useCallback((axis, value) => {
    setMixerState((prev) => ({
      ...prev,
      [axis]: value,
    }))
  }, [])

  const setGenre = useCallback((genre) => {
    setMixerState((prev) => ({
      ...prev,
      genre,
    }))
  }, [])

  const toggleElement = useCallback((element) => {
    setMixerState((prev) => ({
      ...prev,
      elements: prev.elements.includes(element)
        ? prev.elements.filter((e) => e !== element)
        : [...prev.elements, element],
    }))
  }, [])

  const randomize = useCallback(() => {
    setMixerState(randomizeMixer())
  }, [])

  const reset = useCallback(() => {
    setMixerState(DEFAULT_MIXER_STATE)
  }, [])

  const generatedPrompt = useMemo(
    () => buildPromptFromMixer(mixerState),
    [mixerState]
  )

  return {
    mixerState,
    setFaderValue,
    setGenre,
    toggleElement,
    randomize,
    reset,
    generatedPrompt,
  }
}
