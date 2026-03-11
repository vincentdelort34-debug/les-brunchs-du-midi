#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
//  generate-icons.js
//  Génère toutes les icônes PWA nécessaires depuis un SVG source.
//
//  USAGE :
//    npm install sharp   (une seule fois)
//    node generate-icons.js
//
//  Résultat : dossier /public/icons/ avec toutes les tailles requises
// ═══════════════════════════════════════════════════════════════════════════════

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// ── SVG source de l'icône (⚓ sur fond sombre — à remplacer par votre logo) ──
const SVG_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fond -->
  <rect width="512" height="512" rx="80" fill="#2a2318"/>
  <!-- Zone safe maskable (cercle central visible) -->
  <circle cx="256" cy="256" r="180" fill="#3d3020" opacity="0.5"/>
  <!-- Ancre stylisée -->
  <text x="256" y="310" font-size="220" text-anchor="middle"
        font-family="serif" fill="#c8a050">⚓</text>
  <!-- Nom en bas -->
  <text x="256" y="430" font-size="36" text-anchor="middle"
        font-family="sans-serif" font-weight="300" fill="#faf7f2"
        letter-spacing="6">CANAL</text>
</svg>`;

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, "public", "icons");

async function generateIcons() {
  // Créer le dossier si nécessaire
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log("📁 Dossier créé :", OUTPUT_DIR);
  }

  const svgBuffer = Buffer.from(SVG_ICON);

  for (const size of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✅ icon-${size}x${size}.png généré`);
  }

  console.log("\n🎉 Toutes les icônes ont été générées dans /public/icons/");
  console.log("\n📋 Structure attendue par index.html et manifest.json :");
  SIZES.forEach(s => console.log(`   public/icons/icon-${s}x${s}.png`));
}

generateIcons().catch(console.error);
