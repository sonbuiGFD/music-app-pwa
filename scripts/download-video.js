#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get command line arguments
const args = process.argv.slice(2);
let youtubeUrl = args[0];
const videoFormat = args[1] || "mp4";
const quality = args[2] || "best";
const customName = args[3];

// Decode URL to handle escaped characters
if (youtubeUrl) {
  try {
    youtubeUrl = decodeURIComponent(youtubeUrl);
  } catch (error) {
    console.warn("Warning: Could not decode URL, using as-is");
  }

  // Additional URL cleaning - remove any remaining backslashes that might cause issues
  youtubeUrl = youtubeUrl.replace(/\\/g, "");
}

if (!youtubeUrl) {
  console.error(
    "Usage: node download-video.js <youtube-url> [format] [quality] [custom-name]"
  );
  console.error("Formats: mp4, webm, mkv, avi");
  console.error("Quality: best, 4K, 1080p, 720p, 480p, 360p, worst");
  process.exit(1);
}

// Validate YouTube URL
if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
  console.error("Error: Please provide a valid YouTube URL");
  process.exit(1);
}

// Validate format
const validFormats = ["mp4", "webm", "mkv", "avi"];
if (!validFormats.includes(videoFormat)) {
  console.error(
    `Error: Invalid format. Must be one of: ${validFormats.join(", ")}`
  );
  process.exit(1);
}

// Validate quality
const validQualities = ["best", "4K", "1080p", "720p", "480p", "360p", "worst"];
if (!validQualities.includes(quality)) {
  console.error(
    `Error: Invalid quality. Must be one of: ${validQualities.join(", ")}`
  );
  process.exit(1);
}

// Ensure video directory exists
const videoDir = path.join(__dirname, "..", "public", "videos");
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

console.log("🎬 Music App PWA - Video Downloader");
console.log("====================================");
console.log(`Original URL: ${args[0]}`);
console.log(`Cleaned URL: ${youtubeUrl}`);
console.log(`Format: ${videoFormat}`);
console.log(`Quality: ${quality}`);
if (customName) {
  console.log(`Custom Name: ${customName}`);
}
console.log("");

try {
  // Build yt-dlp command
  let ytdlpCmd = "yt-dlp";

  // Add format options based on quality
  let formatOption = "";
  if (quality === "best") {
    formatOption = `--format "best[ext=${videoFormat}]"`;
  } else if (quality === "4K") {
    formatOption = `--format "best[height<=2160][ext=${videoFormat}]"`;
  } else if (quality === "1080p") {
    formatOption = `--format "best[height<=1080][ext=${videoFormat}]"`;
  } else if (quality === "720p") {
    formatOption = `--format "best[height<=720][ext=${videoFormat}]"`;
  } else if (quality === "480p") {
    formatOption = `--format "best[height<=480][ext=${videoFormat}]"`;
  } else if (quality === "360p") {
    formatOption = `--format "best[height<=360][ext=${videoFormat}]"`;
  } else if (quality === "worst") {
    formatOption = `--format "worst[ext=${videoFormat}]"`;
  }

  // Add output template - create folder for each video
  let outputTemplate = "";
  if (customName) {
    outputTemplate = `-o "${videoDir}/${customName}/%(title)s.%(ext)s"`;
  } else {
    outputTemplate = `-o "${videoDir}/%(title)s/%(title)s.%(ext)s"`;
  }

  // Add metadata and thumbnail options
  const metadataOptions =
    "--embed-metadata --embed-thumbnail --write-info-json --write-thumbnail";

  // Build full command
  const fullCommand = `${ytdlpCmd} ${formatOption} ${outputTemplate} ${metadataOptions} "${youtubeUrl}"`;

  console.log("Downloading video...");
  console.log(`Command: ${fullCommand}`);
  console.log("");

  // Execute download
  execSync(fullCommand, { stdio: "inherit" });

  // Process downloaded files
  console.log("Processing metadata...");

  // Find the video folder (most recently created)
  const folders = fs
    .readdirSync(videoDir)
    .filter((item) => {
      const itemPath = path.join(videoDir, item);
      return fs.statSync(itemPath).isDirectory();
    })
    .map((folder) => ({
      name: folder,
      path: path.join(videoDir, folder),
      mtime: fs.statSync(path.join(videoDir, folder)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (folders.length === 0) {
    throw new Error("No video folder found");
  }

  const videoFolder = folders[0];
  const videoFolderPath = videoFolder.path;

  // Find downloaded files in the video folder
  const files = fs.readdirSync(videoFolderPath);
  const videoFile = files.find(
    (file) =>
      file.endsWith(".mp4") ||
      file.endsWith(".webm") ||
      file.endsWith(".mkv") ||
      file.endsWith(".avi")
  );
  const infoFile = files.find((file) => file.endsWith(".info.json"));
  const thumbnailFile = files.find(
    (file) =>
      file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".webp")
  );

  if (!videoFile || !infoFile) {
    throw new Error("Failed to find downloaded files in video folder");
  }

  // Read info.json
  const infoPath = path.join(videoFolderPath, infoFile);
  const infoData = JSON.parse(fs.readFileSync(infoPath, "utf8"));

  // Extract metadata
  const title = infoData.title || "Unknown Title";
  const uploader = infoData.uploader || "Unknown Channel";
  const duration = infoData.duration || 0;
  const thumbnail = infoData.thumbnail || "";
  const viewCount = infoData.view_count || 0;
  const uploadDate = infoData.upload_date || "";
  const description = infoData.description || "";

  // Generate video ID
  const videoId = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);

  // Create video metadata
  const videoData = {
    id: videoId,
    title: title,
    channel: uploader,
    duration: duration,
    url: `/videos/${videoFolder.name}/${videoFile}`,
    thumbnail: thumbnail,
    metadata: {
      title: title,
      channel: uploader,
      duration: duration,
      thumbnail: thumbnail,
      uploader: uploader,
      description: description,
      viewCount: viewCount,
      uploadDate: uploadDate,
      format: videoFormat,
      quality: quality,
    },
    tags: [],
    rating: 0,
    playCount: 0,
    dateAdded: new Date().toISOString(),
  };

  // Save video metadata in the video folder
  const videoPath = path.join(videoFolderPath, `${videoId}.json`);
  fs.writeFileSync(videoPath, JSON.stringify(videoData, null, 2));

  // Rename thumbnail if it exists
  if (thumbnailFile) {
    const thumbnailExt = path.extname(thumbnailFile);
    const newThumbnailName = `${videoId}${thumbnailExt}`;
    const oldThumbnailPath = path.join(videoFolderPath, thumbnailFile);
    const newThumbnailPath = path.join(videoFolderPath, newThumbnailName);
    fs.renameSync(oldThumbnailPath, newThumbnailPath);
  }

  // Update video index
  updateVideoIndex(videoDir, videoData);

  // Update playlists
  updateVideoPlaylists(videoDir);

  // Clean up info.json
  fs.unlinkSync(infoPath);

  console.log("");
  console.log("✅ Download completed successfully!");
  console.log(`📁 Folder: ${videoFolder.name}`);
  console.log(`🎬 File: ${videoFile}`);
  console.log(`🎬 Title: ${title}`);
  console.log(`📺 Channel: ${uploader}`);
  console.log(`⏱️  Duration: ${formatDuration(duration)}`);
  console.log(`👀 Views: ${formatNumber(viewCount)}`);
  console.log(`📅 Upload Date: ${formatUploadDate(uploadDate)}`);
  console.log("");
  console.log("The video file has been added to your collection.");
} catch (error) {
  console.error("");
  console.error("❌ Download failed:");
  console.error(error.message);
  process.exit(1);
}

function updateVideoIndex(videoDir, videoData) {
  const indexPath = path.join(videoDir, "index.json");
  let indexData = { videos: [] };

  if (fs.existsSync(indexPath)) {
    indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  }

  // Check if video already exists
  const existingIndex = indexData.videos.findIndex(
    (video) => video.id === videoData.id
  );
  if (existingIndex >= 0) {
    indexData.videos[existingIndex] = videoData;
  } else {
    indexData.videos.push(videoData);
  }

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
}

function updateVideoPlaylists(videoDir) {
  const playlistsPath = path.join(videoDir, "playlists.json");
  let playlistsData = { playlists: [] };

  if (fs.existsSync(playlistsPath)) {
    playlistsData = JSON.parse(fs.readFileSync(playlistsPath, "utf8"));
  }

  // Update "All Videos" playlist
  const allVideosPlaylist = playlistsData.playlists.find(
    (p) => p.id === "all-videos"
  );
  if (allVideosPlaylist) {
    // Update existing playlist
    const indexData = JSON.parse(
      fs.readFileSync(path.join(videoDir, "index.json"), "utf8")
    );
    allVideosPlaylist.videos = indexData.videos.map((video) => video.id);
    allVideosPlaylist.updatedAt = new Date().toISOString();
  } else {
    // Create new "All Videos" playlist
    const indexData = JSON.parse(
      fs.readFileSync(path.join(videoDir, "index.json"), "utf8")
    );
    playlistsData.playlists.push({
      id: "all-videos",
      name: "All Videos",
      description: "All available video files",
      videos: indexData.videos.map((video) => video.id),
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

function formatNumber(num) {
  if (!num || num === 0) return "0";

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatUploadDate(dateString) {
  if (!dateString) return "Unknown";

  try {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  } catch (error) {
    return "Unknown";
  }
}
