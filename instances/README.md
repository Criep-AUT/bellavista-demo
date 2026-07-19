# RestaurantOS Instanzen

Die zentrale HTML-Struktur liegt ausschließlich in `templates/restaurant.html`. `instances/manifest.js` verbindet jede Restaurant-Config mit ihrem Asset- und Outputpfad. `dist/` und die Root-Demo sind generiert und dürfen nicht manuell bearbeitet werden.

## Manifestfelder

- `id`: eindeutige, URL-sichere Instanz-ID
- `config`: relativer Pfad zur Instanz-Config
- `assets`: relatives Verzeichnis der kundenspezifischen Assets
- `output`: eindeutiger Pfad innerhalb von `dist/`
- `enabled`: steuert, ob die Instanz beim Gesamtbuild berücksichtigt wird
- `deploymentMode`: `demo`, `staging` oder `production`
- `rootDemo`: optional; genau eine aktive Demo darf zusätzlich die Root-Ausgabe erzeugen

Das Build-Skript erkennt doppelte IDs und Outputs, ungültige oder aus dem Projekt herausführende Pfade sowie fehlende Config- und Assetdateien.

## Neue Restaurantinstanz

1. Einen neuen Ordner `instances/<id>/` anlegen.
2. Eine bestehende `config.js` kopieren und ausschließlich mit bestätigten Kundendaten anpassen.
3. `instance.status`, `instance.presentationMode`, die Booleschen Werte unter `instance.ownerConfirmation` und den gewünschten Deployment-Modus setzen.
4. eigene Dateien unter `instances/<id>/assets/` hinterlegen.
5. einen eindeutigen Eintrag in `instances/manifest.js` ergänzen.
6. mit `node scripts/build-instances.js --instance <id>` als Demo bauen.
7. vor Veröffentlichung `node scripts/build-instances.js --instance <id> --production` ausführen.

Gemeinsame Dateien wie `style.css`, `script.js`, `seo-utils.js` und die HTML-Vorlage werden niemals in einen Instanz-Quellordner kopiert. Generierte `index.html`, `config.js`, `robots.txt` und `sitemap.xml` unter `dist/` werden ebenfalls nie direkt editiert.

`presentationMode: "pitch"` erzeugt außerhalb von Production einen dezenten Entwurfshinweis. Im Production-Modus wird dieser Hinweis grundsätzlich nicht ausgegeben. Vor einem Produktionsbuild müssen alle erforderlichen `ownerConfirmation`-Werte `true` sein.
