#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const audioDir = path.join(__dirname, "..", "public", "audio");

console.log("🎵 Music App PWA - Playlist Updater");
console.log("====================================");
console.log("");

try {
  // Ensure audio directory exists
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Scan for audio files
  console.log("Scanning for audio files...");
  const files = fs.readdirSync(audioDir);
  const audioFiles = files.filter(
    (file) =>
      file.endsWith(".mp3") ||
      file.endsWith(".m4a") ||
      file.endsWith(".wav") ||
      file.endsWith(".ogg")
  );

  console.log(`Found ${audioFiles.length} audio file(s)`);

  // Load existing index
  const indexPath = path.join(audioDir, "index.json");
  let indexData = { tracks: [] };

  if (fs.existsSync(indexPath)) {
    indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    console.log(
      `Loaded existing index with ${indexData.tracks.length} track(s)`
    );
  }

  // Process each audio file
  const processedTracks = [];
  let newTracks = 0;
  let updatedTracks = 0;

  for (const audioFile of audioFiles) {
    const baseName = path.parse(audioFile).name;
    const metadataFile = path.join(audioDir, `${baseName}.json`);

    let trackData;

    if (fs.existsSync(metadataFile)) {
      // Load existing metadata
      trackData = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
      console.log(`📁 Found metadata for: ${trackData.title}`);
    } else {
      // Create new metadata from filename
      console.log(`📁 Creating metadata for: ${audioFile}`);
      trackData = createMetadataFromFilename(audioFile, audioDir);
      newTracks++;
    }

    // Update URL to ensure it's correct
    trackData.url = `/audio/${audioFile}`;

    // Save metadata file
    fs.writeFileSync(metadataFile, JSON.stringify(trackData, null, 2));
    processedTracks.push(trackData);
  }

  // Update audio index
  console.log("Updating audio index...");
  indexData.tracks = processedTracks;
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));

  // Update playlists
  console.log("Updating playlists...");
  updatePlaylists(audioDir, processedTracks);

  console.log("");
  console.log("✅ Playlist update completed successfully!");
  console.log(`📊 Processed ${processedTracks.length} track(s)`);
  console.log(`🆕 New tracks: ${newTracks}`);
  console.log(`🔄 Updated tracks: ${updatedTracks}`);
  console.log("");
  console.log(
    "Your playlists have been synchronized with the available audio files."
  );
} catch (error) {
  console.error("");
  console.error("❌ Playlist update failed:");
  console.error(error.message);
  process.exit(1);
}

function createMetadataFromFilename(filename, audioDir) {
  const baseName = path.parse(filename).name;
  const extension = path.parse(filename).ext.substring(1);

  // Try to parse title and artist from filename
  let title = baseName;
  let artist = "Unknown Artist";

  // Common patterns: "Artist - Title", "Title - Artist", "Artist_Title", etc.
  const patterns = [
    /^(.+?)\s*-\s*(.+)$/, // "Artist - Title"
    /^(.+?)\s*–\s*(.+)$/, // "Artist – Title" (en dash)
    /^(.+?)\s*—\s*(.+)$/, // "Artist — Title" (em dash)
    /^(.+?)_(.+)$/, // "Artist_Title"
  ];

  for (const pattern of patterns) {
    const match = baseName.match(pattern);
    if (match) {
      const [, part1, part2] = match;
      // Heuristic: shorter part is usually the artist
      if (part1.length < part2.length) {
        artist = part1.trim();
        title = part2.trim();
      } else {
        artist = part2.trim();
        title = part1.trim();
      }
      break;
    }
  }

  // Get file stats for duration estimation
  const filePath = path.join(audioDir, filename);
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;

  // Estimate duration based on file size and format
  let estimatedDuration = 0;
  if (extension === "mp3") {
    // Assume 128kbps for MP3
    estimatedDuration = (fileSize * 8) / (128 * 1000);
  } else if (extension === "m4a") {
    // Assume 128kbps for M4A
    estimatedDuration = (fileSize * 8) / (128 * 1000);
  } else if (extension === "wav") {
    // Assume 44.1kHz, 16-bit, stereo
    estimatedDuration = fileSize / (44100 * 2 * 2);
  }

  return {
    id: baseName,
    title: title,
    artist: artist,
    duration: Math.round(estimatedDuration),
    url: `/audio/${filename}`,
    thumbnail: null,
    metadata: {
      title: title,
      artist: artist,
      duration: Math.round(estimatedDuration),
      thumbnail: null,
      uploader: artist,
    },
    tags: [],
    rating: 0,
    playCount: 0,
    dateAdded: new Date().toISOString(),
  };
}

function updatePlaylists(audioDir, tracks) {
  const playlistsPath = path.join(audioDir, "playlists.json");
  let playlistsData = { playlists: [] };

  if (fs.existsSync(playlistsPath)) {
    playlistsData = JSON.parse(fs.readFileSync(playlistsPath, "utf8"));
  }

  // Update "All Tracks" playlist
  const allTracksPlaylist = playlistsData.playlists.find(
    (p) => p.id === "all-tracks"
  );
  const allTrackIds = tracks.map((track) => track.id);

  if (allTracksPlaylist) {
    // Update existing playlist
    allTracksPlaylist.tracks = allTrackIds;
    allTracksPlaylist.updatedAt = new Date().toISOString();
    console.log('🔄 Updated "All Tracks" playlist');
  } else {
    // Create new "All Tracks" playlist
    playlistsData.playlists.push({
      id: "all-tracks",
      name: "All Tracks",
      description: "All available audio tracks",
      tracks: allTrackIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true,
    });
    console.log('🆕 Created "All Tracks" playlist');
  }

  // Clean up playlists - remove tracks that no longer exist
  let cleanedPlaylists = 0;
  for (const playlist of playlistsData.playlists) {
    if (playlist.id !== "all-tracks") {
      const originalLength = playlist.tracks.length;
      playlist.tracks = playlist.tracks.filter((trackId) =>
        tracks.some((track) => track.id === trackId)
      );

      if (playlist.tracks.length !== originalLength) {
        playlist.updatedAt = new Date().toISOString();
        cleanedPlaylists++;
      }
    }
  }

  if (cleanedPlaylists > 0) {
    console.log(`🧹 Cleaned up ${cleanedPlaylists} playlist(s)`);
  }

  fs.writeFileSync(playlistsPath, JSON.stringify(playlistsData, null, 2));
}
