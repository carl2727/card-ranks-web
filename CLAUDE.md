# Card Ranks Web

Web-Nachbau der PyQt6-Desktop-App `card-ranks`: ein MMR/Elo-basiertes
Ranking-System für Sammelkarten über 1v1-Vergleiche und K.-o.-Brackets.
Ziele: verbessertes Design/UI, kostenloses Hosting, **keine serverseitige
Datenspeicherung** — Sammlungen liegen als JSON beim Nutzer.

## Wichtige Entscheidungen (ADRs)

Größere Architektur-/Produktentscheidungen werden **vor** der Umsetzung als ADR
in [`docs/adr/`](docs/adr/) festgehalten. Aktueller Stand:

- **ADR-0001** — Client-only SPA ohne Backend (*Accepted*)
- **ADR-0002** — Datenhaltung: eine `.json` beim User mit Base64-Bildern,
  IndexedDB zur Laufzeit (*Accepted*)
- **ADR-0003** — Tech-Stack: React + Vite + TypeScript + Tailwind + shadcn/ui,
  Zustand, Framer Motion (*Accepted*)
- **ADR-0004** — Hosting: **GitHub Pages** (Deploy per GitHub Actions) (*Accepted*)

Bei jeder neuen wesentlichen Entscheidung: neue ADR anlegen und diesen Index
sowie [`docs/adr/README.md`](docs/adr/README.md) aktualisieren.

## Kernfunktionen (aus der Desktop-App zu portieren)

- **Collection**: Name, Karten, konfigurierbare `dataFields` (bis 12, Typ
  `int`/`float`/`string`).
- **Card**: `id`, Name, MMR (Start 1500), Bild + alternatives Bild, `tags[]`,
  `dataValues{}`, `rank`.
- **MMR/Elo**: K-Faktor 32, 400er-Skala, MMR nie < 0.
- **Ranking**: Sortierung nach MMR, Tier-Farben nach Schwellen
  (grau <1400, grün ≥1400, blau ≥1500, gelb ≥1550, orange ≥1650, lila ≥1850).
- **Modi**: 1v1-Vergleich (zufällige Karten, animierter MMR-Übergang) und
  Bracket (Top 32, Seeding 1vs32 …, bis Finale).

## Reine Logik frameworkfrei halten

MMR-Berechnung und Bracket-Seeding werden ohne UI-/Framework-Abhängigkeit und
unit-getestet implementiert (leicht aus `card-ranks/mmr_system.py` portierbar).

## Status

Phasen 1–7 umgesetzt und auf GitHub Pages deployt
(https://carl2727.github.io/card-ranks-web/):

1. Setup + Pages-Deploy (GitHub Actions)
2. Datenschicht (IndexedDB, JSON Import/Export, Bildkomprimierung, MMR-Logik)
3. Collection-Management-UI
4. Karten-Editor (Bild-Upload, Tags, Datenfelder)
5. 1v1-Vergleich mit MMR-Animation
6. Bracket-Modus (Top-N-Seeding, Sieger)
7. Politur (Tastatur-Shortcuts ←/→/Enter, Undo, PWA/Service Worker)

Offen/optional: automatisierte Tests der reinen Logik (`src/lib/mmr`, `bracket`,
`mutations`), UX-Feinschliff, Aktualisierung der Action-Versionen (Node-20-Warnung).
