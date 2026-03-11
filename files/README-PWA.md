# 📱 Canal Livraisons — Guide d'installation PWA

## Structure des fichiers à placer dans votre projet

```
mon-projet/
├── public/
│   ├── manifest.json          ✅ fourni
│   ├── service-worker.js      ✅ fourni
│   ├── offline.html           ✅ fourni
│   ├── index.html             ✅ fourni
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── splashscreens/         (optionnel, iOS uniquement)
│       ├── splash-750x1334.png
│       ├── splash-1170x2532.png
│       └── splash-1290x2796.png
└── src/
    ├── main.jsx
    └── App.jsx                ← votre canal-midi-app.jsx renommé
```

---

## 1. Génération des icônes

### Option A — Script automatique (recommandé)
```bash
npm install sharp
node generate-icons.js
```
Le script crée toutes les icônes depuis le SVG intégré.
**Remplacez le SVG** dans `generate-icons.js` par votre logo final.

### Option B — Outil en ligne (sans Node)
→ https://pwa-asset-generator.web.app
→ https://realfavicongenerator.net
Importez votre logo (PNG 1024×1024 minimum) et téléchargez le pack.

---

## 2. Configuration Vite (si vous utilisez Vite)

### Installation du plugin PWA
```bash
npm install -D vite-plugin-pwa
```

### vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Le plugin gère le SW automatiquement
      // Retirez alors la balise <script> SW de index.html
      manifest: false, // On utilise notre manifest.json dans /public
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })
  ]
})
```

---

## 3. Configuration Create React App

Dans `package.json`, ajoutez :
```json
{
  "homepage": ".",
}
```

Renommez `src/index.js` → `src/index.jsx` et assurez-vous que
`public/service-worker.js` est dans le bon dossier.

---

## 4. Déploiement (hébergement recommandé)

### Netlify (gratuit, le plus simple)
```bash
npm run build
# Glissez le dossier dist/ sur netlify.com/drop
```
→ HTTPS automatique ✅ (obligatoire pour les PWA)

### Vercel
```bash
npm install -g vercel
vercel
```

### GitHub Pages
```bash
npm install -D gh-pages
# Dans package.json : "deploy": "gh-pages -d dist"
npm run build && npm run deploy
```

> ⚠️ **HTTPS obligatoire** : les Service Workers ne fonctionnent qu'en HTTPS
> (ou sur localhost pour le développement).

---

## 5. Tester la PWA avant déploiement

### En local
```bash
npm run build
npx serve dist   # ou: npx http-server dist -S (HTTPS)
```

### Audit Lighthouse
1. Ouvrez Chrome DevTools (F12)
2. Onglet **Lighthouse**
3. Cochez **Progressive Web App**
4. Cliquez **Analyze page load**
→ Visez un score **PWA : 100%**

### Vérification rapide
- [ ] `manifest.json` accessible sur `/manifest.json`
- [ ] `service-worker.js` accessible sur `/service-worker.js`
- [ ] Icônes présentes dans `/icons/`
- [ ] Site servi en **HTTPS**
- [ ] Bouton "Installer" apparaît sur Android Chrome
- [ ] "Ajouter à l'écran d'accueil" fonctionne sur iOS Safari

---

## 6. Installation sur les appareils

### 📱 iPhone / iPad (Safari)
1. Ouvrir le site dans **Safari** (pas Chrome iOS)
2. Appuyer sur l'icône **Partager** (carré avec flèche ↑)
3. Faire défiler → **"Sur l'écran d'accueil"**
4. Confirmer → L'icône Canal Livraisons apparaît

> iOS ne supporte pas le prompt automatique d'installation.
> Ajoutez une bannière dans l'app pour guider l'utilisateur.

### 🤖 Android (Chrome)
1. Ouvrir le site dans **Chrome**
2. La bannière **"Ajouter à l'écran d'accueil"** apparaît automatiquement
   — ou appuyer sur ⋮ → **"Installer l'application"**
3. Confirmer → L'app s'installe comme une app native

---

## 7. Splash screens iOS (optionnel)

Générez les splash screens avec :
```bash
npx pwa-asset-generator logo.png public/splashscreens --splash-only --type png
```
Cela crée les images de chargement pour chaque taille d'écran Apple.

---

## 8. Checklist finale avant lancement

- [ ] Numéro WhatsApp mis à jour dans `canal-midi-app.jsx` et `offline.html`
- [ ] Logo/icônes personnalisés générés
- [ ] Site déployé en HTTPS
- [ ] Testé sur iPhone Safari et Android Chrome
- [ ] Score Lighthouse PWA ≥ 90
- [ ] Page offline fonctionnelle (couper le Wi-Fi et naviguer)
- [ ] Splash screen iOS visible au lancement

---

*Canal Livraisons — Été 2024 · Canal du Midi, Le Somail → Béziers*
