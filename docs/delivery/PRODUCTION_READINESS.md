# Production-readiness — W0–W4 MVP

Az éles konfiguráció módosítása csak külön jóváhagyással. A kulcsok/titkok NEM kerülnek repóba.

## 1. GitHub

- **Default branch jelenleg `feat/w0-app-shell`** → állítsd `main`-re: Settings → Branches → Default branch.
- Javasolt branch-védelem `main`-re: Settings → Branches → Add rule → Require a pull request before merging (1 approval elég), + status check ha CI lesz. Direct push tiltása opcionális.

## 2. Supabase Cloud — migrációk (dry-run)

```bash
supabase link --project-ref <projekt-ref>          # dashboard → Project Settings → General
supabase migration list                            # helyi vs remote állapot (csak olvasás)
supabase db push --dry-run                         # mit futna le — NEM módosít
# jóváhagyás után:
supabase db push                                   # 0001–0006 alkalmazása sorrendben
supabase migration list                            # verifikáció
```

A 0003 migráció a `project-files` private bucketet + storage-policyt is létrehozza — `db push` kezeli.

## 3. Cloud Auth / RLS / Storage tesztt terv (2 fiktív user)

Előkészület: a cloud-authban 2 fiktív fiók: `teszt.a@muhely.test`, `teszt.b@muhely.test` (email-auth engedélyezve; a tesztadatok nem valódiak).

| # | Teszt | Elvárt |
|---|---|---|
| T1 | A login → ügyfél + 2 projekt + seed feladatok | Létrejön, 302 redirectek |
| T2 | B login → `/clients`, `/projects` üres; A projektoldala → redirect | RLS-izoláció |
| T3 | B anon-token JWT-vel `rest/v1/clients` → `[]`; A projektéhez insert → error | RLS deny |
| T4 | A feltölt pdf-t → signed URL működik; B ugyanazon az URL-en vagy bucket-listán → deny | Storage-RLS |
| T5 | A: exe/html feltöltés → `Nem támogatott fájltípus`; 10MB+ → méretlimit | MIME-validáció |
| T6 | A: lezárás → client+internal riport → .md letöltés → B snapshot-link → deny | W4 útvonal |

## 4. Netlify SSR

- `netlify.toml` + `@astrojs/netlify` adapter már OK (W0 óta `.netlify/v1/functions/ssr` generálódik).
- Site létrehozása: „Import project” → GitHub repo → build `npm run build`, publish `dist`, functions `.netlify/v1/functions`.
- **Privát tesztüzem:** password-protection a site-nak (Site settings → Access control → password protect) vagy Netlify-identity, míg az app single-user.
- Deploy preview: minden PR-re automatikus; production csak `main`.

## 5. Környezeti változók (Netlify UI-n, NEM repóban)

| Változó | Forrás | Megjegyzés |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | cloud projekt → API Settings | `https://xxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | cloud projekt → API Settings | anon/publishable kulcs |
| `SUPABASE_SERVICE_ROLE_KEY` | NEM kell az apphoz — csak CLI/test | soha ne env-ben az appnál |

## 6. MIME-validáció (a branchen)

`validateProjectFile` a `resources.ts`-ben: ext-allowlist (kép/pdf/doc/sheet/txt/md/csv/zip) + MIME-allowlist + 10 MB. Tiltott: exe/sh/html/script bármelyik mezőn. E2E a T5 sorban.
