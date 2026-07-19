# RestaurantOS Deployment

## Build

```powershell
# alle aktiven Instanzen
node scripts/build-instances.js

# eine Instanz
node scripts/build-instances.js --instance bistrik

# Ausgabe vorher vollständig neu erzeugen
node scripts/build-instances.js --clean

# strikte Produktionsfreigabe
node scripts/build-instances.js --instance bistrik --production
```

`scripts/build-seo.js` bleibt als kompatibler Bellavista-Befehl erhalten, verwendet intern aber denselben Multi-Instance-Generator.

## Deployment-Modi

- `demo`: fehlende oder Platzhalter-Domains sind mit Warnung zulässig. Der Robots-Wert kommt aus der Instanz-Config. `presentationMode: "pitch"` kennzeichnet den Output als unverbindlichen Entwurf.
- `staging`: eine öffentliche HTTPS-Domain ist erforderlich; der Generator erzwingt statisch und in der ausgegebenen Config `noindex,nofollow`.
- `production`: erzwingt `index,follow`, eine öffentliche HTTPS-Domain, vollständige Legal-Daten, einen freigegebenen Instanzstatus und ausschließlich bestätigte `ownerConfirmation`-Werte. Pitch-Hinweise werden nicht ausgegeben.

Der Schalter `--production` führt die Produktionsprüfung unabhängig vom im Manifest eingetragenen Modus aus. Eine fehlgeschlagene Prüfung schreibt für die betroffene Instanz keine neue Ausgabe.

## Ausgabe und Veröffentlichung

`dist/shared/` enthält CSS, Runtime und SEO-Utility genau einmal. Jede Instanz unter `dist/<id>/` enthält nur ihre generierte HTML-Datei, Config-Kopie, Robots-Datei, Sitemap und eigenen Assets. Die relativen Verzeichnisse müssen beim Upload erhalten bleiben.

Die Root-Dateien `index.html`, `robots.txt` und `sitemap.xml` werden ebenfalls aus der als `rootDemo` markierten Bellavista-Instanz erzeugt. Dadurch bleibt GitHub Pages aus dem Repository-Stamm ohne Redirect nutzbar.

`dist/` wird bewusst versioniert: Die statische Ausgabe kann damit direkt auf GitHub Pages oder ein anderes Datei-Hosting veröffentlicht werden, ohne dass dort Node ausgeführt werden muss. Änderungen an generierten Dateien werden niemals manuell vorgenommen, sondern durch einen erneuten Build ersetzt.

Vor einem Livegang:

1. Produktionsdomain in `seo.canonical`, `identity.website` und `localBusiness.website` eintragen.
2. Betreiberstatus und alle Werte unter `instance.ownerConfirmation` bestätigen.
3. Legal-Daten und freigegebene Assets hinterlegen.
4. Produktionsprüfung ausführen.
5. den passenden Instanzordner zusammen mit `dist/shared/` veröffentlichen.
6. öffentliche URL anschließend mit Rich-Results-, Open-Graph- und Twitter-Tools prüfen.
