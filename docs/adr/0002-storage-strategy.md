# ADR-0002: Datenhaltung — JSON beim User mit eingebetteten Base64-Bildern

- **Status:** Accepted
- **Datum:** 2026-08-09
- **Deciders:** Carl

## Kontext

Die Anforderung lautet: Sammlungsdaten liegen **als JSON beim User**, nichts wird
serverseitig gespeichert (siehe [ADR-0001](0001-client-only-spa.md)). Karten
enthalten Bilder, die in der Desktop-App als Dateien außerhalb des Projekts lagen.
Im Web gibt es keinen freien Dateisystemzugriff; Bilder müssen anders portabel
gemacht werden.

Betrachtete Optionen für das Austauschformat:
- **A) Ein einziges `.json`** mit Bildern als Base64-Data-URIs eingebettet.
- **B) `.zip`-Bündel** (`collection.json` + `images/`-Ordner).
- **C) File System Access API** — Bindung an eine echte Datei/Ordner mit Auto-Save.

## Entscheidung

**Für den Start wird Option A gewählt:** Eine Sammlung wird als **eine einzige
selbst-enthaltene `.json`-Datei** exportiert/importiert, in der Bilder als
Base64-`data:`-URIs direkt eingebettet sind.

Zur Laufzeit (zwischen Reloads) wird der Zustand zusätzlich in **IndexedDB**
gehalten, weil `localStorage` für Bilddaten zu klein ist. IndexedDB ist der
Arbeitsspeicher der App; die `.json`-Datei ist das portable Austausch-/Backup-Format.

Format (Skizze, nicht bindend für Implementierungsdetails):

```jsonc
{
  "schemaVersion": 1,
  "name": "My Cards",
  "dataFields": [{ "name": "Power", "type": "int" }],
  "cards": [
    {
      "id": "abc123",
      "name": "Card A",
      "mmr": 1500,
      "tags": ["fire"],
      "dataValues": { "Power": 42 },
      "image": "data:image/webp;base64,...",
      "alternativeImage": null
    }
  ]
}
```

## Konsequenzen

**Positiv**
- Maximale Portabilität: eine Datei, menschenlesbar, kein Entpacken nötig.
- Einfachste Implementierung (kein ZIP-Handling, keine Browser-API-Fallbacks).
- Direkt kompatibel mit „Datei beim User" — Download/Upload genügt.

**Negativ / Einschränkungen**
- **Dateigröße:** Base64 vergrößert Bilder um ca. +33 %; Sammlungen mit vielen
  Fotos können sehr groß werden.
- **Gegenmaßnahme:** Bilder beim Import clientseitig komprimieren/verkleinern
  (Ziel z. B. WebP, max. Kantenlänge ~800 px) bevor sie eingebettet werden.
- IndexedDB-Speicher ist browser-/gerätegebunden; „echtes" Backup erfordert
  bewussten JSON-Export durch den Nutzer.

## Migrationspfad

- **Vom Desktop-Format:** Die alten `collection.json` referenzieren Bildpfade.
  Ein Import-Helfer soll altes JSON einlesen und beim Import die referenzierten
  Bilder (falls vom Nutzer mit hochgeladen) zu Base64 einbetten. `schemaVersion`
  erlaubt zukünftige Migrationen.
- **Zu Option B/C später:** Das Datenmodell bleibt gleich; nur der Serializer
  (Bild als Base64 ↔ separate Datei) würde ausgetauscht. Wechsel ist ohne
  Datenverlust möglich und wird bei Bedarf als neue ADR (supersedes) festgehalten.

## Verworfene Alternativen (vorerst)

- **B) ZIP-Bündel:** kleiner, aber „eine ZIP statt purem JSON", braucht `jszip`
  und Entpack-Logik. Zurückgestellt, bleibt bevorzugter Upgrade-Pfad bei
  Größenproblemen.
- **C) File System Access API:** komfortabelstes Auto-Save, aber nur Chromium,
  Fallback nötig. Kandidat für spätere Politur-Phase.
