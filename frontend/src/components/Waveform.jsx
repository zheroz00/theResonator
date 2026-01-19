import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { FiPlay, FiPause } from 'react-icons/fi'

export function Waveform({ url, onReady }) {
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Destroy previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
    }

    // Create new instance with cyberpunk styling
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#00ffd5',
      progressColor: '#ff0066',
      cursorColor: '#9d4edd',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 1,
      height: 180,
      normalize: true,
      backend: 'WebAudio',
    })

    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish', () => setIsPlaying(false))
    ws.on('ready', () => onReady?.())

    if (url) {
      ws.load(url)
    }

    wavesurferRef.current = ws

    return () => {
      ws.destroy()
    }
  }, [url])

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause()
    }
  }

  return (
    <div className="waveform-container">
      <div ref={containerRef} className="waveform-canvas" onClick={togglePlayPause} />
      {!url && (
        <div className="waveform-placeholder">
          <span>NO SIGNAL</span>
        </div>
      )}
      {url && (
        <button className="play-btn" onClick={togglePlayPause} type="button">
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
      )}
      {isPlaying && <div className="playing-indicator">PLAYING</div>}
    </div>
  )
}
