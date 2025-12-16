'use client'

import * as React from 'react'
import { Slider } from '@/components/ui'

function formatTime (value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0:00'
  }

  const totalSeconds = Math.floor(value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const playbackRates = [0.75, 1, 1.25, 1.5]

export function StoryAudioDock ({ src, title }: { src: string, title: string }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [playbackRate, setPlaybackRate] = React.useState(1)

  const handleTogglePlay = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (audio.paused) {
      audio.play().catch((err) => {
        console.error(err)
      })
      return
    }

    audio.pause()
  }, [])

  const handleSeek = React.useCallback((value: number[]) => {
    const audio = audioRef.current
    const nextTime = value[0]

    if (!audio || typeof nextTime !== 'number' || !Number.isFinite(nextTime)) {
      return
    }

    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }, [])

  const handleCycleRate = React.useCallback(() => {
    const currentIndex = playbackRates.indexOf(playbackRate)
    const nextRate = playbackRates[(currentIndex + 1) % playbackRates.length] ?? 1

    setPlaybackRate(nextRate)
  }, [playbackRate])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    audio.playbackRate = playbackRate
  }, [playbackRate])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    // Keep dock state in sync with the underlying <audio> element.
    function handleLoadedMetadata () {
      setDuration(audio.duration || 0)
    }

    function handleTimeUpdate () {
      setCurrentTime(audio.currentTime || 0)
    }

    function handlePlay () {
      setIsPlaying(true)
    }

    function handlePause () {
      setIsPlaying(false)
    }

    function handleEnded () {
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [src])

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[90%] max-w-[600px] -translate-x-1/2">
      {/* R2 audio URL playback dock (only rendered when a Story has audioUrl). */}
      <div className="flex items-center justify-between rounded-[60px] bg-text-main px-5 py-2.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <audio ref={audioRef} src={src} preload="metadata" />

        <button
          type="button"
          onClick={handleTogglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-accent"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>

        <div className="mx-4 flex grow flex-col justify-center">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="mt-2">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 0}
              step={0.25}
              onValueChange={handleSeek}
              aria-label="Audio progress"
              className="h-2"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCycleRate}
          className="text-xs font-semibold text-white/70 hover:text-white"
          aria-label="Change playback speed"
        >
          {playbackRate.toFixed(2).replace(/\.00$/, '')}x
        </button>
      </div>
    </div>
  )
}
