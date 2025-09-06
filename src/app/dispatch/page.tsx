"use client";

import { useState, useEffect } from "react";
import { useAudioStore } from "@/stores/audio-store";
import { AudioTrack } from "@/types";
import { formatTime, formatFileSize } from "@/lib/utils";

export default function DispatchPage() {
  const { tracks } = useAudioStore();
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");

  const handleDispatchDownload = async () => {
    setIsLoading(true);
    setDownloadStatus("Dispatching download workflow...");

    try {
      // In a real implementation, this would trigger a GitHub Action
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setDownloadStatus(
        "Download workflow dispatched successfully! Check the GitHub Actions tab for progress."
      );
    } catch (error) {
      setDownloadStatus(
        "Failed to dispatch download workflow. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalDuration = () => {
    return tracks.reduce((total, track) => total + track.duration, 0);
  };

  const getTotalSize = () => {
    // Estimate file size based on duration (rough calculation)
    return tracks.reduce((total, track) => {
      // Assume average bitrate of 128kbps for MP3
      const estimatedSize = (track.duration * 128 * 1000) / 8; // Convert to bytes
      return total + estimatedSize;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Audio Download Dispatch</h1>
          <p className="text-muted-foreground">
            Download audio files from YouTube using GitHub Actions
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How to Download Audio</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <div>
                <p className="font-medium">Go to GitHub Actions</p>
                <p className="text-muted-foreground">
                  Navigate to the Actions tab in your GitHub repository
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <div>
                <p className="font-medium">Find the Download Audio workflow</p>
                <p className="text-muted-foreground">
                  Look for the "Download Audio" workflow in the list
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <div>
                <p className="font-medium">Run the workflow</p>
                <p className="text-muted-foreground">
                  Click "Run workflow" and enter the YouTube URL, format, and
                  quality
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                4
              </span>
              <div>
                <p className="font-medium">Wait for completion</p>
                <p className="text-muted-foreground">
                  The workflow will download the audio and update the repository
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Parameters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Download Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-2">YouTube URL</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2 border border-border rounded bg-background"
                disabled
              />
              <p className="text-muted-foreground mt-1">
                Enter the YouTube video URL
              </p>
            </div>

            <div>
              <label className="block font-medium mb-2">Audio Format</label>
              <select
                className="w-full p-2 border border-border rounded bg-background"
                disabled
              >
                <option value="mp3">MP3</option>
                <option value="m4a">M4A</option>
                <option value="wav">WAV</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Quality</label>
              <select
                className="w-full p-2 border border-border rounded bg-background"
                disabled
              >
                <option value="best">Best</option>
                <option value="320k">320k</option>
                <option value="256k">256k</option>
                <option value="192k">192k</option>
                <option value="128k">128k</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Custom Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Custom filename"
                className="w-full p-2 border border-border rounded bg-background"
                disabled
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> These parameters are configured in the
              GitHub Actions workflow. To change them, you need to modify the
              workflow file or use the manual dispatch feature.
            </p>
          </div>
        </div>

        {/* Current Collection Stats */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {tracks.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTime(getTotalDuration())}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Duration
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatFileSize(getTotalSize())}
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Size
              </div>
            </div>
          </div>
        </div>

        {/* Recent Downloads */}
        {tracks.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Downloads</h2>
            <div className="space-y-2">
              {tracks.slice(0, 5).map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                >
                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                    {track.thumbnail ? (
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full rounded object-cover"
                      />
                    ) : (
                      <span className="text-sm">🎵</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Back to Music Player
          </a>
        </div>
      </div>
    </div>
  );
}
