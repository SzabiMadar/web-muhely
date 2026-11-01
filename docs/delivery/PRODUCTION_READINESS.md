# Production-readiness — W0–W4 MVP

Az éles konfiguráció módosítása csak külön jóváhagyással. Kulcsok/titkok NEM kerülnek repóba vagy beszámolóba.

## 1. GitHub

- **Default branch: `main`** ✅ (API-val átállítva, remote HEAD igazolja).
- Javasolt védelem `main`-re (egyfejlesztős flow, approval nélkül):
  Settings → Branches → Add rule → `main`: „Require a pull request before merging” (Required approvals: 0), „Do not bypass the above settings”, force-push és branch-törlés tiltva. Status check csak akkor kötelező, ha CI lesz.
- Feature branchek megőrizve: `feat/w0..w4`, `feat/w3-mime-validation`.

## 2. Engedélyezett fájltípusok (végleges MVP-kör)

| Típus | Kiterjesztés | Ellenőrzés |
|---|---|---|
| Képek | png, jpg, jpeg, webp, gif | fejléc-szignatúra |
| PDF | pdf | `%PDF` szignatúra |
| Office | doc, xls | OLE szignatúra |
| Office OOXML | docx, xlsx | `PK` szignatúra + kötelező `[Content_Types].xml` marker |
| Szöveg | txt, md, csv | UTF-8 fatal dekód + control-char szűrés |

- Tiltva: **zip, svg, html, exe, script és minden ismeretlen kiterjesztés**; hiányzó MIME-típus; kiterjesztés–MIME eltérés; hamis tartalom.
- Konténerkockázat: a docx/xlsx belső fájllistája nincs vizsgálva (maradék makró/beágyazás-kockázat dokumentált — a feltöltés owner-only, privát bucket, nincs nyilvános megosztás).
- Méretkorlát: 10 MB — alkalmazásszinten (`validateProjectFile`) **és** a `project-files` bucketen (`file_size_limit` + `allowed_mime_types`, 0007/0008 migráció).
- Storage-RLS: írás csak `{uid}/{létező saját project_id}/` útvonalra (0008); olvasás/törlés owner-prefix.

## 3. Supabase Cloud — `web-muhely` projekt

Migrációfájlok timestamp-formátumúak (`20260201000001`–`…000008`), a `db push` szabványosan felismeri őket.

```bash
npx supabase login                                  # egyszeri, helyi böngészős belépés
npx supabase link --project-ref <PROJECT_REF>       # Dashboard URL-ből (nem titkos)
npx supabase migration list                         # lokális vs remote (csak olvasás)
npx supabase db push --dry-run                      # mit futna le — NEM módosít
# jóváhagyás után:
npx supabase db push && npx supabase migration list # alkalmazás + verifikáció
```

- GitHub-integráció: a repo össze van kapcsolva — ellenőrizd a Dashboard → Project Settings → Integrations alatt: working directory `.`, production branch `main`, **„Automatically deploy changes” kapcsoló legyen OFF** (automatikus production migráció tiltva).
- A `db push` által érintett elemek: 8 tábla (clients, projects, project_phases, project_tasks, project_resources, project_notes, project_reports, stb.), összes RLS-policy, `project-files` privát bucket + storage-policyk + bucket-limitek.
- DB-jelszócsere: Dashboard → Settings → Database → Reset database password (felhasználói lépés, a jelszó nem kerül a repóba/chatbe).

## 4. Cloud Auth/RLS/Storage tesztt terv (2 fiktív user)

Előkészület: Dashboard → Authentication → Users → `teszt.a@muhely.test`, `teszt.b@muhely.test` (auto-confirm). Végrehajtás a jóváhagyott `db push` után.

| # | Teszt | Elvárt |
|---|---|---|
| T1 | A login → ügyfél + projekt + feladat-seed | Létrejön, 302 |
| T2 | B login → üres listák; A projektoldala → redirect | Izoláció |
| T3a | Anon (anon kulcs, JWT nélkül) `rest/v1/clients` → `[]` | Deny |
| T3b | B JWT-vel: A adatai `[]`; insert A projektéhez → RLS-FK error | Deny |
| T4 | A: fájlfeltöltés + signed URL működik; B saját JWT-vel: lista `[]`, signed-generate/getDownload deny; közvetlen API-upload nemlétező projektid alá → deny. (Kiadott signed URL nem userhez kötött — B felhasználása NEM várható deny-nak.) | Storage-RLS |
| T5 | A: svg/zip/exe/html → tiltás; hamis .pdf → tartalomhiba; üres MIME → tiltás; >10 MB → tiltás (app + bucket szinten) | MIME-validáció |
| T6 | A: lezárás → client + internal snapshot → .md letöltés; B snapshot-link → deny; client-riportban nincs scope/access/belső jegyzet | W4 útvonal |

## 5. Netlify readiness

- `netlify.toml`: `command = "npm run build"`, `publish = "dist"`; `@astrojs/netlify` 8.2.10 adapter — lokális build igazolva.
- Javasolt `[build.environment]`: `NODE_VERSION = "22"` (Astro 7-hez kell).
- Létrehozás: „Add new site → Import project” → GitHub repo → production branch `main`. Deploy-preview minden PR-re automatikus.
- Privát tesztüzem: Site configuration → Access control → password protection (vagy csak preview-URL használata go-live-ig).

## 6. Környezeti változók (Netlify UI, NEM repó)

| Változó | Forrás |
|---|---|
| `PUBLIC_SUPABASE_URL` | Dashboard → API Settings → Project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Dashboard → API Settings → anon/publishable |

Service role key NEM kell a runtime-hoz — se Netlify-envben, se kódban.

## 7. Élesítési elfogadási terv (jóváhagyás utáni sorrend)

1. `db push` + `migration list` verifikáció; GitHub-integration auto-deploy OFF ellenőrzése.
2. 2 fiktív user létrehozása → T1–T6 cloud-teszt.
3. Netlify site + env-k + build; preview-URL smoke (login, CRUD, workflow, dosszié, átadás).
4. Teljes E2E fiktív adatokkal: signup → ügyfél → projekt → workflow → QA → dosszié → átadás → snapshot → .md.
5. Valódi böngészős nyomtatás/PDF-mentés a riportról; desktop + 375px mobil.
6. Publikus signup tiltása (Dashboard → Auth → Signups disabled — egyszemélyes app).
7. Incidens-alapok: Supabase backup (auto, free plan napi), `supabase db dump` mentés; Netlify rollback (deploy-history „Publish earlier”).
