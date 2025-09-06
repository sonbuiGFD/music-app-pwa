#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get command line arguments
const args = process.argv.slice(2);
const youtubeUrl = args[0];
const audioFormat = args[1] || "mp3";
const quality = args[2] || "best";
const customName = args[3];

if (!youtubeUrl) {
  console.error(
    "Usage: node download-audio.js <youtube-url> [format] [quality] [custom-name]"
  );
  console.error("Formats: mp3, m4a, wav");
  console.error("Quality: best, 320k, 256k, 192k, 128k");
  process.exit(1);
}

// Validate YouTube URL
if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
  console.error("Error: Please provide a valid YouTube URL");
  process.exit(1);
}

// Validate format
const validFormats = ["mp3", "m4a", "wav"];
if (!validFormats.includes(audioFormat)) {
  console.error(
    `Error: Invalid format. Must be one of: ${validFormats.join(", ")}`
  );
  process.exit(1);
}

// Validate quality
const validQualities = ["best", "320k", "256k", "192k", "128k"];
if (!validQualities.includes(quality)) {
  console.error(
    `Error: Invalid quality. Must be one of: ${validQualities.join(", ")}`
  );
  process.exit(1);
}

// Ensure audio directory exists
const audioDir = path.join(__dirname, "..", "public", "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

console.log("🎵 Music App PWA - Audio Downloader");
console.log("=====================================");
console.log(`URL: ${youtubeUrl}`);
console.log(`Format: ${audioFormat}`);
console.log(`Quality: ${quality}`);
if (customName) {
  console.log(`Custom Name: ${customName}`);
}
console.log("");

try {
  // Build yt-dlp command
  let ytdlpCmd = "yt-dlp";

  // Add format options
  let formatOption = "";
  if (audioFormat === "mp3") {
    formatOption = `--extract-audio --audio-format mp3 --audio-quality ${quality}`;
  } else if (audioFormat === "m4a") {
    formatOption = `--extract-audio --audio-format m4a --audio-quality ${quality}`;
  } else if (audioFormat === "wav") {
    formatOption = "--extract-audio --audio-format wav";
  }

  // Add output template
  let outputTemplate = "";
  if (customName) {
    outputTemplate = `-o "${audioDir}/${customName}.%(ext)s"`;
  } else {
    outputTemplate = `-o "${audioDir}/%(title)s.%(ext)s"`;
  }

  // Add metadata and thumbnail options
  const metadataOptions =
    "--embed-metadata --embed-thumbnail --write-info-json --write-thumbnail";

  // Build full command
  const fullCommand = `${ytdlpCmd} ${formatOption} ${outputTemplate} ${metadataOptions} "${youtubeUrl}"`;

  console.log("Downloading audio...");
  console.log(`Command: ${fullCommand}`);
  console.log("");

  // Execute download
  execSync(fullCommand, { stdio: "inherit" });

  // Process downloaded files
  console.log("Processing metadata...");

  // Find downloaded files
  const files = fs.readdirSync(audioDir);
  const audioFile = files.find(
    (file) =>
      file.endsWith(".mp3") || file.endsWith(".m4a") || file.endsWith(".wav")
  );
  const infoFile = files.find((file) => file.endsWith(".info.json"));
  const thumbnailFile = files.find(
    (file) =>
      file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".webp")
  );

  if (!audioFile || !infoFile) {
    throw new Error("Failed to find downloaded files");
  }

  // Read info.json
  const infoPath = path.join(audioDir, infoFile);
  const infoData = JSON.parse(fs.readFileSync(infoPath, "utf8"));

  // Extract metadata
  const title = infoData.title || "Unknown Title";
  const uploader = infoData.uploader || "Unknown Artist";
  const duration = infoData.duration || 0;
  const thumbnail = infoData.thumbnail || "";

  // Generate track ID
  const trackId = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);

  // Create track metadata
  const trackData = {
    id: trackId,
    title: title,
    artist: uploader,
    duration: duration,
    url: `/audio/${audioFile}`,
    thumbnail: thumbnail,
    metadata: {
      title: title,
      artist: uploader,
      duration: duration,
      thumbnail: thumbnail,
      uploader: uploader,
      description: infoData.description || "",
    },
    tags: [],
    rating: 0,
    playCount: 0,
    dateAdded: new Date().toISOString(),
  };

  // Save track metadata
  const trackPath = path.join(audioDir, `${trackId}.json`);
  fs.writeFileSync(trackPath, JSON.stringify(trackData, null, 2));

  // Rename thumbnail if it exists
  if (thumbnailFile) {
    const thumbnailExt = path.extname(thumbnailFile);
    const newThumbnailName = `${trackId}${thumbnailExt}`;
    const oldThumbnailPath = path.join(audioDir, thumbnailFile);
    const newThumbnailPath = path.join(audioDir, newThumbnailName);
    fs.renameSync(oldThumbnailPath, newThumbnailPath);
  }

  // Update audio index
  updateAudioIndex(audioDir, trackData);

  // Update playlists
  updatePlaylists(audioDir);

  // Clean up info.json
  fs.unlinkSync(infoPath);

  console.log("");
  console.log("✅ Download completed successfully!");
  console.log(`📁 File: ${audioFile}`);
  console.log(`🎵 Title: ${title}`);
  console.log(`👤 Artist: ${uploader}`);
  console.log(`⏱️  Duration: ${formatDuration(duration)}`);
  console.log("");
  console.log("The audio file has been added to your collection.");
} catch (error) {
  console.error("");
  console.error("❌ Download failed:");
  console.error(error.message);
  process.exit(1);
}

function updateAudioIndex(audioDir, trackData) {
  const indexPath = path.join(audioDir, "index.json");
  let indexData = { tracks: [] };

  if (fs.existsSync(indexPath)) {
    indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  }

  // Check if track already exists
  const existingIndex = indexData.tracks.findIndex(
    (track) => track.id === trackData.id
  );
  if (existingIndex >= 0) {
    indexData.tracks[existingIndex] = trackData;
  } else {
    indexData.tracks.push(trackData);
  }

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
}

function updatePlaylists(audioDir) {
  const playlistsPath = path.join(audioDir, "playlists.json");
  let playlistsData = { playlists: [] };

  if (fs.existsSync(playlistsPath)) {
    playlistsData = JSON.parse(fs.readFileSync(playlistsPath, "utf8"));
  }

  // Update "All Tracks" playlist
  const allTracksPlaylist = playlistsData.playlists.find(
    (p) => p.id === "all-tracks"
  );
  if (allTracksPlaylist) {
    // Update existing playlist
    const indexData = JSON.parse(
      fs.readFileSync(path.join(audioDir, "index.json"), "utf8")
    );
    allTracksPlaylist.tracks = indexData.tracks.map((track) => track.id);
    allTracksPlaylist.updatedAt = new Date().toISOString();
  } else {
    // Create new "All Tracks" playlist
    const indexData = JSON.parse(
      fs.readFileSync(path.join(audioDir, "index.json"), "utf8")
    );
    playlistsData.playlists.push({
      id: "all-tracks",
      name: "All Tracks",
      description: "All available audio tracks",
      tracks: indexData.tracks.map((track) => track.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true,
    });
  }

  fs.writeFileSync(playlistsPath, JSON.stringify(playlistsData, null, 2));
}

function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "0:00";

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
