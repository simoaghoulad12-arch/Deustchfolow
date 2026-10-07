# Datensicherung

**Was wo liegt**
- Unterrichtsinhalte (`content/`) und der Code liegen in Git – sie sind mit dem Repository gesichert.
- Nutzerdaten (Team, Gruppen, Schüler, Dokumentation, Fehler, Hausaufgaben, Häkchen, Notizen, Entscheidungen,
  Einstellungen) liegen in der Supabase-Datenbank. Diese Daten müssen regelmäßig gesichert werden.

**Wie oft?** Die Häufigkeit ist eine OFFENE ENTSCHEIDUNG der Leitung. PROPOSAL: einmal pro Woche und zusätzlich vor
jeder größeren Änderung (z. B. neue Migration, Import).

## 1. Automatische Sicherungen von Supabase
Im Dashboard unter **Database → Backups** steht, welche automatischen Sicherungen das gewählte Supabase-Paket enthält
und wie lange sie aufbewahrt werden. Das beim Anbieter prüfen – die Bedingungen ändern sich.

## 2. Eigene Sicherung (Export)
Benötigt: Supabase CLI (`npm i -g supabase` oder `npx supabase`) und das Datenbank-Passwort.

```bash
# einmalig: Projekt verknüpfen (Project Ref aus der Dashboard-Adresse)
supabase link --project-ref <ref>

# Struktur und Daten getrennt sichern (Dateiname mit Datum)
supabase db dump -f backup/$(date +%F)-schema.sql
supabase db dump --data-only -f backup/$(date +%F)-daten.sql
```

Alternativ mit `pg_dump` und der Verbindungsadresse aus Supabase (**Project Settings → Database → Connection string**):

```bash
pg_dump "postgresql://postgres:<passwort>@<host>:5432/postgres" --schema=public --format=custom -f backup/$(date +%F).dump
```

**Wichtig – Schülerdaten sind personenbezogen:**
- Sicherungen nie ins Git-Repository legen und nicht per WhatsApp oder E-Mail verschicken.
- Verschlüsselt aufbewahren (z. B. verschlüsselter Ordner oder `gpg -c backup/…`), Zugriff nur für die Leitung.
- Alte Sicherungen nach einer festgelegten Frist löschen (Frist: OFFENE ENTSCHEIDUNG, siehe Datenschutz).

## 3. Wiederherstellen
1. Neues oder leeres Supabase-Projekt: zuerst die Migrationen aus `supabase/migrations` ausführen.
2. Daten einspielen:
   ```bash
   psql "postgresql://postgres:<passwort>@<host>:5432/postgres" -f backup/<datum>-daten.sql
   # bei pg_dump im custom-Format:
   pg_restore --data-only --dbname "postgresql://…" backup/<datum>.dump
   ```
3. Die Anmeldekonten (`auth.users`) gehören zu Supabase: bei einem neuen Projekt das Team neu einladen; die Profile
   werden dabei neu angelegt.
4. Stichprobe: Gruppen, Schüler und letzte Dokumentationen in der App prüfen.

## 4. Daten aus der alten Version
Die alte Version (`legacy/index.html`) speicherte Daten im Browser. Übernahme: dort **Einstellungen & Daten →
Export anzeigen**, Text kopieren, in der neuen App unter **Einstellungen → Daten aus der alten Version übernehmen**
einfügen, „Prüfen“, dann „Importieren“. Abgehakte Checklisten der alten Version sind nicht Teil dieses Exports.
