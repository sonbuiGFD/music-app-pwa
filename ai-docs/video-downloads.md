# Video Download Scripts

This directory contains scripts for downloading videos from YouTube for the Music App PWA.

## Available Scripts

### 1. `download-video.js` - Single Video Download

Downloads a single video from YouTube with customizable format and quality.

**Usage:**

```bash
npm run download-video <youtube-url> [format] [quality] [custom-name]
# or
node scripts/download-video.js <youtube-url> [format] [quality] [custom-name]
```

**Parameters:**

- `youtube-url` (required): YouTube video URL
- `format` (optional): Video format - mp4, webm, mkv, avi (default: mp4)
- `quality` (optional): Video quality - best, 4K, 1080p, 720p, 480p, 360p, worst (default: best)
- `custom-name` (optional): Custom filename (without extension)

**Examples:**

```bash
# Download in MP4 format at 720p quality
npm run download-video "https://www.youtube.com/watch?v=dQw4w9WgXcQ" mp4 720p

# Download with custom name
npm run download-video "https://www.youtube.com/watch?v=dQw4w9WgXcQ" mp4 1080p "my-video"

# Download best quality available
npm run download-video "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

### 2. `download-videos-batch.js` - Batch Download

Downloads multiple videos from a list of URLs in a text file.

**Usage:**

```bash
npm run download-videos-batch <urls-file> [format] [quality]
# or
node scripts/download-videos-batch.js <urls-file> [format] [quality]
```

**Parameters:**

- `urls-file` (required): Text file containing YouTube URLs (one per line)
- `format` (optional): Video format - mp4, webm, mkv, avi (default: mp4)
- `quality` (optional): Video quality - best, 4K, 1080p, 720p, 480p, 360p, worst (default: 720p)

**URLs File Format:**

```
https://www.youtube.com/watch?v=video1
https://www.youtube.com/watch?v=video2
# This is a comment and will be ignored
https://www.youtube.com/watch?v=video3
```

**Example:**

```bash
# Create a URLs file
echo "https://www.youtube.com/watch?v=dQw4w9WgXcQ" > urls.txt
echo "https://www.youtube.com/watch?v=another-video" >> urls.txt

# Download all videos
npm run download-videos-batch urls.txt mp4 720p
```

### 3. `download-playlist.js` - Playlist Download

Downloads videos from a YouTube playlist.

**Usage:**

```bash
npm run download-playlist <playlist-url> [format] [quality] [max-videos]
# or
node scripts/download-playlist.js <playlist-url> [format] [quality] [max-videos]
```

**Parameters:**

- `playlist-url` (required): YouTube playlist URL
- `format` (optional): Video format - mp4, webm, mkv, avi (default: mp4)
- `quality` (optional): Video quality - best, 4K, 1080p, 720p, 480p, 360p, worst (default: 720p)
- `max-videos` (optional): Maximum number of videos to download (default: 10)

**Examples:**

```bash
# Download first 5 videos from playlist at 1080p
npm run download-playlist "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMOV" mp4 1080p 5

# Download all videos from playlist at best quality
npm run download-playlist "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMOV"
```

## Features

### Video Processing

- **Multiple formats**: MP4, WebM, MKV, AVI
- **Quality options**: 4K, 1080p, 720p, 480p, 360p, best, worst
- **Metadata embedding**: Title, description, thumbnail, view count
- **Thumbnail extraction**: Saves video thumbnails as separate files
- **Info files**: Creates JSON metadata files for each video

### File Organization

- **Videos directory**: `public/videos/`
- **Metadata files**: `{video-id}.json` for each video
- **Index file**: `public/videos/index.json` with all videos
- **Playlists**: `public/videos/playlists.json` for playlist management
- **Thumbnails**: Saved alongside videos with matching names

### Error Handling

- **URL validation**: Checks for valid YouTube URLs
- **Format validation**: Ensures supported video formats
- **Quality validation**: Validates quality settings
- **Graceful failures**: Continues processing even if some downloads fail
- **Detailed logging**: Shows progress and error messages

## Dependencies

- **yt-dlp**: YouTube downloader (must be installed separately)
- **Node.js**: Built-in modules (fs, path, child_process)

## Installation

1. Install yt-dlp:

   ```bash
   # macOS
   brew install yt-dlp

   # Ubuntu/Debian
   sudo apt install yt-dlp

   # Or via pip
   pip install yt-dlp
   ```

2. Ensure Node.js is installed (already included in your project)

## File Structure

```
public/
└── videos/
    ├── index.json              # Video index
    ├── playlists.json          # Playlist management
    ├── video1.mp4              # Video files
    ├── video1.json             # Video metadata
    ├── video1.jpg              # Video thumbnails
    └── ...
```

## Video Metadata

Each video creates a JSON file with:

```json
{
  "id": "video_id",
  "title": "Video Title",
  "channel": "Channel Name",
  "duration": 180,
  "url": "/videos/video1.mp4",
  "thumbnail": "thumbnail_url",
  "playlist": "Playlist Name",
  "metadata": {
    "title": "Video Title",
    "channel": "Channel Name",
    "duration": 180,
    "thumbnail": "thumbnail_url",
    "uploader": "Channel Name",
    "description": "Video description",
    "viewCount": 1000000,
    "uploadDate": "20231201",
    "format": "mp4",
    "quality": "720p",
    "playlist": "Playlist Name"
  },
  "tags": [],
  "rating": 0,
  "playCount": 0,
  "dateAdded": "2023-12-01T10:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **yt-dlp not found**: Install yt-dlp using the installation instructions above
2. **Permission denied**: Ensure the scripts have execute permissions
3. **Invalid URL**: Check that the YouTube URL is correct and accessible
4. **Format not available**: Try a different format or quality setting
5. **Disk space**: Ensure sufficient disk space for video downloads

### Debug Mode

Add `--verbose` to yt-dlp commands for detailed logging:

```bash
# Edit the script and add --verbose to the ytdlpCmd
let ytdlpCmd = "yt-dlp --verbose";
```

## Performance Tips

1. **Quality vs Size**: Lower quality = smaller files, faster downloads
2. **Format choice**: MP4 is most compatible, WebM is more efficient
3. **Batch downloads**: Use batch script for multiple videos
4. **Playlist limits**: Set max-videos to avoid downloading entire playlists
5. **Storage**: Monitor disk space for large video collections
