import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AudioStore,
  AudioTrack,
  Playlist,
  FilterOptions,
  RepeatMode,
} from "@/types";
import { filterTracksBySearch, sortTracks } from "@/lib/audio-utils";

const defaultFilterOptions: FilterOptions = {
  search: "",
  tags: [],
  genre: [],
  year: { min: 1900, max: new Date().getFullYear() },
  rating: { min: 0, max: 5 },
  sortBy: "title",
  sortOrder: "asc",
};

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      // State
      currentTrack: null,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playbackRate: 1,
      repeatMode: "none",
      shuffleMode: false,
      queue: [],
      currentIndex: 0,
      playlists: [],
      tracks: [],
      filterOptions: defaultFilterOptions,

      // Audio player actions
      setCurrentTrack: (track) => set({ currentTrack: track }),

      togglePlayPause: () =>
        set((state) => ({
          isPlaying: !state.isPlaying,
          isPaused: state.isPlaying,
        })),

      play: () => set({ isPlaying: true, isPaused: false }),

      pause: () => set({ isPlaying: false, isPaused: true }),

      stop: () =>
        set({
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
        }),

      seek: (time) => set({ currentTime: time }),

      setVolume: (volume) => set({ volume: Math.min(Math.max(volume, 0), 1) }),

      setPlaybackRate: (rate) =>
        set({ playbackRate: Math.min(Math.max(rate, 0.25), 4) }),

      setRepeatMode: (mode) => set({ repeatMode: mode }),

      setShuffleMode: (enabled) => set({ shuffleMode: enabled }),

      // Queue management
      nextTrack: () => {
        const { queue, currentIndex, shuffleMode, repeatMode } = get();
        if (queue.length === 0) return;

        let nextIndex = currentIndex + 1;

        if (shuffleMode) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else if (nextIndex >= queue.length) {
          if (repeatMode === "all") {
            nextIndex = 0;
          } else {
            return; // No more tracks
          }
        }

        set({
          currentIndex: nextIndex,
          currentTrack: queue[nextIndex],
          currentTime: 0,
        });
      },

      previousTrack: () => {
        const { queue, currentIndex, shuffleMode, repeatMode } = get();
        if (queue.length === 0) return;

        let prevIndex = currentIndex - 1;

        if (shuffleMode) {
          prevIndex = Math.floor(Math.random() * queue.length);
        } else if (prevIndex < 0) {
          if (repeatMode === "all") {
            prevIndex = queue.length - 1;
          } else {
            return; // No previous track
          }
        }

        set({
          currentIndex: prevIndex,
          currentTrack: queue[prevIndex],
          currentTime: 0,
        });
      },

      addToQueue: (track) =>
        set((state) => ({
          queue: [...state.queue, track],
        })),

      removeFromQueue: (index) =>
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          const newIndex =
            index < state.currentIndex
              ? state.currentIndex - 1
              : state.currentIndex;

          return {
            queue: newQueue,
            currentIndex: newIndex,
            currentTrack: newQueue[newIndex] || null,
          };
        }),

      clearQueue: () =>
        set({
          queue: [],
          currentIndex: 0,
          currentTrack: null,
          isPlaying: false,
          isPaused: false,
        }),

      setQueue: (tracks) =>
        set({
          queue: tracks,
          currentIndex: 0,
          currentTrack: tracks[0] || null,
        }),

      setCurrentIndex: (index) =>
        set((state) => ({
          currentIndex: index,
          currentTrack: state.queue[index] || null,
          currentTime: 0,
        })),

      // Playlist management
      addPlaylist: (playlistData) => {
        const playlist: Playlist = {
          ...playlistData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          playlists: [...state.playlists, playlist],
        }));
      },

      updatePlaylist: (id, updates) =>
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === id
              ? { ...playlist, ...updates, updatedAt: new Date().toISOString() }
              : playlist
          ),
        })),

      deletePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((playlist) => playlist.id !== id),
        })),

      addTrackToPlaylist: (playlistId, trackId) =>
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  tracks: playlist.tracks.includes(trackId)
                    ? playlist.tracks
                    : [...playlist.tracks, trackId],
                  updatedAt: new Date().toISOString(),
                }
              : playlist
          ),
        })),

      removeTrackFromPlaylist: (playlistId, trackId) =>
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  tracks: playlist.tracks.filter((id) => id !== trackId),
                  updatedAt: new Date().toISOString(),
                }
              : playlist
          ),
        })),

      // Track management
      setTracks: (tracks) => set({ tracks }),

      addTrack: (track) =>
        set((state) => ({
          tracks: [...state.tracks, track],
        })),

      updateTrack: (id, updates) =>
        set((state) => ({
          tracks: state.tracks.map((track) =>
            track.id === id ? { ...track, ...updates } : track
          ),
        })),

      deleteTrack: (id) =>
        set((state) => ({
          tracks: state.tracks.filter((track) => track.id !== id),
          queue: state.queue.filter((track) => track.id !== id),
          currentTrack:
            state.currentTrack?.id === id ? null : state.currentTrack,
        })),

      // Filter management
      setFilterOptions: (options) =>
        set((state) => ({
          filterOptions: { ...state.filterOptions, ...options },
        })),

      resetFilterOptions: () => set({ filterOptions: defaultFilterOptions }),

      // Computed values
      isCurrentTrack: (trackId) => {
        const { currentTrack } = get();
        return currentTrack?.id === trackId;
      },

      getFilteredTracks: () => {
        const { tracks, filterOptions } = get();
        let filtered = tracks;

        // Apply search filter
        if (filterOptions.search) {
          filtered = filterTracksBySearch(filtered, filterOptions.search);
        }

        // Apply tag filter
        if (filterOptions.tags.length > 0) {
          filtered = filtered.filter((track) =>
            track.tags?.some((tag) => filterOptions.tags.includes(tag))
          );
        }

        // Apply genre filter
        if (filterOptions.genre.length > 0) {
          filtered = filtered.filter(
            (track) =>
              track.metadata.genre &&
              filterOptions.genre.includes(track.metadata.genre)
          );
        }

        // Apply year filter
        if (
          filterOptions.year.min > 1900 ||
          filterOptions.year.max < new Date().getFullYear()
        ) {
          filtered = filtered.filter((track) => {
            const year = track.metadata.year || new Date().getFullYear();
            return (
              year >= filterOptions.year.min && year <= filterOptions.year.max
            );
          });
        }

        // Apply rating filter
        if (filterOptions.rating.min > 0 || filterOptions.rating.max < 5) {
          filtered = filtered.filter((track) => {
            const rating = track.rating || 0;
            return (
              rating >= filterOptions.rating.min &&
              rating <= filterOptions.rating.max
            );
          });
        }

        // Apply sorting
        return sortTracks(
          filtered,
          filterOptions.sortBy,
          filterOptions.sortOrder
        );
      },

      getPlaylistTracks: (playlistId) => {
        const { playlists, tracks } = get();
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return [];

        return tracks.filter((track) => playlist.tracks.includes(track.id));
      },
    }),
    {
      name: "audio-store",
      partialize: (state) => ({
        volume: state.volume,
        repeatMode: state.repeatMode,
        shuffleMode: state.shuffleMode,
        playlists: state.playlists,
        tracks: state.tracks,
        filterOptions: state.filterOptions,
      }),
    }
  )
);

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
