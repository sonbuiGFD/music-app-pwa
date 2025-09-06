# Music App PWA - Complete Project Documentation

## Project Overview

A Progressive Web App (PWA) for downloading, managing, and playing YouTube audio files with offline capabilities, playlist management, and advanced filtering. The app runs entirely on GitHub Pages with automated audio downloading via GitHub Actions.

## Core Features

### 1. YouTube Audio Download System

- **Automated Download**: GitHub Action workflow for downloading YouTube audio
- **Multiple Formats**: MP3, M4A support
- **Quality Selection**: 128k to best quality options
- **Custom Naming**: Optional custom filenames
- **Metadata Extraction**: Title, uploader, duration, thumbnail
- **Auto-commit**: Files automatically added to repository

### 2. PWA Capabilities

- **Installable**: Can be installed on iOS/Android devices
- **Offline Playback**: Background audio with screen locked
- **Service Worker**: Caching and background processing
- **Media Session API**: Lock screen controls
- **Push Notifications**: Media control notifications

### 3. Playlist Management

- **Create/Edit/Delete**: Full playlist CRUD operations
- **Multiple Playlists**: Unlimited playlist creation
- **Drag & Drop**: Reorder tracks within playlists
- **Playlist Sharing**: Export/import playlist data

### 4. Advanced Filtering & Tagging

- **Tag System**: Custom tags for tracks
- **Multi-criteria Filtering**: Tags, genre, mood, year, rating
- **Search**: Full-text search across titles, artists, tags
- **Sorting**: Multiple sort options (title, artist, date, play count)
- **Rating System**: 5-star rating system

### 5. Offline Capabilities

- **IndexedDB Storage**: Large file storage for offline use
- **Service Worker Caching**: Automatic file caching
- **Background Sync**: Download files for offline use
- **Storage Management**: Monitor and manage storage usage

## Technical Architecture

### Frontend Stack

- **React with TypeScript**: Component-based UI development with type safety
- **Next.js**: Full-stack React applications with SSR/SSG capabilities
- **Vite**: Fast development and building tool for optimal performance
- **Tailwind CSS**: Utility-first styling framework for responsive design
- **shadcn/ui**: Modern component library for consistent UI elements
- **Framer Motion**: Animation library for smooth user interactions
- **Zustand**: Lightweight state management for application state
- **Service Worker**: Background processing and caching for PWA functionality
- **IndexedDB**: Client-side database for offline storage

### Backend Stack

- **GitHub Actions**: Automated audio downloading and deployment
- **GitHub Pages**: Static hosting for the application
- **yt-dlp**: Python library for YouTube downloads
- **FFmpeg**: Audio processing and conversion
- **Static Site Generation**: Pre-built static files for optimal performance

### File Structure

```
music-app/
├── .github/
│   └── workflows/
│       └── download-audio.yml
├── public/
│   ├── audio/
│   │   ├── index.json
│   │   ├── playlists.json
│   │   └── (downloaded audio files)
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── dispatch/
│   │       └── page.tsx
│   ├── components/
│   │   ├── AudioPlayer.tsx
│   │   ├── PlaylistManager.tsx
│   │   ├── BackgroundAudio.tsx
│   │   ├── PWAInstaller.tsx
│   │   └── ui/ (shadcn/ui components)
│   ├── hooks/
│   │   ├── useAudioPlayer.ts
│   │   ├── usePlaylist.ts
│   │   └── usePWA.ts
│   ├── lib/
│   │   ├── db-manager.ts
│   │   ├── audio-utils.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── scripts/
│   ├── download-audio.js
│   ├── remove-audio.js
│   └── update-playlist.js
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### Next.js Configuration

**Static Export Setup**: Configure `next.config.js` for static site generation:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === "production" ? "/music-app" : "",
  basePath: process.env.NODE_ENV === "production" ? "/music-app" : "",
};

module.exports = nextConfig;
```

### Local Development Scripts

**Package.json Scripts**: Add the following scripts for local development and audio management:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "download": "node scripts/download-audio.js",
    "remove": "node scripts/remove-audio.js",
    "update-playlist": "node scripts/update-playlist.js",
    "sync-audio": "npm run download && npm run update-playlist"
  }
}
```

**Local Download Script**: Create a Node.js script that handles YouTube audio downloads using the yt-dlp-exec package. The script accepts command-line arguments for YouTube URL, audio format (MP3, M4A, WAV), and quality settings. It downloads audio files to the public/audio directory with proper metadata extraction, thumbnail embedding, and JSON info file generation. The script includes error handling for failed downloads and provides console feedback for successful operations.

**Remove Audio Script**: Create a Node.js utility script for removing audio files from the public/audio directory. The script takes a filename as a command-line argument and safely deletes the specified audio file. It includes file existence checking, proper error handling, and console feedback for successful removals or file not found scenarios.

**Update Playlist Script**: Create a Node.js script that automatically manages the playlist JSON files by scanning the audio directory for available files. The script loads existing playlist and index data, scans for audio files with supported formats (MP3, M4A, WAV), and updates the audio index with new tracks while preserving existing metadata. It automatically updates the "All Tracks" playlist to include all available audio files and maintains other custom playlists. The script handles file I/O operations safely and provides feedback on the number of tracks processed.

### Required Dependencies

**Development Dependencies**: Add these packages for local audio management:

```json
{
  "devDependencies": {
    "yt-dlp-exec": "^2.0.0"
  }
}
```

**Installation**: Run `npm install yt-dlp-exec --save-dev` to install the YouTube downloader.

### Usage Instructions

**Download Audio Locally**: Use the download script to fetch YouTube audio files with customizable format and quality settings. The script accepts a YouTube URL as the first argument, followed by optional audio format (mp3, m4a, wav) and quality parameters (best, 320k, 256k, 192k, 128k). Downloaded files are automatically saved to the public/audio directory with metadata extraction and thumbnail embedding.

**Remove Audio Files**: Use the remove script to delete specific audio files from the local collection. Provide the filename as an argument to safely remove unwanted tracks. The script includes safety checks to prevent accidental deletions and provides feedback on operation success.

**Update Playlist JSON**: Use the update-playlist script to synchronize the playlist data with the current audio files in the directory. This script automatically scans for audio files, updates the index.json with track metadata, and refreshes the playlists.json to include all available tracks in the "All Tracks" playlist.

**Development Workflow**: Follow a systematic approach for local development: first download desired audio files using the download script, then update the playlist data using the update-playlist script, start the development server to test the application, and finally build the static site for production deployment. The sync-audio script combines download and playlist update operations for streamlined workflow.

## Implementation Guide

### Phase 1: React/Next.js Setup (Week 1)

#### Task 1.1: Project Initialization

**Next.js Project Creation**: Initialize a new Next.js project with TypeScript support using the create-next-app command with the App Router. Configure the project with Tailwind CSS for styling, ESLint and Prettier for code quality, and set up the basic project structure with app directory and components for static site generation.

**Package Dependencies**: Install required dependencies including React, Next.js, TypeScript, Tailwind CSS, shadcn/ui components, Framer Motion for animations, Zustand for state management, PWA-related packages for service worker functionality, and yt-dlp-exec for local audio downloads.

#### Task 1.2: PWA Configuration

**PWA Manifest Setup**: Configure the Progressive Web App manifest with proper app metadata, icons, and display settings. Set up service worker registration and caching strategies for offline functionality.

**TypeScript Configuration**: Set up TypeScript configuration with strict type checking, proper path mapping for imports, and type definitions for all project components and utilities.

#### Task 1.3: Basic App Structure

**App Router Structure**: Create the main application layout using the App Router with layout.tsx for the root layout, page.tsx for the home page, and dispatch/page.tsx for the download interface. Configure Next.js for static site generation with proper metadata and SEO configuration for GitHub Pages deployment.

**Local Development Scripts**: Set up npm scripts for local audio management including download, remove, and playlist update functionality. Create the scripts directory with Node.js utilities for managing audio files and JSON data.

### Phase 2: Audio Player Development (Week 2)

#### Task 2.1: Audio Player Components

**React Audio Player**: Create TypeScript React components for audio playback including player controls, progress bar, volume control, and track information display. Implement custom hooks for audio state management using Zustand, handle play/pause/seek functionality, and integrate with the HTML5 Audio API.

**Playlist Display Component**: Build a React component that renders the track list with search, filter, and sort capabilities. Include track selection, drag-and-drop reordering, and visual feedback for the currently playing track.

#### Task 2.2: Service Worker & PWA Features

**Service Worker Implementation**: Set up a service worker for caching static assets and media files. Implement cache-first strategy for static resources and network-first for API calls, ensuring offline functionality.

**PWA Integration**: Configure PWA features including app installation prompts, background sync, and push notifications for media control.

### Phase 3: Static Generation & Data Management (Week 3)

#### Task 3.1: Static Site Configuration

**Next.js Static Export**: Configure Next.js for static site generation with proper build settings for GitHub Pages deployment. Set up output configuration and asset optimization for static hosting.

**Data Management**: Implement client-side data persistence using IndexedDB for playlists and user preferences. Set up local storage management for offline functionality.

#### Task 3.2: Download Interface

**Download Information Page**: Build a React page component in app/dispatch/page.tsx that provides information about the GitHub Actions workflow and instructions for manual dispatch. Include workflow status display and download history from the generated audio index.

**Client-Side Data Handling**: Implement client-side data fetching and caching using React Query for efficient data management and synchronization with the static audio index.

### Phase 4: Advanced Features (Week 4)

#### Task 4.1: Playlist Management System

**Playlist Components**: Develop React components for playlist creation, editing, and management with drag-and-drop functionality using Framer Motion. Implement advanced filtering and search capabilities with real-time updates.

**State Management**: Set up Zustand stores for playlist data, audio player state, and user preferences. Implement persistent storage using IndexedDB and synchronization across components for offline functionality.

#### Task 4.2: Tagging and Filtering

**Tag Management System**: Create components for adding, editing, and managing track tags with autocomplete functionality and tag-based filtering.

**Advanced Search**: Implement full-text search across track metadata with filtering by multiple criteria including genre, mood, year, and rating.

### Phase 5: PWA & Mobile Features (Week 5)

#### Task 5.1: Background Audio & Media Controls

**Background Audio Hook**: Implement a custom React hook for background audio playback with Media Session API integration for lock screen controls and system media notifications.

**PWA Installation**: Create components for PWA installation prompts and detection of standalone mode with proper user feedback and installation flow management.

#### Task 5.2: Mobile Optimization

**Responsive Design**: Optimize the app for mobile devices with touch-friendly controls, gesture support, and adaptive layouts using Tailwind CSS responsive utilities.

**Performance Optimization**: Implement code splitting, lazy loading, and performance monitoring to ensure smooth operation on mobile devices.

### Phase 6: Offline Storage & Testing (Week 6)

#### Task 6.1: Offline Storage Implementation

**IndexedDB Integration**: Implement TypeScript classes for managing offline storage of media files and playlists using IndexedDB with proper schema design and efficient querying.

**Storage Management**: Create components for monitoring storage usage, managing offline files, and providing user feedback on storage capacity and cleanup options.

#### Task 6.2: Testing & Quality Assurance

**Component Testing**: Set up Jest and React Testing Library for unit testing React components and custom hooks.

**E2E Testing**: Implement end-to-end testing for critical user flows including audio playback, playlist management, and PWA installation.

**Performance Testing**: Conduct performance audits and optimization for mobile devices and slow network conditions.

## Deployment Instructions

### Step 1: Project Setup

1. Create a new GitHub repository
2. Initialize Next.js project with TypeScript and App Router: `npx create-next-app@latest --typescript --tailwind --app`
3. Configure Next.js for static export in next.config.js
4. Set up shadcn/ui components and ESLint/Prettier configuration

### Step 2: Development Environment

1. Install dependencies: `npm install`
2. Configure static site generation settings
3. Set up GitHub Actions for automated builds and deployment
4. Test local development server

### Step 3: Static Build & Deployment

1. Build the static Next.js application: `npm run build`
2. Deploy static files to GitHub Pages
3. Configure GitHub Actions to automatically deploy on push
4. Test PWA installation and offline functionality

## Testing Checklist

### Basic Functionality

- [ ] Audio files load and play
- [ ] Playlist creation and management
- [ ] Search and filtering work
- [ ] Tag system functions
- [ ] Rating system works

### PWA Features

- [ ] App installs on mobile devices
- [ ] Background audio plays with screen locked
- [ ] Lock screen controls work
- [ ] Offline playback functions
- [ ] Service worker caches files

### GitHub Actions

- [ ] Workflow triggers on dispatch
- [ ] Audio downloads successfully
- [ ] Files commit to repository
- [ ] Index updates correctly

## Troubleshooting

### Common Issues

1. **Audio not playing**: Check file paths and CORS settings
2. **PWA not installing**: Verify manifest.json and HTTPS
3. **Background audio stops**: Check browser permissions
4. **GitHub Action fails**: Verify token permissions
5. **Offline not working**: Check service worker registration

### Debug Steps

1. Check browser console for errors
2. Verify service worker is active
3. Test network requests in DevTools
4. Check GitHub Actions logs
5. Validate manifest.json syntax

## Future Enhancements

### Phase 7: Advanced Features

- [ ] User authentication
- [ ] Cloud sync
- [ ] Social sharing
- [ ] Advanced analytics
- [ ] Custom themes

### Phase 8: Mobile Optimization

- [ ] Native app wrapper
- [ ] Push notifications
- [ ] Offline sync
- [ ] Background downloads

## Maintenance Tasks

### Weekly

- [ ] Check GitHub Actions status
- [ ] Monitor storage usage
- [ ] Update dependencies
- [ ] Test core functionality

### Monthly

- [ ] Review user feedback
- [ ] Update documentation
- [ ] Performance optimization
- [ ] Security updates

## Quick Start Summary

1. **Setup**: Create GitHub repo, initialize Next.js with static export, configure GitHub Pages
2. **Download**: Manually dispatch GitHub Actions workflow from GitHub admin panel
3. **Play**: Use main app page to play and manage music from static files
4. **Install**: Install as PWA on mobile devices
5. **Offline**: Download tracks for offline playback using IndexedDB

This comprehensive guide provides everything needed to build, deploy, and maintain the Music App PWA project.
