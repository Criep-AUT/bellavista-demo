# Bistrik Pilotinstanz

Stand der öffentlichen Datenprüfung: 16. Juli 2026.

## Übernommene öffentliche Angaben

- Name: Restaurant Bistrik
- Adresse: Hauptstraße 62, 8401 Kalsdorf bei Graz, Österreich
- Telefon: +43 3135 82573
- Küche: bosnisch und österreichisch
- Preisspanne: €10–20 pro Person
- öffentlich gelistete Öffnungszeiten und Reservierungsmöglichkeit
- Facebook-Profil: `https://www.facebook.com/bisstrick/`

Quellen und das Prüfdatum sind zusätzlich maschinenlesbar unter `instance.sources` in `config.js` festgehalten.

Die Instanz läuft mit `presentationMode: "pitch"` und wird sichtbar als unverbindlicher Entwurf gekennzeichnet. Sie ist keine offizielle Restaurant-Website.

## Vor Produktion zu bestätigen

- offizielle Website, produktive Canonical-URL und E-Mail-Adresse
- exakte Geo-Koordinaten
- Öffnungszeiten direkt beim Betreiber, insbesondere Feiertage
- Reservierungs- und Zahlungsarten
- Firmenbuch-, UID-, Inhaber- und weitere Impressumsdaten
- Logo, Markenfarben und sämtliche Bilder
- vollständige Speisekarte und aktuelle Preise

Die vollständige, ausschließlich offene Liste steht in `OWNER-CHECKLIST.md`. Der maschinenlesbare Stand befindet sich ohne parallele Freigabeliste unter `instance.ownerConfirmation`.

Solange keine offizielle Domain hinterlegt ist, liefert die Instanz bewusst `noindex,nofollow` aus. Fehlende Werte bleiben leer; sie wurden nicht geschätzt.

## Lokaler Aufruf

Nach `node scripts/build-instances.js --instance bistrik` liegt die aufrufbare Seite unter `dist/bistrik/index.html`. Sie lädt ausschließlich die generierte Kopie der Bistrik-Konfiguration; gemeinsame Styles, Runtime und SEO-Hilfen kommen aus `dist/shared/`.

Das Bewertungs- und Reservierungsmodul ist im Pitch deaktiviert. Telefon, Route und das vorhandene Facebook-Profil bleiben über die bestehenden Kontaktbereiche erreichbar.
