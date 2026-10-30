# Műhely UI — Taste-alapú design system

**Cél:** gondosan megtervezett, *calm productivity* élmény. Egy professzionális fejlesztői műhely, nem startup-marketingoldal, nem generikus admin dashboard.

## Vizuális karakter

- Világos, halvány meleg háttér + mély tintazöld sidebar.
- Megbízhatóság, szellősség, egyenletes ritmus, világos információ-hierarchia.
- A nap legfontosabb kérdése: **"Mi a következő szakmai feladat?"** Az oldal egyetlen fő cselekvést emel ki.
- Egyszerre kevés információs zaj; részletek kontextusban, megfelelő aloldalon.
- A "minőség" nem zöldre festett pipák sokasága: NOT_TESTED / FAIL állapot szövegesen is világos.

## Design tokenek

| Token | Érték | Használat |
|---|---|---|
| `--canvas` | `#F6F7F4` | oldalháttér |
| `--surface` | `#FFFFFF` | kártyák |
| `--surface-2` | `#F1F4EF` | halk szekció |
| `--sidebar` | `#172B24` | fő navigáció |
| `--sidebar-muted` | `#B4C5B9` | inaktív sidebar |
| `--ink` | `#1A2822` | fő szöveg |
| `--muted` | `#68766F` | segédszöveg |
| `--border` | `#E1E8E1` | elválasztók |
| `--accent` | `#377D64` | CTA, active |
| `--accent-soft` | `#E4F2EA` | enyhe kiemelés |
| `--warning` | `#AD743C` | review/figyelmeztetés |
| `--danger` | `#B44D48` | hiba / FAIL |
| `--radius-card` | `16px` | card |
| `--radius-control` | `10px` | input/button |
| `--shadow-card` | `0 8px 28px rgba(18,38,28,.04)` | finom mélység |

**Tipográfia:** `Inter`, `Manrope` vagy jó rendszerfont, felhasználóbarát magyar ékezetekkel; 32/24/19/16/14/12 px hierarchia, jó sorhossz és `font-weight` 400–700. Nem kell minden komponensben eltérő fontméret.

**Grid:** sidebar 248px desktopon, fő tartalom max. 1440px; 12 oszlopos rács; 24px card spacing, 16px kontrollközök. Mobilon sidebar drawer vagy bottom nav a tényleges tartalmi prioritások szerint.

## Komponensminták

**AppShell** (sidebar + main), **PageHeader** (breadcrumb/title/one primary CTA), **StatCard** (legfeljebb 3 releváns adat), **ProjectCard**, **StageTimeline**, **TaskRow** (egyértelmű státusz), **ResourceCard** (típus, domain, titok nélküli leírás), **EmptyState** (valódi következő cselekvés), **DetailDrawer**, **ConfirmDialog**, **Toast**, **FormField**, **StatusPill**.

Minden komponenshez definiálni kell: Default, Hover, Focus, Loading, Empty, Error, Disabled. Semmi inaktív, dísznek kirakott gomb.

## Dashboard – tartalmi összetétel

1. Bal oldalt tömör navigáció, alul bejelentkezett felhasználó.
2. Fejlécben "Áttekintés" és "Új projekt".
3. Fent **Aktív projektek / Következő teendők / Figyelmet igényel** három sematikus kártya; soha nem kozmetikázott metrika.
4. Fő tartalomban "Folyamatban lévő projektek" listája / kártyái, kis fázisjelző, határidő, next action.
5. Jobb oldalon "Mai fókusz" és "Legutóbbi anyagok".
6. Első belépés üres állapot: új ügyfél vagy projekt felvitele, nem 0-kat mutató, üres enterprise dashboard.

## Projekt 360° – tartalmi összetétel

- Projekt fejléce: név, ügyfél, státusz, típus, határidő.
- Jól érthető teljesítési áttekintés és a **következő tényleges teendő**.
- Top tabok: Áttekintés / Folyamat / Dosszié / Hozzáférések / Átadás.
- Fázislista balról vagy felülről; részletek a kiválasztott fázisban.
- A guide oldalpanele nem versenyez a checklist fő műveletével.
- Kritikus QA `failed` állapotot nem puszta szín jelzi.

## A11y és responsive elfogadási feltételek

- WCAG 2.2 AA-t szem előtt tartó kontraszt, látható fókusz, megfelelő label és hibajelzés; nem állítunk jogi megfelelést automatikusan.
- Touch target kényelmes (irányadó 44×44px), jól navigálható táblák, roving tabindex csak ahol kell.
- 375, 768, 1280, 1440 szélesség ellenőrzése; vízszintes dokumentumszintű scroll nincs.
- Ne használj kizárólag színt státusz jelölésre; szám + szöveg + ikon együtt.
- Skeleton csak indokolt hálózati töltéskor, nem dekorációként.

## Kerülendő

Huge gradients, üvegfelületek, neon, indokolatlan diagramok, nagy üres képek, "AI mindenhol" villogó kártyák, dashboardra zsúfolt teljes dokumentumok, láthatatlan icon-only navigáció, üres metrikák, erőltetett 3D.

## Ellenőrzés

A kódoló MI minden UI PR-hez mellékelje desktop + mobil screenshotját, valamint legalább egy üres és egy hibás állapot megjelenítését. Vizuális referencia: `ui-preview/index.html`, és a `skills/muhely-ui-taste/SKILL.md`.
