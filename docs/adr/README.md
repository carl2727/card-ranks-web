# Architecture Decision Records (ADRs)

Dieser Ordner hält die wesentlichen Architektur- und Produktentscheidungen für
**Card Ranks Web** fest. Jede größere Entscheidung wird **vor** der Umsetzung als
ADR dokumentiert.

## Format

Jede ADR nutzt: Status, Datum, Kontext, Entscheidung, Konsequenzen, verworfene
Alternativen. Status ist einer von: `Proposed`, `Accepted`, `Superseded`,
`Deprecated`.

## Index

| Nr. | Titel | Status |
|-----|-------|--------|
| [0001](0001-client-only-spa.md) | Client-only SPA ohne Backend | Accepted |
| [0002](0002-storage-strategy.md) | Datenhaltung: JSON beim User (Base64-Bilder) | Accepted |
| [0003](0003-tech-stack.md) | Tech-Stack: React + Vite + TS + Tailwind | Accepted |
| [0004](0004-hosting.md) | Hosting-Ziel: GitHub Pages | Accepted |

## Kontext des Projekts

Card Ranks Web ist der Web-Nachbau der PyQt6-Desktop-App `card-ranks`
(MMR/Elo-basiertes Ranking von Sammelkarten über 1v1-Vergleiche und Brackets).
Ziele: verbessertes Design/UI, kostenloses Hosting, keine serverseitige
Datenspeicherung.
