import { useAudioGeneration } from './hooks/useAudioGeneration'
import { PromptInput } from './components/PromptInput'
import { Waveform } from './components/Waveform'
import { Controls } from './components/Controls'
import { TrackList } from './components/TrackList'
import { StatusIndicator } from './components/StatusIndicator'

export default function App() {
  const {
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
  } = useAudioGeneration()

  // Determine which URL to display - processed if available, otherwise original
  const displayUrl = currentTrack?.processedUrl || currentTrack?.url

  // Count total favorites from all tracks (not filtered)
  const totalFavoriteCount = tracks.filter((t) => t.isFavorite).length

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">THE RESONATOR</h1>
        <span className="subtitle">GENERATIVE BASS ENGINE</span>
      </header>

      <main className="main">
        <aside className="sidebar">
          <TrackList
            tracks={filteredTracks}
            currentTrack={currentTrack}
            showFavoritesOnly={showFavoritesOnly}
            totalFavoriteCount={totalFavoriteCount}
            onToggleFavoritesFilter={toggleFavoritesFilter}
            onSelectTrack={selectTrack}
            onToggleFavorite={toggleFavorite}
            onRename={renameTrack}
            onDelete={deleteTrack}
          />
        </aside>

        <section className="workspace">
          <PromptInput onGenerate={generate} isGenerating={isGenerating} />

          <div className="visualizer">
            <Waveform url={displayUrl} />
            {currentTrack && (
              <div className="track-label">
                {currentTrack.processed ? 'TICKLED: ' : 'RAW: '}
                {currentTrack.customName || currentTrack.prompt}
              </div>
            )}
          </div>

          <Controls
            onApplyEffects={applyEffects}
            onSeparateStems={separateStems}
            onDenoise={denoiseTrack}
            isProcessing={isProcessing}
            isAIProcessing={isAIProcessing}
            canProcess={currentTrack && !currentTrack.processed}
            hasTrack={!!currentTrack}
          />

          <StatusIndicator
            isGenerating={isGenerating}
            isProcessing={isProcessing}
            isAIProcessing={isAIProcessing}
            error={error}
          />
        </section>
      </main>
    </div>
  )
}
