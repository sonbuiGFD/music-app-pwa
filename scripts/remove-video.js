#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get command line arguments
const args = process.argv.slice(2);
const videoId = args[0];

if (!videoId) {
  console.error("Usage: node remove-video.js <video-id>");
  console.error(
    'Example: node remove-video.js "handcrafted_luxury_alligator_leather_watch_band_dr"'
  );
  process.exit(1);
}

const videoDir = path.join(__dirname, "..", "public", "videos");

console.log("🎬 Music App PWA - Video Remover");
console.log("=================================");
console.log(`Video ID: ${videoId}`);
console.log("");

try {
  // Check if video exists in index
  const indexPath = path.join(videoDir, "index.json");
  if (!fs.existsSync(indexPath)) {
    console.error("❌ Video index not found");
    process.exit(1);
  }

  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const videoIndex = indexData.videos.findIndex(
    (video) => video.id === videoId
  );

  if (videoIndex === -1) {
    console.error(`❌ Video not found: ${videoId}`);
    console.error("Available videos:");
    indexData.videos.forEach((video) => {
      console.error(`  - ${video.id}: ${video.title}`);
    });
    process.exit(1);
  }

  const video = indexData.videos[videoIndex];
  const videoFolderName = path.basename(path.dirname(video.url));
  const videoFolderPath = path.join(videoDir, videoFolderName);

  // Check if video folder exists
  if (!fs.existsSync(videoFolderPath)) {
    console.error(`❌ Video folder not found: ${videoFolderName}`);
    console.error(`   Expected path: ${videoFolderPath}`);
    process.exit(1);
  }

  // Find associated files in the video folder
  const associatedFiles = [];
  const files = fs.readdirSync(videoFolderPath);

  // Add all files in the video folder
  files.forEach((file) => {
    associatedFiles.push(file);
  });

  // Remove files
  let removedCount = 0;
  for (const file of associatedFiles) {
    const fullPath = path.join(videoFolderPath, file);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️  Removed: ${file}`);
      removedCount++;
    }
  }

  // Remove the video folder itself
  if (fs.existsSync(videoFolderPath)) {
    fs.rmdirSync(videoFolderPath);
    console.log(`🗑️  Removed folder: ${videoFolderName}`);
    removedCount++;
  }

  if (removedCount === 0) {
    console.log("⚠️  No files were removed");
    process.exit(1);
  }

  // Update video index
  updateVideoIndex(videoDir, videoId);

  // Update playlists
  updateVideoPlaylists(videoDir, videoId);

  console.log("");
  console.log(`✅ Successfully removed ${removedCount} file(s)`);
  console.log(
    `🎬 Video "${video.title}" has been removed from your collection.`
  );
} catch (error) {
  console.error("");
  console.error("❌ Removal failed:");
  console.error(error.message);
  process.exit(1);
}

function updateVideoIndex(videoDir, videoId) {
  const indexPath = path.join(videoDir, "index.json");

  if (!fs.existsSync(indexPath)) {
    console.log("⚠️  No video index found, skipping update");
    return;
  }

  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));

  // Find and remove video by ID
  const videoIndex = indexData.videos.findIndex(
    (video) => video.id === videoId
  );
  if (videoIndex >= 0) {
    indexData.videos.splice(videoIndex, 1);
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log("📝 Updated video index");
  } else {
    console.log("⚠️  Video not found in video index");
  }
}

function updateVideoPlaylists(videoDir, videoId) {
  const playlistsPath = path.join(videoDir, "playlists.json");

  if (!fs.existsSync(playlistsPath)) {
    console.log("⚠️  No playlists found, skipping update");
    return;
  }

  const playlistsData = JSON.parse(fs.readFileSync(playlistsPath, "utf8"));

  // Remove video from all playlists
  let updatedPlaylists = 0;
  for (const playlist of playlistsData.playlists) {
    const videoIndex = playlist.videos.indexOf(videoId);
    if (videoIndex >= 0) {
      playlist.videos.splice(videoIndex, 1);
      playlist.updatedAt = new Date().toISOString();
      updatedPlaylists++;
    }
  }

  if (updatedPlaylists > 0) {
    fs.writeFileSync(playlistsPath, JSON.stringify(playlistsData, null, 2));
    console.log(`📝 Updated ${updatedPlaylists} playlist(s)`);
  } else {
    console.log("⚠️  Video not found in any playlists");
  }
}
