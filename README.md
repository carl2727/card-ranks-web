# Card Ranks Web

MMR/Elo-basiertes Ranking von Sammelkarten im Browser – Web-Nachbau der
PyQt6-Desktop-App `card-ranks`. Karten werden über 1v1-Vergleiche und K.-o.-Brackets
bewertet.

- **Rein clientseitig**, kein Backend. Sammlungsdaten liegen als JSON beim Nutzer.
- **Kostenloses Hosting** über GitHub Pages.

Architekturentscheidungen sind in [`docs/adr/`](docs/adr/) dokumentiert.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · Zustand · Framer Motion · IndexedDB (`idb`)

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Produktionsbuild nach dist/
npm run preview  # Build lokal ansehen
```

## Deployment

Push auf `main` löst den GitHub-Actions-Workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) aus, der die App
baut und auf GitHub Pages veröffentlicht. In den Repo-Einstellungen unter
**Settings → Pages** muss als Source **GitHub Actions** gewählt sein.

## Projektstruktur

```
src/
├── types.ts        # Kern-Datentypen (Collection, Card, DataField)
├── lib/
│   ├── mmr.ts      # Elo-/MMR-Berechnung (framework-frei, testbar)
│   └── tiers.ts    # MMR-Tier-Farben
├── App.tsx         # Einstieg / aktuelle Oberfläche
└── main.tsx        # React-Bootstrap
```
