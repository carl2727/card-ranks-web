# ADR-0003: Tech-Stack — React + Vite + TypeScript + Tailwind

- **Status:** Accepted
- **Datum:** 2026-08-09
- **Deciders:** Carl

## Kontext

Für eine statische Client-only-SPA (siehe [ADR-0001](0001-client-only-spa.md))
mit „verbessertem Design/UI" und animierten 1v1-/Bracket-Ansichten wird ein
Stack benötigt, der gutes DX, kostenloses statisches Hosting und ein reifes
Komponenten-/Animations-Ökosystem bietet.

## Entscheidung

| Bereich | Wahl |
|---|---|
| Build/Framework | **React + Vite + TypeScript** |
| Styling / UI | **Tailwind CSS + shadcn/ui** |
| State-Management | **Zustand** |
| Animationen | **Framer Motion** |
| Lokaler Speicher | **IndexedDB** via `idb` oder `localforage` (siehe [ADR-0002](0002-storage-strategy.md)) |
| Bild-Verkleinerung | Canvas-basierte Komprimierung beim Import (WebP) |

TypeScript ist verpflichtend — die Datenmodelle (`Collection`, `Card`,
`DataField`) werden als Typen definiert und aus der Desktop-Logik portiert.

## Konsequenzen

**Positiv**
- Sehr gutes freies Hosting statischer Builds (siehe [ADR-0004](0004-hosting.md)).
- shadcn/ui + Tailwind ermöglichen schnell ein hochwertiges, dunkelmodus-fähiges,
  responsives UI.
- Framer Motion ersetzt die PyQt-QTimer-Animationen (MMR-Zähler, Kartenfarbe,
  Bracket-Übergänge) sauber.
- Zustand ist minimal und passt zum Modell „eine aktive Sammlung im Speicher".

**Negativ / Einschränkungen**
- Node/npm-Toolchain nötig (Build-Schritt), kein „einfach HTML öffnen".
- Bundle-Größe im Auge behalten (Tree-Shaking, Lazy-Loading der Modi).

## Verworfene Alternativen

- **Svelte/SvelteKit:** kleiner, aber kleineres Ökosystem für fertige Komponenten.
- **Vanilla JS / kein Framework:** minimaler Build, aber Zustands- und
  UI-Verwaltung würde bei Modi/Animationen schnell mühsam.
- **Next.js:** überdimensioniert (SSR/Server-Features ungenutzt bei Static-Only).

## Konventionen

- Reine Logik (MMR/Elo, Bracket-Seeding) wird **frameworkfrei** und **getestet**
  gehalten (leicht 1:1 aus Python portierbar, unit-testbar ohne DOM).
