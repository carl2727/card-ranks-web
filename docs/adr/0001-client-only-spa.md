# ADR-0001: Client-only SPA ohne Backend

- **Status:** Accepted
- **Datum:** 2026-08-09
- **Deciders:** Carl

## Kontext

Card Ranks Web soll die Funktionalität der Desktop-App `card-ranks` im Browser
nachbauen. Zwei harte Anforderungen: (1) Hosting muss kostenlos sein, (2) die
Sammlungsdaten der Nutzer dürfen **nicht serverseitig** gespeichert werden,
sondern liegen als JSON beim User.

## Entscheidung

Die App wird eine **rein statische Single-Page-Application (SPA)** ohne eigenes
Backend, ohne Datenbank, ohne Authentifizierung. Sämtliche Logik (MMR-Berechnung,
Ranking, Bracket) läuft im Browser. Persistenz erfolgt ausschließlich lokal beim
Nutzer (siehe [ADR-0002](0002-storage-strategy.md)).

## Konsequenzen

**Positiv**
- Datenschutz per Design: es gibt keinen Server, der Nutzerdaten sehen könnte.
- Kostenloses Hosting trivial möglich (statisches CDN, siehe [ADR-0004](0004-hosting.md)).
- Keine Betriebskosten, keine Skalierungs-/Backend-Wartung.
- Offline-Fähigkeit als PWA später leicht ergänzbar.

**Negativ / Einschränkungen**
- Kein serverseitiges Teilen/Sync von Sammlungen zwischen Geräten (nur manueller
  Datei-Export/Import).
- Kein zentrales Backup — der Nutzer ist für seine Dateien verantwortlich.
- Bild-/Datenmengen sind durch Browser-Speicher (IndexedDB) begrenzt.

## Verworfene Alternativen

- **Serverless-Backend (z. B. Cloudflare Workers + KV/D1):** widerspricht der
  Anforderung „keine serverseitige Speicherung" und bringt Komplexität/Kosten.
- **Klassisches Backend (Node/DB):** verletzt Kost‑ und Datenschutzziele.
