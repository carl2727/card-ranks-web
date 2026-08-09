# scripts/

## migrate-collections.mjs

Konvertiert alte Desktop-Sammlungen (`card-ranks`, snake_case + `image_path`) ins
neue Web-Format (eine JSON pro Sammlung, Bilder als eingebettete Base64-URIs, siehe
`docs/adr/0002-storage-strategy.md`).

Die alten JSONs verweisen auf Bildpfade unter `C:\`; die Dateien liegen aber auf
`E:\`. Das Skript remappt das automatisch.

### Verwendung

```bash
# Einzelne Datei
npm run migrate -- "E:\Users\carlr\Documents\Card Ranks\collections\NBA_Players.json"

# Ganzer Ordner
npm run migrate -- "E:\Users\carlr\Documents\Card Ranks\collections"

# Optionen
npm run migrate -- <input> --out migrated --images-base "E:\Users\carlr\Documents\Card Ranks" --from-drive C --to-drive E
```

Ergebnis liegt standardmäßig in `./migrated/` (gitignored). Die erzeugten JSON-
Dateien anschließend in der Web-App über **Import JSON** laden – die Bilder sind
dann eingebettet und erscheinen direkt.
