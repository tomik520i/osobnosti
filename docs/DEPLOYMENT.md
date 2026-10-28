# Vlastní nasazení

Veřejná kopie neobsahuje konfiguraci běžícího webu. Následující cesty a doména jsou zástupné hodnoty pro vlastní nastavení.

## Statická část

`dist/` obsahuje hotový web bez sestavování. Samotné dotazníky, skórování, místní zapamatování a PNG export fungují v prohlížeči. Pro místní náhled použij `npm start` a `http://127.0.0.1:4175`.

Statický náhled nespouští PHP API a neposílá PHP soubory klientovi. Pro účty a sdílení potřebuješ webserver se správně zapnutým zpracováním PHP.

## Účty a sdílení

Požadavky: PHP 8.3+ s podporou Argon2id, rozšíření `pdo_sqlite`, `sodium`, `curl`, sessions a HTTPS. Veřejná část je připravená pro URL cestu `/osobnosti_test/`; stejnou cestu má session cookie v `dist/api.php`.

1. Zveřejni pouze obsah `dist/` v `/osobnosti_test/`. Kořen repozitáře ani `server/` nesmí být webovým kořenem.
2. Vytvoř soukromý adresář mimo webový kořen. Setup spouštěj pod uživatelem, pod kterým běží PHP.
3. Inicializuj konfiguraci a databázi s vlastní cestou a doménou:

   ```sh
   php server/setup.php /absolute/private/data https://example.org
   ```

   Druhý argument je samotný origin bez koncového lomítka, cesty či parametrů. Skript vygeneruje šifrovací klíč, vytvoří `config.php`, `profiles.sqlite` a sessions. Existující konfiguraci nepřepisuje. Klíč a databáze nepatří do Gitu.

4. Nastav pro PHP proces proměnnou `OSOBNOSTI_DATA_DIR` na stejný soukromý adresář. Předání závisí na konfiguraci Apache/PHP-FPM; proměnná v interaktivním shellu nemusí být dostupná webovým procesům.
5. Zajisti HTTPS a shodu HTTP Host s nakonfigurovaným originem. Při přímém TLS musí PHP dostávat `HTTPS=on`. API nepřebírá neověřené hlavičky `X-Forwarded-*`.

Za důvěryhodnou HTTPS reverzní proxy nastav před prvním setupem `OSOBNOSTI_TRUSTED_PROXY` na její přesnou IP adresu. Proxy musí zachovat Host, vynucovat HTTPS na veřejném vstupu a být jediným přípustným zdrojem požadavků k backendu. Spojení k backendu zabezpeč podle svého prostředí. Prázdná hodnota znamená přímé TLS. Existující nastavení se mění v soukromém `config.php`.

`.htaccess` obsahuje bezpečnostní hlavičky, zákaz výpisu adresářů a limit velikosti požadavku. Apache musí povolit příslušné direktivy; u jiného webserveru nastav jejich ekvivalenty. API nepovoluje CORS. Limity požadavků používají adresu přímého protějšku; za proxy proto mohou být společné pro více uživatelů.

Uprav informace o soukromí v `dist/content.mjs` podle skutečného provozu, zejména zálohy, logy a zpracování AI. Repozitář nedodává správu záloh, monitorování ani nezávislý bezpečnostní audit.

## Aktualizace existujících účtů z verze 3.7

Před aktualizací vytvoř konzistentní soukromou zálohu databáze a konfigurace mimo webový kořen. Ověř dostupnost Argon2id. Během migrace pozastav zápisy API; původní registrace používala INSERT bez názvů sloupců a po přidání sloupců není kompatibilní.

~~~sh
php server/migrate-auth.php /absolute/private/data
~~~

Migrace je transakční a opakovatelná. Přidá nickname, hash hesla, verzi přihlášení a tabulku zapamatovaných přihlášení. ID účtů, vlastnictví výsledků a porovnávací kódy zachová. Nasaď společně nové api.php, auth.php a statické soubory. Registrace nyní vyžaduje nickname a heslo. Starší uživatel nastaví heslo až po přihlášení svým původním klíčem. Při návratu staré aplikace neobnovuj starou databázi přes novější uživatelská data; stará autentizace navíc neumí účty převedené na hesla.

Bezpečnostní podklady: [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [PHP password_hash](https://www.php.net/manual/en/function.password-hash.php). Implementace není nezávisle auditovaná. Obnovu zapomenutého hesla nedodává; provozovateli se heslo nikdy nezobrazuje. Konfigurace a zálohy musí zůstat mimo Git i veřejný adresář.

## Volitelný místní model

Požadavky: Node.js 22+ a místní modelový server s API `GET /v1/models` a `POST /v1/chat/completions`, který podporuje JSON výstup a použité schéma. Lze použít kompatibilní server llama.cpp. Váhy, licenci modelu a jeho nastavení dodává provozovatel.

Výchozí spojení:

- Model: `http://127.0.0.1:8080`.
- Služba rozboru: `http://127.0.0.1:4180`.
- PHP volá službu rozboru; prohlížeč se k ní nepřipojuje přímo.

```sh
npm run ai
```

Pro trvalý provoz použij vlastní správu procesů. Model ani službu rozboru nevystavuj veřejně. Při změně portů uprav odpovídající adresy v `ai-explanation.mjs`, `personal-analysis.mjs`, `ai-service.mjs` a `dist/api.php` společně. Služba potřebuje všechny kořenové moduly rozboru a jejich importy z `dist/`, včetně `personal-input.mjs`.

Služba přijímá `POST /explain` pro porovnání a `POST /personal` pro osobní výklad. PHP je zpřístupní jako akce `ai-explain` a `ai-personal` se stejnými pravidly originu, CSRF a limitů. Generování je dobrovolné a funguje bez účtu. Osobní výklad používá JSON schéma a rozpočet až 4 200 výstupních tokenů; nastav modelový kontext a propustnost tak, aby se požadavek dokončil do 80 sekund. Při nedostupnosti nebo odmítnutí výstupu zůstanou původní výsledky v prohlížeči. Modelové kontroly ověřují formát a některá omezení, nikoli pravdivost výkladu.

Neplatný nebo nedostupný model způsobí výběr otázek podle pravidel. Pro tento náhradní rozbor stále musí běžet Node.js služba; bez ní zůstává dostupné běžné porovnání v prohlížeči.

Aplikace nezapisuje obsah požadavků do vlastních logů. Zvlášť zkontroluj logování modelového serveru, proxy a systému. Přepínač `audit` není v běžné HTTP službě zapnutý; případné testovací diagnostiky nesmí obsahovat skutečné profily.

## Ověření

```sh
npm test
python3 tests/api_integration.py
```

Integrační test používá loopback port 4176, dočasný adresář a syntetické účty. `OSOBNOSTI_TEST_DIR` povoluje testovací HTTP pouze pro loopback klienta a místní origin. Na veřejném nasazení tuto proměnnou nenastavuj.

Při změně položek aktualizuj verzi dotazníku a spusť `npm run schema`. Zachování skórovacího klíče samo neznamená psychometrickou validaci překladu.
