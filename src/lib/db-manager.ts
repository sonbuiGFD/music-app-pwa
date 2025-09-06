import { AudioTrack, Playlist, StorageInfo } from "@/types";

const DB_NAME = "MusicAppDB";
const DB_VERSION = 1;
const TRACKS_STORE = "tracks";
const PLAYLISTS_STORE = "playlists";
const SETTINGS_STORE = "settings";

export class DatabaseManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tracks store
        if (!db.objectStoreNames.contains(TRACKS_STORE)) {
          const tracksStore = db.createObjectStore(TRACKS_STORE, {
            keyPath: "id",
          });
          tracksStore.createIndex("title", "title", { unique: false });
          tracksStore.createIndex("artist", "artist", { unique: false });
          tracksStore.createIndex("dateAdded", "dateAdded", { unique: false });
        }

        // Create playlists store
        if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
          const playlistsStore = db.createObjectStore(PLAYLISTS_STORE, {
            keyPath: "id",
          });
          playlistsStore.createIndex("name", "name", { unique: false });
          playlistsStore.createIndex("createdAt", "createdAt", {
            unique: false,
          });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
        }
      };
    });
  }

  private getStore(
    storeName: string,
    mode: IDBTransactionMode = "readonly"
  ): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Tracks operations
  async saveTrack(track: AudioTrack): Promise<void> {
    const store = this.getStore(TRACKS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(track);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save track"));
    });
  }

  async getTrack(id: string): Promise<AudioTrack | null> {
    const store = this.getStore(TRACKS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to get track"));
    });
  }

  async getAllTracks(): Promise<AudioTrack[]> {
    const store = this.getStore(TRACKS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("Failed to get tracks"));
    });
  }

  async deleteTrack(id: string): Promise<void> {
    const store = this.getStore(TRACKS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to delete track"));
    });
  }

  async searchTracks(query: string): Promise<AudioTrack[]> {
    const store = this.getStore(TRACKS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const tracks = request.result || [];
        const filtered = tracks.filter(
          (track) =>
            track.title.toLowerCase().includes(query.toLowerCase()) ||
            track.artist.toLowerCase().includes(query.toLowerCase()) ||
            track.metadata.album?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      };
      request.onerror = () => reject(new Error("Failed to search tracks"));
    });
  }

  // Playlists operations
  async savePlaylist(playlist: Playlist): Promise<void> {
    const store = this.getStore(PLAYLISTS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(playlist);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save playlist"));
    });
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const store = this.getStore(PLAYLISTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to get playlist"));
    });
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    const store = this.getStore(PLAYLISTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("Failed to get playlists"));
    });
  }

  async deletePlaylist(id: string): Promise<void> {
    const store = this.getStore(PLAYLISTS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to delete playlist"));
    });
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    const store = this.getStore(SETTINGS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save setting"));
    });
  }

  async getSetting(key: string): Promise<any> {
    const store = this.getStore(SETTINGS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(new Error("Failed to get setting"));
    });
  }

  async deleteSetting(key: string): Promise<void> {
    const store = this.getStore(SETTINGS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to delete setting"));
    });
  }

  // Storage operations
  async getStorageInfo(): Promise<StorageInfo> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
        quota: estimate.quota || 0,
      };
    }

    return {
      used: 0,
      available: 0,
      quota: 0,
    };
  }

  async clearStorage(): Promise<void> {
    const store = this.getStore(TRACKS_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to clear storage"));
    });
  }

  async exportData(): Promise<{
    tracks: AudioTrack[];
    playlists: Playlist[];
    settings: Record<string, any>;
  }> {
    const [tracks, playlists] = await Promise.all([
      this.getAllTracks(),
      this.getAllPlaylists(),
    ]);

    // Get all settings
    const settings: Record<string, any> = {};
    const store = this.getStore(SETTINGS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const settingsData = request.result || [];
        settingsData.forEach((item) => {
          settings[item.key] = item.value;
        });

        resolve({
          tracks,
          playlists,
          settings,
        });
      };
      request.onerror = () => reject(new Error("Failed to export data"));
    });
  }

  async importData(data: {
    tracks: AudioTrack[];
    playlists: Playlist[];
    settings: Record<string, any>;
  }): Promise<void> {
    const { tracks, playlists, settings } = data;

    // Import tracks
    for (const track of tracks) {
      await this.saveTrack(track);
    }

    // Import playlists
    for (const playlist of playlists) {
      await this.savePlaylist(playlist);
    }

    // Import settings
    for (const [key, value] of Object.entries(settings)) {
      await this.saveSetting(key, value);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const dbManager = new DatabaseManager();
