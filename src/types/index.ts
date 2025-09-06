export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  thumbnail?: string;
  metadata: TrackMetadata;
  tags?: string[];
  rating?: number;
  playCount?: number;
  dateAdded?: string;
}

export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string;
  duration: number;
  thumbnail?: string;
  uploader?: string;
  description?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: string[]; // Array of track IDs
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface AudioPlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
  queue: AudioTrack[];
  currentIndex: number;
}

export type RepeatMode = "none" | "one" | "all";

export type PlaybackState = "playing" | "paused" | "stopped" | "loading";

export type AudioFormat = "mp3" | "m4a" | "wav" | "ogg";

export interface DownloadOptions {
  url: string;
  format: AudioFormat;
  quality: string;
  customName?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface StorageInfo {
  used: number;
  available: number;
  quota: number;
}

export interface FilterOptions {
  search: string;
  tags: string[];
  genre: string[];
  year: {
    min: number;
    max: number;
  };
  rating: {
    min: number;
    max: number;
  };
  sortBy: "title" | "artist" | "dateAdded" | "playCount" | "rating";
  sortOrder: "asc" | "desc";
}

export interface AudioStore {
  // State
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
  queue: AudioTrack[];
  currentIndex: number;
  playlists: Playlist[];
  tracks: AudioTrack[];
  filterOptions: FilterOptions;

  // Actions
  setCurrentTrack: (track: AudioTrack) => void;
  togglePlayPause: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setShuffleMode: (enabled: boolean) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: AudioTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setQueue: (tracks: AudioTrack[]) => void;
  setCurrentIndex: (index: number) => void;
  addPlaylist: (
    playlist: Omit<Playlist, "id" | "createdAt" | "updatedAt">
  ) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  setTracks: (tracks: AudioTrack[]) => void;
  addTrack: (track: AudioTrack) => void;
  updateTrack: (id: string, updates: Partial<AudioTrack>) => void;
  deleteTrack: (id: string) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  resetFilterOptions: () => void;

  // Computed values
  isCurrentTrack: (trackId: string) => boolean;
  getFilteredTracks: () => AudioTrack[];
  getPlaylistTracks: (playlistId: string) => AudioTrack[];
}
