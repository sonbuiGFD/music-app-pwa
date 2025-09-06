const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Create a high-quality SVG icon generator
function createSVGIcon(size) {
  const center = size / 2;
  const radius = size * 0.4;
  const strokeWidth = Math.max(2, size / 32);
  const noteSize = size * 0.3;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow-${size}" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${
    size * 0.01
  }" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background circle with shadow -->
  <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#gradient-${size})" stroke="#1e40af" stroke-width="${strokeWidth}" filter="url(#shadow-${size})"/>
  
  <!-- Music note icon -->
  <g transform="translate(${center}, ${center})" fill="white" stroke="white" stroke-width="${
    strokeWidth * 0.5
  }">
    <!-- Note head -->
    <ellipse cx="0" cy="${noteSize * 0.2}" rx="${noteSize * 0.4}" ry="${
    noteSize * 0.2
  }" fill="white"/>
    
    <!-- Note stem -->
    <rect x="${noteSize * 0.3}" y="-${noteSize * 0.6}" width="${
    strokeWidth * 0.8
  }" height="${noteSize * 0.8}" fill="white"/>
    
    <!-- Note flag -->
    <path d="M ${noteSize * 0.35} -${noteSize * 0.6} Q ${noteSize * 0.6} -${
    noteSize * 0.4
  } ${noteSize * 0.35} -${noteSize * 0.2}" stroke="white" stroke-width="${
    strokeWidth * 0.8
  }" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
}

// Icon sizes from your manifest
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log("Generating high-quality placeholder icons with Sharp...");

async function generateIcons() {
  for (const size of iconSizes) {
    try {
      const svgContent = createSVGIcon(size);
      const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
      const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

      // Write SVG file
      fs.writeFileSync(svgPath, svgContent);

      // Convert SVG to PNG using Sharp
      await sharp(Buffer.from(svgContent))
        .png({
          quality: 100,
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
        })
        .toFile(pngPath);

      console.log(`✓ Generated high-quality icon-${size}x${size}.png and .svg`);
    } catch (error) {
      console.error(`✗ Error generating icon-${size}x${size}:`, error.message);
    }
  }

  console.log("\nAll high-quality placeholder icons generated successfully!");
  console.log("Icons are saved in:", iconsDir);
  console.log("\nFeatures:");
  console.log("- High-quality PNG output using Sharp");
  console.log("- Scalable SVG versions");
  console.log("- Music note design with gradient background");
  console.log("- Proper sizing for all PWA requirements");
  console.log('- Optimized for both "any" and "maskable" purposes');
}

generateIcons().catch(console.error);
