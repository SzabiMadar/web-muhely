# Indítás az új `web-muhely` repóban, Devin Local módban

**Repo:** https://github.com/SzabiMadar/web-muhely
**Kiindulás:** új, üres repository; nincs régi munkafolyamat-specifikáció, amit át kellene venni.

## Neked, a fejlesztőnek

1. A ZIP teljes tartalmát (a gyökérben levő `README.md`, `AGENTS.md`, `docs/`, `skills/`, `prompts/`, `ui-preview/`) másold abba a helyi `web-muhely` mappába, amelyet Devin Local módban megnyitottál. **Ne hozz létre plusz `repo/` alkönyvtárat.**
2. Ha a mappa még nem Git munkafa, Devin ellenőrzés után inicializálhatja, és a távoli repót `https://github.com/SzabiMadar/web-muhely.git` URL-re állíthatja. Ha már van remote, ne írja felül reflexből.
3. Indíts új Devin beszélgetést. Másold be a kezdő promptot a csomag `prompts/W0_START.md` fájljából, vagy a ChatGPT válaszából. A pontos technológiai döntések kötelezőek, nem Devin választása.
4. Devin kizárólag W0-n dolgozzon. A Supabase kapcsolatot nem kell még beállítani. Ne kérjen éles kulcsokat, és ne építse meg W1–W4-et.
5. Devin mutassa be a tényleges build/test eredményeket és a felületet; az első GitHub push előtt kérjen jóváhagyást.

## Kötelező technikai döntés

Astro SSR, TypeScript strict, natív CSS design tokenekkel, később Supabase Auth + PostgreSQL + private Storage, Astro Actions + Zod. Nincs Next.js/React/Tailwind/Prisma/PocketBase, PWA, natív desktop, AI API vagy saját password vault az MVP-ben.

## Biztonság

A GitHub repository jelenleg **public**. Ez önmagában nem akadály az alkalmazáskódhoz, de nem kerülhet bele semmilyen ügyféladat, `.env`, API kulcs, vagy titok. Ha később privát adatokkal kapcsolatos dokumentumot is itt tartanál, állítsd a repositoryt privátra, de titkot akkor sem szabad commitolni.
