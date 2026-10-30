# MVP scope – felhasználói történetek és elfogadási feltételek

**Alapelv:** egy működő használati útvonal fontosabb, mint sok külön modul. MVP = W0–W4 első kiadás; W5 csak későbbi.

| ID | Felhasználói eredmény | Minimális elfogadási kritérium |
|---|---|---|
| CL-01 | Ügyfelet rögzítek | Név kötelező; cég, kapcsolattartó, e-mail, telefon, cím, megjegyzés opcionális; szerkeszthető |
| CL-02 | Ügyfeleket listázok | Névkeresés, projektlista, üres állapot; nincs más felhasználói adat |
| PR-01 | Projektet hozok létre | Meglévő vagy új ügyfél; név, munkatípus, leírás, határidő; mentés után projekt 360° |
| PR-02 | Több projektet kezelek | Egy ügyfélhez min. 2 projekt; a projektadatok nem keverednek |
| PR-03 | Áttekintem a haladást | Fázisok, következő feladat, fontos linkek, projekttípus és státusz látszik |
| WF-01 | Playbook vezet végig | 11 fázis; megfelelő sablon; feladatok kézi állapotváltása és indokolt kihagyás |
| WF-02 | QA-t rögzítek | `not_tested/passed/failed/not_applicable` állapot; FAIL jól látszik; nem mosódik össze a DONE státusszal |
| RS-01 | Külső erőforrást csatolok | GitHub/staging/live/Figma/Drive/hosting/DNS/analytics/jelszókezelő referencia presetek |
| RS-02 | Fájlt csatolok | Privát feltöltés, méret/MIME-ellenőrzés, jogosult letöltés, projekthez kötés |
| RS-03 | Jegyzetet írok | Projekt/fázis szerinti Markdown-tartalom, mentés, kereshetőség (legalább cím alapján) |
| RS-04 | Hozzáféréseket nyilvántartok | Rendszer URL, fióknév, tulajdonos, vault referencia; jelszó- és tokenmező nincs |
| EX-01 | Átadást összegzek | Markdown és nyomtatóbarát HTML; nyitott QA, linkek, átadott fájlok és releváns ügyfélinformáció |
| EX-02 | Karbantartáshoz visszatérek | `delivered`/`archived` projekt kereshető; fontos technikai erőforrások megtalálhatók |
| SEC-01 | Csak én férek hozzá | Belépés, szerveroldali auth/authz, RLS teszt, privát Storage |
| UX-01 | Szívesen használom | Dokumentált designrendszer, 3 fő képernyő áttekinthető, mobil 375px és desktop 1440px, a11y ellenőrzés |

## Viselkedési részletek

**Projekt létrehozás:** kétféle ügyfélút: meglévő ügyfél kiválasztása, vagy egy modális/egyszerű oldalsó formban új létrehozása. Ne kényszerítsen előbb ügyféloldalra navigálni.

**Erőforrás preset:** a preset csak alapmezőket és címkét tölt ki; adatok a projektben tárolódnak. A felhasználó tetszőleges egyedi linket is felvehet. Jelszóval kapcsolatos mező soha nincs. Lásd `../architecture/DATA_MODEL.md`.

**Fázisállapot:** a 11 szakmai fázis fix sorrendben jelenik meg, de a `small_change` sablonból nem relevánsak elrejthetők / kihagyott státuszúak lehetnek. Nem kell minden kattintáshoz formális jóváhagyás.

**Átadás:** a program nem állítja, hogy számlát kiállított; csak számlaszámot/állapotot vagy külső dokumentum-linket rögzít. Ügyfélelégedettség csak manuális jegyzet vagy külső hivatkozás.

## Későbbre

AI funkciók, teljes szövegkeresés, automatizált emlékeztetők, pénzügyi kalkulátor, ügyfélportál, GitHub API, automatikus tesztolvasás, PDF/DOCX motor, projekt ZIP visszaimport, projekt-sablon editor, offline PWA, natív desktop.

## Tudatosan nem épül

Gate-értékelő algoritmus, 40+ táblás adatmodell, 11 külön CRUD modul, local credentials vault, komplex szerepkörök, GitHub App installation flow, microservice rendszer, végrehajtó AI-autopilot.
