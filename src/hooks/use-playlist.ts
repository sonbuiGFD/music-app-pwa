import { useCallback } from "react";
import { useAudioStore } from "@/stores/audio-store";
import { Playlist, AudioTrack } from "@/types";
import { generateId } from "@/lib/utils";

export const usePlaylist = () => {
  const {
    playlists,
    tracks,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getPlaylistTracks,
  } = useAudioStore();

  const createPlaylist = useCallback(
    (name: string, description?: string, trackIds: string[] = []) => {
      const playlist: Omit<Playlist, "id" | "createdAt" | "updatedAt"> = {
        name,
        description,
        tracks: trackIds,
        isDefault: false,
      };

      addPlaylist(playlist);
    },
    [addPlaylist]
  );

  const editPlaylist = useCallback(
    (id: string, updates: Partial<Pick<Playlist, "name" | "description">>) => {
      updatePlaylist(id, updates);
    },
    [updatePlaylist]
  );

  const removePlaylist = useCallback(
    (id: string) => {
      deletePlaylist(id);
    },
    [deletePlaylist]
  );

  const addTrack = useCallback(
    (playlistId: string, trackId: string) => {
      addTrackToPlaylist(playlistId, trackId);
    },
    [addTrackToPlaylist]
  );

  const removeTrack = useCallback(
    (playlistId: string, trackId: string) => {
      removeTrackFromPlaylist(playlistId, trackId);
    },
    [removeTrackFromPlaylist]
  );

  const reorderTracks = useCallback(
    (playlistId: string, fromIndex: number, toIndex: number) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return;

      const newTracks = [...playlist.tracks];
      const [movedTrack] = newTracks.splice(fromIndex, 1);
      newTracks.splice(toIndex, 0, movedTrack);

      updatePlaylist(playlistId, { tracks: newTracks });
    },
    [playlists, updatePlaylist]
  );

  const getTracksForPlaylist = useCallback(
    (playlistId: string) => {
      return getPlaylistTracks(playlistId);
    },
    [getPlaylistTracks]
  );

  const getPlaylistById = useCallback(
    (id: string) => {
      return playlists.find((playlist) => playlist.id === id);
    },
    [playlists]
  );

  const getPlaylistByName = useCallback(
    (name: string) => {
      return playlists.find((playlist) => playlist.name === name);
    },
    [playlists]
  );

  const duplicatePlaylist = useCallback(
    (id: string, newName?: string) => {
      const playlist = getPlaylistById(id);
      if (!playlist) return;

      const duplicatedName = newName || `${playlist.name} (Copy)`;
      createPlaylist(duplicatedName, playlist.description, playlist.tracks);
    },
    [getPlaylistById, createPlaylist]
  );

  const clearPlaylist = useCallback(
    (id: string) => {
      updatePlaylist(id, { tracks: [] });
    },
    [updatePlaylist]
  );

  const getPlaylistStats = useCallback(
    (playlistId: string) => {
      const playlistTracks = getTracksForPlaylist(playlistId);
      const totalDuration = playlistTracks.reduce(
        (sum, track) => sum + track.duration,
        0
      );
      const totalTracks = playlistTracks.length;
      const averageRating =
        playlistTracks.length > 0
          ? playlistTracks.reduce(
              (sum, track) => sum + (track.rating || 0),
              0
            ) / playlistTracks.length
          : 0;

      return {
        totalTracks,
        totalDuration,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    },
    [getTracksForPlaylist]
  );

  const searchPlaylists = useCallback(
    (query: string) => {
      const searchLower = query.toLowerCase();
      return playlists.filter(
        (playlist) =>
          playlist.name.toLowerCase().includes(searchLower) ||
          playlist.description?.toLowerCase().includes(searchLower)
      );
    },
    [playlists]
  );

  const getPlaylistsByTrack = useCallback(
    (trackId: string) => {
      return playlists.filter((playlist) => playlist.tracks.includes(trackId));
    },
    [playlists]
  );

  const exportPlaylist = useCallback(
    (playlistId: string) => {
      const playlist = getPlaylistById(playlistId);
      if (!playlist) return null;

      const playlistTracks = getTracksForPlaylist(playlistId);

      return {
        playlist: {
          name: playlist.name,
          description: playlist.description,
          tracks: playlistTracks.map((track) => ({
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            url: track.url,
          })),
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          totalTracks: playlistTracks.length,
          totalDuration: playlistTracks.reduce(
            (sum, track) => sum + track.duration,
            0
          ),
        },
      };
    },
    [getPlaylistById, getTracksForPlaylist]
  );

  const importPlaylist = useCallback(
    (playlistData: {
      name: string;
      description?: string;
      tracks: Array<{
        title: string;
        artist: string;
        duration: number;
        url: string;
      }>;
    }) => {
      // Create tracks for the imported playlist
      const importedTracks: AudioTrack[] = playlistData.tracks.map(
        (trackData) => ({
          id: generateId(),
          title: trackData.title,
          artist: trackData.artist,
          duration: trackData.duration,
          url: trackData.url,
          metadata: {
            title: trackData.title,
            artist: trackData.artist,
            duration: trackData.duration,
          },
          tags: [],
          rating: 0,
          playCount: 0,
          dateAdded: new Date().toISOString(),
        })
      );

      // Add tracks to the store
      importedTracks.forEach((track) => {
        // This would need to be implemented in the store
        // addTrack(track);
      });

      // Create playlist with track IDs
      const trackIds = importedTracks.map((track) => track.id);
      createPlaylist(playlistData.name, playlistData.description, trackIds);
    },
    [createPlaylist]
  );

  return {
    // State
    playlists,
    tracks,

    // Actions
    createPlaylist,
    editPlaylist,
    removePlaylist,
    addTrack,
    removeTrack,
    reorderTracks,
    getTracksForPlaylist,
    getPlaylistById,
    getPlaylistByName,
    duplicatePlaylist,
    clearPlaylist,
    getPlaylistStats,
    searchPlaylists,
    getPlaylistsByTrack,
    exportPlaylist,
    importPlaylist,
  };
};
