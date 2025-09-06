"use client";

import { useEffect, useState } from "react";
import { useAudioStore } from "@/stores/audio-store";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { usePWA } from "@/hooks/use-pwa";
import { AudioTrack } from "@/types";
import { formatTime } from "@/lib/utils";
import { ClientOnly } from "@/components/ClientOnly";

function HomePageContent() {
  const { tracks, getFilteredTracks } = useAudioStore();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    playTrack,
  } = useAudioPlayer();
  const { canInstall, install } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const filteredTracks = getFilteredTracks();

  useEffect(() => {
    // Show install prompt after a delay if PWA can be installed
    if (canInstall) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const handleTrackClick = (track: AudioTrack) => {
    playTrack(track);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    handleSeek(newTime);
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    handleVolumeChange(newVolume);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Install Prompt */}
      {showInstallPrompt && canInstall && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Install Music App</h3>
              <p className="text-sm opacity-90">
                Install this app for a better experience
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-1 text-sm bg-white/20 rounded hover:bg-white/30"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="px-3 py-1 text-sm bg-white text-primary rounded hover:bg-white/90"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Music App PWA</h1>
          <p className="text-muted-foreground">Your offline music collection</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Audio Player */}
        {currentTrack && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{currentTrack.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90"
                >
                  {isPlaying ? "⏸️" : "▶️"}
                </button>
              </div>

              {/* Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration > 0 ? (currentTime / duration) * 100 : 0}
                    onChange={handleProgressChange}
                    className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={handleVolumeSliderChange}
                  className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Track List */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">
            All Tracks ({filteredTracks.length})
          </h2>

          {filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No tracks found</p>
              <p className="text-sm">
                Use the dispatch page to download audio files from YouTube
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    currentTrack?.id === track.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      {track.thumbnail ? (
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-full h-full rounded object-cover"
                        />
                      ) : (
                        <span className="text-lg">🎵</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {formatTime(track.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="fixed bottom-4 right-4 flex gap-2">
          <a
            href="/dispatch"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Download Audio
          </a>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <HomePageContent />
    </ClientOnly>
  );
}
