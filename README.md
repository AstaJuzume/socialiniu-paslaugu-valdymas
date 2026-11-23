# Socialinių paslaugų valdymas · Presales demo

Bendrinė socialinių paslaugų valdymo demonstracija. Siūlomas repozitorijos pavadinimas: `socialiniu-paslaugu-valdymas`.

## Publikavimas GitHub Pages

1. GitHub sukurkite repozitoriją `socialiniu-paslaugu-valdymas`.
2. Išarchyvuokite šį ZIP kompiuteryje.
3. Repozitorijoje rinkitės **Add file → Upload files** ir įkelkite išarchyvuotus failus. `index.html` turi būti pagrindiniame repozitorijos aplanke, o ne papildomame kataloge. Įkelkite failus, ne patį ZIP.
4. Patvirtinkite pakeitimus mygtuku **Commit changes** į `main` šaką.
5. Atverkite **Settings → Pages**.
6. Pasirinkite **Deploy from a branch**, šaką **main** ir aplanką **/(root)**. Spauskite **Save**.
7. Kai publikavimas bus baigtas, demo nuorodą rasite tame pačiame Pages nustatymų puslapyje.

Nereikia npm paketų, surinkimo ar API raktų. Su GitHub Free planu Pages publikavimui reikalinga vieša repozitorija. Šioje GitHub Pages versijoje nėra prisijungimo per ChatGPT.

Oficiali GitHub instrukcija: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Funkcijos

- Mėlyna ir turkio spalvų paletė, Kauno ir Šiaulių padaliniai.
- Vizito kūrimas paspaudus dienos valandą grafike.
- Automatinis kliento paslaugos ir jai priskirtų darbuotojų parinkimas.
- Darbuotojų priskyrimo redagavimas kliento kortelėje.
- Tabelio žymėjimai AT, L, N, KA ir NA, komentarai ir CSV eksportas.
- Darbuotojo vizito informacijoje įkainis ir priemoka nerodomi.
- Klientų planai, tipiniai grafikai, mėnesio vizitų formavimas, paslaugos, dokumentai, vidiniai pranešimai, GPS ir parašai.
- Incidentų, duomenų importo ir šventinių dienų kalendoriaus redagavimo nėra.

## Demo duomenys

Pavyzdiniai įrašai saugomi kiekvienos naršyklės localStorage. Komandos narių pakeitimai tarpusavyje nesinchronizuoja. Rolės perjungimas skirtas demonstracijai. Tikri el. laiškai nesiunčiami. GPS priklauso nuo įrenginio ir naršyklės leidimų.

## Failai

- `index.html` – pradinis puslapis.
- `app.js`, `v2.js`, `presales.js` – programos funkcijos.
- `style.css` – išvaizda.
- `sw.js`, `manifest.webmanifest`, piktogramos – PWA palaikymas.

Visi ištekliai pasiekiami santykiniais adresais, todėl demo veiks repozitorijos GitHub Pages poaplankyje.
