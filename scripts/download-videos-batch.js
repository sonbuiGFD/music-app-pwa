#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get command line arguments
const args = process.argv.slice(2);
const urlsFile = args[0];
const videoFormat = args[1] || "mp4";
const quality = args[2] || "720p";

if (!urlsFile) {
  console.error(
    "Usage: node download-videos-batch.js <urls-file> [format] [quality]"
  );
  console.error("Formats: mp4, webm, mkv, avi");
  console.error("Quality: best, 4K, 1080p, 720p, 480p, 360p, worst");
  console.error("");
  console.error("URLs file should contain one YouTube URL per line");
  process.exit(1);
}

// Check if URLs file exists
if (!fs.existsSync(urlsFile)) {
  console.error(`Error: URLs file '${urlsFile}' not found`);
  process.exit(1);
}

// Read URLs from file
const urls = fs
  .readFileSync(urlsFile, "utf8")
  .split("\n")
  .map((url) => url.trim())
  .filter((url) => url && !url.startsWith("#")); // Remove empty lines and comments

if (urls.length === 0) {
  console.error("Error: No valid URLs found in the file");
  process.exit(1);
}

console.log("🎬 Music App PWA - Batch Video Downloader");
console.log("==========================================");
console.log(`URLs File: ${urlsFile}`);
console.log(`Format: ${videoFormat}`);
console.log(`Quality: ${quality}`);
console.log(`Total URLs: ${urls.length}`);
console.log("");

// Ensure video directory exists
const videoDir = path.join(__dirname, "..", "public", "videos");
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// Create batch download script
const batchScript = createBatchScript(urls, videoFormat, quality, videoDir);

// Write batch script to temporary file
const batchFile = path.join(__dirname, "temp_batch_download.sh");
fs.writeFileSync(batchFile, batchScript);

try {
  console.log("Starting batch download...");
  console.log("");

  // Execute batch download
  execSync(`bash "${batchFile}"`, { stdio: "inherit" });

  console.log("");
  console.log("✅ Batch download completed successfully!");
  console.log(`📁 Videos saved to: ${videoDir}`);
  console.log(`📊 Total processed: ${urls.length} URLs`);
} catch (error) {
  console.error("");
  console.error("❌ Batch download failed:");
  console.error(error.message);
  process.exit(1);
} finally {
  // Clean up batch file
  if (fs.existsSync(batchFile)) {
    fs.unlinkSync(batchFile);
  }
}

function createBatchScript(urls, format, quality, outputDir) {
  let script = "#!/bin/bash\n";
  script += "set -e\n\n";
  script += `echo "Starting batch video download..."\n`;
  script += `echo "Format: ${format}"\n`;
  script += `echo "Quality: ${quality}"\n`;
  script += `echo "Output: ${outputDir}"\n\n`;

  urls.forEach((url, index) => {
    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      script += `echo "\\n[${index + 1}/${urls.length}] Processing: ${url}"\n`;
      script += `yt-dlp --format "best[height<=${getHeightForQuality(
        quality
      )}][ext=${format}]" `;
      script += `-o "${outputDir}/%(title)s/%(title)s.%(ext)s" `;
      script += `--embed-metadata --embed-thumbnail --write-info-json --write-thumbnail `;
      script += `"${url}" || echo "Failed to download: ${url}"\n`;
    } else {
      script += `echo "\\n[${index + 1}/${
        urls.length
      }] Skipping invalid URL: ${url}"\n`;
    }
  });

  script += `\necho "\\nBatch download completed!"\n`;
  return script;
}

function getHeightForQuality(quality) {
  const qualityMap = {
    "4K": 2160,
    "1080p": 1080,
    "720p": 720,
    "480p": 480,
    "360p": 360,
    worst: 240,
    best: 9999,
  };
  return qualityMap[quality] || 720;
}
