import { useEffect, useRef, useCallback } from "react";
import { useAudioStore } from "@/stores/audio-store";
import { AudioTrack, RepeatMode } from "@/types";
import {
  createAudioElement,
  normalizeVolume,
  normalizePlaybackRate,
} from "@/lib/audio-utils";

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentTrack,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    volume,
    playbackRate,
    repeatMode,
    shuffleMode,
    queue,
    currentIndex,
    setCurrentTrack,
    togglePlayPause,
    play,
    pause,
    stop,
    seek,
    setVolume,
    setPlaybackRate,
    setRepeatMode,
    setShuffleMode,
    nextTrack,
    previousTrack,
    setQueue,
    setCurrentIndex,
    updateTrack,
  } = useAudioStore();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = createAudioElement("");
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    const handleError = () => {
      console.error("Audio playback error");
      pause();
    };

    const handleCanPlay = () => {
      // Audio is ready to play
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();

      // Update play count
      updateTrack(currentTrack.id, {
        playCount: (currentTrack.playCount || 0) + 1,
      });
    }
  }, [currentTrack, updateTrack]);

  // Handle play/pause state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = normalizeVolume(volume);
    }
  }, [volume]);

  // Handle playback rate changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = normalizePlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  const setCurrentTime = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setDuration = useCallback((dur: number) => {
    // Duration is set via the store
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === "one") {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      // Move to next track
      nextTrack();
    }
  }, [repeatMode, nextTrack]);

  const playTrack = useCallback(
    (track: AudioTrack) => {
      setCurrentTrack(track);
      play();
    },
    [setCurrentTrack, play]
  );

  const playPlaylist = useCallback(
    (tracks: AudioTrack[], startIndex: number = 0) => {
      setQueue(tracks);
      setCurrentIndex(startIndex);
      setCurrentTrack(tracks[startIndex]);
      play();
    },
    [setQueue, setCurrentIndex, setCurrentTrack, play]
  );

  const handleSeek = useCallback(
    (time: number) => {
      setCurrentTime(time);
      seek(time);
    },
    [setCurrentTime, seek]
  );

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(normalizeVolume(newVolume));
    },
    [setVolume]
  );

  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      setPlaybackRate(normalizePlaybackRate(rate));
    },
    [setPlaybackRate]
  );

  const handleRepeatModeChange = useCallback(
    (mode: RepeatMode) => {
      setRepeatMode(mode);
    },
    [setRepeatMode]
  );

  const handleShuffleModeChange = useCallback(
    (enabled: boolean) => {
      setShuffleMode(enabled);
    },
    [setShuffleMode]
  );

  const handleNext = useCallback(() => {
    nextTrack();
  }, [nextTrack]);

  const handlePrevious = useCallback(() => {
    previousTrack();
  }, [previousTrack]);

  const handlePlayPause = useCallback(() => {
    togglePlayPause();
  }, [togglePlayPause]);

  const handleStop = useCallback(() => {
    stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [stop]);

  // Media Session API for background playback
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.metadata.album || "",
      artwork: currentTrack.thumbnail
        ? [
            { src: currentTrack.thumbnail, sizes: "96x96", type: "image/png" },
            {
              src: currentTrack.thumbnail,
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: currentTrack.thumbnail,
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: currentTrack.thumbnail,
              sizes: "256x256",
              type: "image/png",
            },
            {
              src: currentTrack.thumbnail,
              sizes: "384x384",
              type: "image/png",
            },
            {
              src: currentTrack.thumbnail,
              sizes: "512x512",
              type: "image/png",
            },
          ]
        : [],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      pause();
    });

    navigator.mediaSession.setActionHandler("stop", () => {
      handleStop();
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      handlePrevious();
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      handleNext();
    });

    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const skipTime = details.seekOffset || 10;
      const newTime = Math.max(0, currentTime - skipTime);
      handleSeek(newTime);
    });

    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const skipTime = details.seekOffset || 10;
      const newTime = Math.min(duration, currentTime + skipTime);
      handleSeek(newTime);
    });

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        handleSeek(details.seekTime);
      }
    });

    // Update playback state
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    handleStop,
    handlePrevious,
    handleNext,
    handleSeek,
  ]);

  return {
    // State
    currentTrack,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    volume,
    playbackRate,
    repeatMode,
    shuffleMode,
    queue,
    currentIndex,

    // Actions
    playTrack,
    playPlaylist,
    handlePlayPause,
    handleStop,
    handleSeek,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleRepeatModeChange,
    handleShuffleModeChange,
    handleNext,
    handlePrevious,
  };
};
