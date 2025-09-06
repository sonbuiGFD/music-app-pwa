import { AudioTrack, TrackMetadata, AudioFormat, Playlist } from "@/types";

export const SUPPORTED_AUDIO_FORMATS: AudioFormat[] = [
  "mp3",
  "m4a",
  "wav",
  "ogg",
];

export function createAudioTrack(
  url: string,
  metadata: TrackMetadata,
  id?: string
): AudioTrack {
  return {
    id: id || generateId(),
    title: metadata.title,
    artist: metadata.artist,
    duration: metadata.duration,
    url,
    thumbnail: metadata.thumbnail,
    metadata,
    tags: [],
    rating: 0,
    playCount: 0,
    dateAdded: new Date().toISOString(),
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function extractMetadataFromFileName(
  fileName: string
): Partial<TrackMetadata> {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

  // Try to parse common patterns like "Artist - Title" or "Title - Artist"
  const patterns = [
    /^(.+?)\s*-\s*(.+)$/, // "Artist - Title"
    /^(.+?)\s*–\s*(.+)$/, // "Artist – Title" (en dash)
    /^(.+?)\s*—\s*(.+)$/, // "Artist — Title" (em dash)
  ];

  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      const [, part1, part2] = match;
      // Heuristic: shorter part is usually the artist
      if (part1.length < part2.length) {
        return {
          title: part2.trim(),
          artist: part1.trim(),
        };
      } else {
        return {
          title: part1.trim(),
          artist: part2.trim(),
        };
      }
    }
  }

  // If no pattern matches, use the whole name as title
  return {
    title: nameWithoutExt,
    artist: "Unknown Artist",
  };
}

export function getAudioFileInfo(file: File): Promise<{
  duration: number;
  metadata: Partial<TrackMetadata>;
}> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve({
        duration: audio.duration,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          duration: audio.duration,
        },
      });
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load audio file"));
    });

    audio.src = url;
  });
}

export function validateAudioFile(file: File): boolean {
  if (!file.type.startsWith("audio/")) {
    return false;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension
    ? SUPPORTED_AUDIO_FORMATS.includes(extension as AudioFormat)
    : false;
}

export function getAudioFormatFromMimeType(
  mimeType: string
): AudioFormat | null {
  const mimeToFormat: Record<string, AudioFormat> = {
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/aac": "m4a",
    "audio/flac": "wav",
  };

  return mimeToFormat[mimeType] || null;
}

export function getAudioFormatFromFileName(
  fileName: string
): AudioFormat | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && SUPPORTED_AUDIO_FORMATS.includes(extension as AudioFormat)
    ? (extension as AudioFormat)
    : null;
}

export function createAudioElement(src: string): HTMLAudioElement {
  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.preload = "metadata";
  audio.src = src;
  return audio;
}

export function preloadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = createAudioElement(src);

    audio.addEventListener("canplaythrough", () => {
      resolve(audio);
    });

    audio.addEventListener("error", () => {
      reject(new Error(`Failed to preload audio: ${src}`));
    });

    audio.load();
  });
}

export function getAudioDuration(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = createAudioElement(src);

    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      reject(new Error(`Failed to get duration for: ${src}`));
    });

    audio.load();
  });
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function calculateProgress(
  currentTime: number,
  duration: number
): number {
  if (duration === 0) return 0;
  return Math.min(Math.max((currentTime / duration) * 100, 0), 100);
}

export function calculateTimeFromProgress(
  progress: number,
  duration: number
): number {
  return (progress / 100) * duration;
}

export function normalizeVolume(volume: number): number {
  return Math.min(Math.max(volume, 0), 1);
}

export function normalizePlaybackRate(rate: number): number {
  return Math.min(Math.max(rate, 0.25), 4);
}

export function getRandomTrackIndex(
  tracks: AudioTrack[],
  currentIndex: number
): number {
  if (tracks.length <= 1) return currentIndex;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * tracks.length);
  } while (randomIndex === currentIndex && tracks.length > 1);

  return randomIndex;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createPlaylistFromTracks(
  tracks: AudioTrack[],
  name: string,
  description?: string
): Omit<Playlist, "id" | "createdAt" | "updatedAt"> {
  return {
    name,
    description,
    tracks: tracks.map((track) => track.id),
    isDefault: false,
  };
}

export function filterTracksBySearch(
  tracks: AudioTrack[],
  search: string
): AudioTrack[] {
  if (!search.trim()) return tracks;

  const searchLower = search.toLowerCase();
  return tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchLower) ||
      track.artist.toLowerCase().includes(searchLower) ||
      track.metadata.album?.toLowerCase().includes(searchLower) ||
      track.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
  );
}

export function sortTracks(
  tracks: AudioTrack[],
  sortBy: "title" | "artist" | "dateAdded" | "playCount" | "rating",
  sortOrder: "asc" | "desc"
): AudioTrack[] {
  return [...tracks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "artist":
        aValue = a.artist.toLowerCase();
        bValue = b.artist.toLowerCase();
        break;
      case "dateAdded":
        aValue = new Date(a.dateAdded || 0).getTime();
        bValue = new Date(b.dateAdded || 0).getTime();
        break;
      case "playCount":
        aValue = a.playCount || 0;
        bValue = b.playCount || 0;
        break;
      case "rating":
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
}
