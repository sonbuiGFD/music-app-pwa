# Music App PWA

A Progressive Web App (PWA) for downloading, managing, and playing YouTube audio files with offline capabilities, playlist management, and advanced filtering.

## 🎵 Features

### Core Functionality

- **YouTube Audio Download**: Automated download system using GitHub Actions
- **Offline Playback**: Play music even when offline
- **PWA Support**: Install as a native app on mobile devices
- **Background Audio**: Continue playing with screen locked
- **Playlist Management**: Create, edit, and manage multiple playlists
- **Advanced Filtering**: Search by title, artist, tags, genre, year, and rating

### Technical Features

- **React + Next.js**: Modern web framework with TypeScript
- **Zustand State Management**: Lightweight and efficient state management
- **IndexedDB Storage**: Client-side database for offline data
- **Service Worker**: Caching and background processing
- **Tailwind CSS**: Utility-first styling framework
- **GitHub Actions**: Automated audio downloading and deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd music-app-pwa
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Export static files**

   ```bash
   npm run export
   ```

3. **Deploy to GitHub Pages**
   The static files will be in the `out` directory, ready for deployment.

## 📱 PWA Installation

### Desktop (Chrome/Edge)

1. Open the app in your browser
2. Look for the install button in the address bar
3. Click "Install" to add to your desktop

### Mobile (iOS/Android)

1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share button
3. Select "Add to Home Screen"
4. The app will be installed as a native app

## 🎵 Downloading Audio

### Using GitHub Actions (Recommended)

1. **Go to GitHub Actions**

   - Navigate to the Actions tab in your repository
   - Find the "Download Audio" workflow

2. **Run the workflow**

   - Click "Run workflow"
   - Enter the YouTube URL
   - Select audio format (MP3, M4A, WAV)
   - Choose quality (best, 320k, 256k, 192k, 128k)
   - Optionally add a custom filename

3. **Wait for completion**
   - The workflow will download the audio
   - Files will be automatically added to the repository
   - The app will update with new tracks

### Using Local Scripts

1. **Download audio locally**

   ```bash
   npm run download "https://www.youtube.com/watch?v=VIDEO_ID" mp3 best
   ```

2. **Update playlists**

   ```bash
   npm run update-playlist
   ```

3. **Remove audio**
   ```bash
   npm run remove "filename.mp3"
   ```

## 🎛️ Usage

### Playing Music

- Click on any track to start playing
- Use the built-in player controls
- Background audio continues when screen is locked
- Lock screen controls work on mobile devices

### Managing Playlists

- All tracks are automatically added to "All Tracks" playlist
- Create custom playlists for different moods or genres
- Drag and drop to reorder tracks
- Export/import playlist data

### Filtering and Search

- Search by title, artist, or tags
- Filter by genre, year, or rating
- Sort by various criteria
- Real-time search results

## 🛠️ Development

### Project Structure

```
music-app-pwa/
├── .github/workflows/     # GitHub Actions workflows
├── public/                # Static assets
│   ├── audio/            # Audio files and metadata
│   ├── icons/            # PWA icons
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service worker
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── stores/           # Zustand state stores
│   └── types/            # TypeScript types
├── scripts/              # Node.js utility scripts
└── tests/                # Test files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run export` - Export static files
- `npm run download` - Download audio locally
- `npm run remove` - Remove audio file
- `npm run update-playlist` - Update playlist data
- `npm run sync-audio` - Download and update playlists

### Code Style

This project follows strict coding standards defined in `ai-docs/music-app-rules.md`:

- **TypeScript**: Strict type checking enabled
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with utility classes
- **State Management**: Zustand for global state
- **File Organization**: Feature-based directory structure
- **Naming**: kebab-case for files, PascalCase for components

## 🔧 Configuration

### Next.js Configuration

The app is configured for static export and GitHub Pages deployment:

```javascript
// next.config.js
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: process.env.NODE_ENV === "production" ? "/music-app-pwa" : "",
  basePath: process.env.NODE_ENV === "production" ? "/music-app-pwa" : "",
};
```

### PWA Configuration

The manifest.json includes all necessary PWA settings:

- App name and description
- Icons for all required sizes
- Display mode: standalone
- Theme colors
- Shortcuts for quick access

### Service Worker

The service worker handles:

- Static asset caching
- Audio file caching
- Offline functionality
- Background sync
- Push notifications

## 🚀 Deployment

### GitHub Pages

1. **Enable GitHub Pages**

   - Go to repository Settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source

2. **Deploy automatically**
   - Push changes to main branch
   - GitHub Actions will build and deploy
   - App will be available at `https://username.github.io/music-app-pwa`

### Manual Deployment

1. **Build the app**

   ```bash
   npm run build
   npm run export
   ```

2. **Upload files**
   - Upload contents of `out` directory to your web server
   - Ensure HTTPS is enabled for PWA functionality

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Test Coverage

- Unit tests for components and hooks
- Integration tests for user flows
- E2E tests for critical functionality

### Manual Testing Checklist

- [ ] Audio files load and play
- [ ] Playlist creation and management
- [ ] Search and filtering work
- [ ] PWA installation works
- [ ] Background audio plays
- [ ] Offline functionality works
- [ ] GitHub Actions workflow runs

## 🐛 Troubleshooting

### Common Issues

1. **Audio not playing**

   - Check file paths and CORS settings
   - Ensure audio files are properly downloaded
   - Check browser console for errors

2. **PWA not installing**

   - Verify manifest.json is accessible
   - Ensure HTTPS is enabled
   - Check service worker registration

3. **Background audio stops**

   - Check browser permissions
   - Ensure app is in foreground initially
   - Verify Media Session API support

4. **GitHub Action fails**

   - Check repository permissions
   - Verify workflow file syntax
   - Check Actions logs for errors

5. **Offline not working**
   - Check service worker registration
   - Verify cache strategies
   - Test with DevTools offline mode

### Debug Steps

1. Open browser DevTools
2. Check Console for errors
3. Verify Service Worker is active
4. Test network requests
5. Check GitHub Actions logs
6. Validate manifest.json syntax

## 📚 Documentation

- [Complete Project Documentation](ai-docs/music-app.md)
- [Code Structure & Style Rules](ai-docs/music-app-rules.md)
- [API Reference](docs/api.md)
- [Component Documentation](docs/components.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube downloader
- [GitHub Actions](https://github.com/features/actions) - CI/CD

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information
4. Include browser console logs and steps to reproduce

---

**Happy listening! 🎵**
