#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get command line arguments
const args = process.argv.slice(2);
const filename = args[0];

if (!filename) {
  console.error("Usage: node remove-audio.js <filename>");
  console.error('Example: node remove-audio.js "song.mp3"');
  process.exit(1);
}

const audioDir = path.join(__dirname, "..", "public", "audio");

console.log("🎵 Music App PWA - Audio Remover");
console.log("=================================");
console.log(`File: ${filename}`);
console.log("");

try {
  // Check if file exists
  const filePath = path.join(audioDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filename}`);
    console.error(`   Expected path: ${filePath}`);
    process.exit(1);
  }

  // Find associated files
  const baseName = path.parse(filename).name;
  const associatedFiles = [
    filename, // The audio file itself
    `${baseName}.json`, // Metadata file
    `${baseName}.jpg`, // Thumbnail (jpg)
    `${baseName}.png`, // Thumbnail (png)
    `${baseName}.webp`, // Thumbnail (webp)
  ];

  // Remove files
  let removedCount = 0;
  for (const file of associatedFiles) {
    const fullPath = path.join(audioDir, file);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️  Removed: ${file}`);
      removedCount++;
    }
  }

  if (removedCount === 0) {
    console.log("⚠️  No files were removed");
    process.exit(1);
  }

  // Update audio index
  updateAudioIndex(audioDir, baseName);

  // Update playlists
  updatePlaylists(audioDir);

  console.log("");
  console.log(`✅ Successfully removed ${removedCount} file(s)`);
  console.log("The audio file has been removed from your collection.");
} catch (error) {
  console.error("");
  console.error("❌ Removal failed:");
  console.error(error.message);
  process.exit(1);
}

function updateAudioIndex(audioDir, baseName) {
  const indexPath = path.join(audioDir, "index.json");

  if (!fs.existsSync(indexPath)) {
    console.log("⚠️  No audio index found, skipping update");
    return;
  }

  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));

  // Find and remove track by base name (assuming it matches the track ID)
  const trackIndex = indexData.tracks.findIndex(
    (track) => track.id === baseName
  );
  if (trackIndex >= 0) {
    indexData.tracks.splice(trackIndex, 1);
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log("📝 Updated audio index");
  } else {
    console.log("⚠️  Track not found in audio index");
  }
}

function updatePlaylists(audioDir, baseName) {
  const playlistsPath = path.join(audioDir, "playlists.json");

  if (!fs.existsSync(playlistsPath)) {
    console.log("⚠️  No playlists found, skipping update");
    return;
  }

  const playlistsData = JSON.parse(fs.readFileSync(playlistsPath, "utf8"));

  // Remove track from all playlists
  let updatedPlaylists = 0;
  for (const playlist of playlistsData.playlists) {
    const trackIndex = playlist.tracks.indexOf(baseName);
    if (trackIndex >= 0) {
      playlist.tracks.splice(trackIndex, 1);
      playlist.updatedAt = new Date().toISOString();
      updatedPlaylists++;
    }
  }

  if (updatedPlaylists > 0) {
    fs.writeFileSync(playlistsPath, JSON.stringify(playlistsData, null, 2));
    console.log(`📝 Updated ${updatedPlaylists} playlist(s)`);
  } else {
    console.log("⚠️  Track not found in any playlists");
  }
}
