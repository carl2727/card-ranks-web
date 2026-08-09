# ADR-0004: Hosting-Ziel — kostenlos & statisch

- **Status:** Accepted (GitHub Pages)
- **Datum:** 2026-08-09
- **Deciders:** Carl

## Kontext

Die App ist eine statische SPA (siehe [ADR-0001](0001-client-only-spa.md)) und
muss kostenlos gehostet werden. Es gibt kein Backend, also genügt ein
statisches CDN mit HTTPS.

## Optionen

| Anbieter | Vorteile | Nachteile |
|---|---|---|
| **GitHub Pages** | Am einfachsten, wenn Code auf GitHub liegt; direkt aus Repo | Nur statisch; Custom-Build via Actions nötig |
| **Cloudflare Pages** | Sehr schnelles CDN, einfache CI, großzügige Limits | Zusätzliches Konto/Anbindung |
| **Netlify / Vercel** | Komfortable Deploys, Previews | Für reines Static leicht überdimensioniert |

## Entscheidung

**GitHub Pages.** Der Code liegt in einem GitHub-Repo; Deploy erfolgt automatisch
per **GitHub Actions** beim Push auf `main` (Build mit Vite → statische Dateien →
Pages). Minimaler Setup-Aufwand, keine zusätzlichen Konten.

Cloudflare Pages wurde als gleichwertige Alternative erwogen, aber zugunsten des
geringeren Setup-Aufwands nicht gewählt.

## Konsequenzen

- Deploy ist ein CI-Schritt (Build → statische Dateien → CDN).
- Bei Vite: `base`-Pfad korrekt setzen (bei GitHub Pages Projektseiten relevant).
- Custom Domain jederzeit später ergänzbar.

## Offene Punkte

- [ ] Repo-Name auf GitHub festlegen (bestimmt `base`-Pfad in Vite).
- [ ] Ggf. Custom Domain (optional, später).
