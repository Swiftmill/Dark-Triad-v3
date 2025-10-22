# THE DARK TRIAD

Application Electron autonome qui reproduit l'expérience immersive du site CCC (https://ccc.actor) en mode hors ligne.

## ⚙️ Installation

```bash
npm install
```

### Mode développement

```bash
npm run dev
```

### Compilation Windows (.exe)

Déposez vos médias dans `resources/` puis :

```bash
npm run build:win
```

Les exécutables sont disponibles dans `dist/`.

## 📂 Structure

```
/
├─ package.json
├─ resources/
│  ├─ hero1.mp4
│  ├─ hero2.mp4
│  ├─ hero-fallback.jpg
│  ├─ logo-triangle.png
│  ├─ backgrounds.json
│  ├─ config.json
│  ├─ glyphs.json
│  └─ timeline.json
└─ packages/
   ├─ main/       # Processus principal Electron
   ├─ preload/    # Pont sécurisé IPC
   └─ renderer/   # Interface React + Vite
```

## 🧪 Tests manuels

1. Lancer `npm run dev` et attendre l'ouverture de l'application.
2. Vérifier le glitch du titre « THE DARK TRIAD » et le fond vidéo.
3. Survoler les glyphes : les caractères se révèlent progressivement.
4. Cliquer sur le titre pour changer le fond (crossfade 600 ms).
5. Surveiller la console pour s'assurer qu'aucune erreur n'est présente.

## 🔧 Configuration

- `resources/config.json` : vitesse des glyphes (`glyphRateMs`), durée de révélation (`revealDurationMs`).
- `resources/backgrounds.json` : liste des vidéos/images cyclées sur le titre.
- `resources/glyphs.json` : texte réel ↔ glyphes animés.
- `resources/timeline.json` : évènements déclenchés pendant la lecture de la vidéo.

## 📦 Packaging

Le packaging s'appuie sur `electron-builder` avec une cible NSIS et Portable, prêt à générer un `.exe` Windows.

## 🔐 Sécurité

- `contextIsolation` et `sandbox` activés.
- `preload` expose uniquement `api.glyphs.load`, `api.background.swap`, `api.timeline.play`.
- Validation des données côté main et preload via Zod.
- CSP stricte définie dans `packages/renderer/index.html`.
