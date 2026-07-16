# RestaurantOS Deployment

1. In `config.js` vor dem Livegang folgende Werte setzen:
   - `seo.canonical`
   - `identity.website`
   - `localBusiness.website`
   - reale `localBusiness.geo.latitude` und `localBusiness.geo.longitude`
2. Statische SEO-Dateien lokal erzeugen:

   ```powershell
   node scripts/build-seo.js
   ```

3. Die strikte Produktionsprüfung ausführen:

   ```powershell
   node scripts/build-seo.js --production
   ```

   Der Befehl muss ohne Domainfehler enden. Platzhalter-, lokale, unsichere oder leere URLs sind im Produktionsmodus nicht zulässig.
4. `index.html`, `sitemap.xml` und `robots.txt` prüfen. Die Sitemap darf nur die echte Canonical URL enthalten; `robots.txt` muss auf die öffentlich erreichbare Sitemap zeigen.
5. Alle Dateien auf GitHub Pages oder ein anderes statisches HTTPS-Hosting veröffentlichen. Bei GitHub Pages muss die konfigurierte URL den vollständigen Repository-Unterpfad enthalten.
6. Die öffentliche URL anschließend mit einem Rich-Results-Test sowie Open-Graph- und Twitter-Preview-Tools prüfen.

Aktuell ist nur Deutsch konfiguriert; deshalb erzeugt RestaurantOS keine `hreflang`-Links. Erst bei realen alternativen Sprach-URLs dürfen Einträge über `seo.alternateLanguages` ergänzt werden.

Nach jeder Änderung an SEO-, Identity-, LocalBusiness-, Öffnungszeit- oder Bilddaten muss `node scripts/build-seo.js` erneut ausgeführt und das Ergebnis mitcommittet werden.
