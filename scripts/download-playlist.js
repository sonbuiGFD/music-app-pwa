#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get command line arguments
const args = process.argv.slice(2);
const playlistUrl = args[0];
const videoFormat = args[1] || "mp4";
const quality = args[2] || "720p";
const maxVideos = args[3] || "10";

if (!playlistUrl) {
  console.error(
    "Usage: node download-playlist.js <playlist-url> [format] [quality] [max-videos]"
  );
  console.error("Formats: mp4, webm, mkv, avi");
  console.error("Quality: best, 4K, 1080p, 720p, 480p, 360p, worst");
  console.error(
    "Max Videos: Maximum number of videos to download (default: 10)"
  );
  process.exit(1);
}

// Validate playlist URL
if (!playlistUrl.includes("youtube.com") && !playlistUrl.includes("youtu.be")) {
  console.error("Error: Please provide a valid YouTube playlist URL");
  process.exit(1);
}

// Validate max videos
const maxVideosNum = parseInt(maxVideos);
if (isNaN(maxVideosNum) || maxVideosNum < 1) {
  console.error("Error: Max videos must be a positive number");
  process.exit(1);
}

console.log("🎬 Music App PWA - Playlist Downloader");
console.log("======================================");
console.log(`Playlist URL: ${playlistUrl}`);
console.log(`Format: ${videoFormat}`);
console.log(`Quality: ${quality}`);
console.log(`Max Videos: ${maxVideosNum}`);
console.log("");

// Ensure video directory exists
const videoDir = path.join(__dirname, "..", "public", "videos");
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

try {
  // Build yt-dlp command for playlist
  let ytdlpCmd = "yt-dlp";

  // Add format options
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

  // Add output template
  const outputTemplate = `-o "${videoDir}/%(playlist_title)s/%(title)s.%(ext)s"`;

  // Add metadata and thumbnail options
  const metadataOptions =
    "--embed-metadata --embed-thumbnail --write-info-json --write-thumbnail";

  // Add playlist options
  const playlistOptions = `--playlist-end ${maxVideosNum} --yes-playlist`;

  // Build full command
  const fullCommand = `${ytdlpCmd} ${formatOption} ${outputTemplate} ${metadataOptions} ${playlistOptions} "${playlistUrl}"`;

  console.log("Downloading playlist...");
  console.log(`Command: ${fullCommand}`);
  console.log("");

  // Execute download
  execSync(fullCommand, { stdio: "inherit" });

  // Process downloaded files
  console.log("Processing playlist metadata...");

  // Find playlist folder (most recently created)
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
    throw new Error("No playlist folder found");
  }

  const playlistFolder = folders[0];
  const playlistFolderPath = playlistFolder.path;

  // Find downloaded files in the playlist folder
  const files = fs.readdirSync(playlistFolderPath);
  const videoFiles = files.filter(
    (file) =>
      file.endsWith(".mp4") ||
      file.endsWith(".webm") ||
      file.endsWith(".mkv") ||
      file.endsWith(".avi")
  );
  const infoFiles = files.filter((file) => file.endsWith(".info.json"));

  if (videoFiles.length === 0) {
    throw new Error("No videos were downloaded");
  }

  console.log(
    `Found ${videoFiles.length} video files in playlist: ${playlistFolder.name}`
  );

  // Process each video
  let processedCount = 0;
  for (const infoFile of infoFiles) {
    try {
      const infoPath = path.join(playlistFolderPath, infoFile);
      const infoData = JSON.parse(fs.readFileSync(infoPath, "utf8"));

      // Extract metadata
      const title = infoData.title || "Unknown Title";
      const uploader = infoData.uploader || "Unknown Channel";
      const duration = infoData.duration || 0;
      const thumbnail = infoData.thumbnail || "";
      const viewCount = infoData.view_count || 0;
      const uploadDate = infoData.upload_date || "";
      const description = infoData.description || "";
      const playlistTitle = infoData.playlist_title || "Unknown Playlist";

      // Generate video ID
      const videoId = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 50);

      // Find corresponding video file
      const videoFile = videoFiles.find((file) =>
        file.includes(title.replace(/[^a-zA-Z0-9\s-]/g, "").substring(0, 20))
      );

      if (!videoFile) {
        console.log(`Warning: Could not find video file for: ${title}`);
        continue;
      }

      // Create video metadata
      const videoData = {
        id: videoId,
        title: title,
        channel: uploader,
        duration: duration,
        url: `/videos/${playlistFolder.name}/${videoFile}`,
        thumbnail: thumbnail,
        playlist: playlistTitle,
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
          playlist: playlistTitle,
        },
        tags: [],
        rating: 0,
        playCount: 0,
        dateAdded: new Date().toISOString(),
      };

      // Save video metadata in the playlist folder
      const videoPath = path.join(playlistFolderPath, `${videoId}.json`);
      fs.writeFileSync(videoPath, JSON.stringify(videoData, null, 2));

      // Update video index
      updateVideoIndex(videoDir, videoData);

      processedCount++;
      console.log(`✓ Processed: ${title}`);
    } catch (error) {
      console.log(`✗ Error processing ${infoFile}: ${error.message}`);
    }
  }

  // Update playlists
  updateVideoPlaylists(videoDir);

  // Clean up info files
  infoFiles.forEach((infoFile) => {
    const infoPath = path.join(videoDir, infoFile);
    if (fs.existsSync(infoPath)) {
      fs.unlinkSync(infoPath);
    }
  });

  console.log("");
  console.log("✅ Playlist download completed successfully!");
  console.log(`📁 Videos saved to: ${videoDir}`);
  console.log(`📊 Total processed: ${processedCount} videos`);
  console.log("");
  console.log("The playlist videos have been added to your collection.");
} catch (error) {
  console.error("");
  console.error("❌ Playlist download failed:");
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
