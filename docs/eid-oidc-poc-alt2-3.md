# Alt 2.3: Participant OIDC PoC (mock / env-swap)

**Författare:** Mustafa Salahuddin  
**Efter:** Alt 2.1 + Alt 2.2  
**Branch:** `feature/eid-oidc-poc`  
**Datum:** 2026-08-18  
**Status:** Simulator-PoC finns (PR #6). Idura-login, fast callback och krav per konversation finns lokalt. Callbacken är sparad i Iduras testapp. Riktig BankID/Freja-login och API-flöde är ännu inte verifierade mot Idura-sandbox.

## Mål

Visa att deltagare i `client-participation-alpha` kan logga in via samma OIDC-mönster som admin (react-oidc-context), så att servern får OIDC Bearer → `oidc_user_mappings` → Standard User JWT. Senare byts issuer till Idura utan ny auth-arkitektur.

## Vad som levereras

| Del | Innehåll |
|-----|----------|
| UI | `OidcAuthIsland` + `ParticipantOidcLogin` (knapp) på konversationssidan |
| Wiring | `OidcConnector` → `setOidcTokenGetter` / `setOidcActions` i `net.ts` |
| Flagga | `PUBLIC_ENABLE_OIDC_LOGIN=true` (av som default) |
| Env | `PUBLIC_AUTH_ISSUER`, `PUBLIC_AUTH_CLIENT_ID`, `PUBLIC_AUTH_AUDIENCE` |
| Policy | Admin kan kräva verifierat BankID/Freja per konversation; XID-krav kan inte kombineras med eID-krav |
| Docs | Denna fil + testplan |

**Avgränsning:** Ingen lagring av personnummer, inga eID-sandbox E2E-tester och ingen produktionsansökan. Native BankID-SDK ingår inte; BankID/Freja går via Idura OIDC.

## Env-byten: simulator → Idura

| Variabel (alpha / build) | Lokal simulator | Idura (senare) |
|--------------------------|-----------------|----------------|
| `PUBLIC_ENABLE_OIDC_LOGIN` | `true` | `true` |
| `PUBLIC_AUTH_ISSUER` / `AUTH_ISSUER` | `https://localhost:3000/` | Idura issuer-URL |
| `PUBLIC_AUTH_CLIENT_ID` / `AUTH_CLIENT_ID` | `dev-client-id` | Idura client id |
| `PUBLIC_AUTH_AUDIENCE` / `AUTH_AUDIENCE` | `users` | Serverns audience ska matcha Idura-tokenens `aud` (vanligen klient-ID) |
| Server `JWKS_URI` | simulator JWKS | Idura JWKS |
| Redirect URI | `http://localhost:4321/auth/idura/callback` (fast lokal callback) | Måste registreras exakt i Idura-dashboard |

Server använder redan samma `AUTH_*` / JWKS för att validera OIDC JWT. Alpha speglar värdena som `PUBLIC_*` vid **build** (Astro).

I den lokala admin-klienten används Iduras signerade `id_token` som Bearer-token eftersom Iduras `access_token` inte känns igen som JWT av Polis-servern. Andra OIDC-issuers fortsätter använda `access_token`. Servern verifierar issuer, audience och signatur via JWKS; detta är en lokal PoC-anpassning, inte ett produktionsbeslut.

### eID-krav per konversation

* Admin kan slå på **Require BankID or Freja eID to participate**. Av som standard.
* När kravet är på måste servern se ett verifierat OIDC-token med en av de tillåtna `acr`-nivåerna: BankID QR på annan enhet, BankID på samma enhet eller Freja.
* Servern bär vidare verifierad `acr` i Polis deltagar-JWT för samma konversation. En deltagar-JWT från en annan konversation räcker inte som eID-bevis.
* eID-krav kan inte kombineras med XID-krav eller XID-lista. Servern avvisar en sådan inställning.
* OIDC-användare kan sakna e-post. Polis använder i så fall broker-`sub` som identitetsnyckel och lagrar ingen personnummer.
* Innan funktionen slås på måste Idura-appens callback/origin vara konfigurerade och serverns `AUTH_ISSUER`, `AUTH_AUDIENCE` och `JWKS_URI` matcha Idura-tokenen.
* Den lokala Idura-callbacken är `http://localhost:4321/auth/idura/callback`; efter inloggning skickas deltagaren tillbaka till samtalssidan som sparats i `sessionStorage`.

### Aktivera lokalt (Docker)

1. I `.env`: sätt `PUBLIC_ENABLE_OIDC_LOGIN=true` (övriga `AUTH_*` finns redan för admin).  
2. Rebuild alpha: `make DETACH=true rebuild-web` (eller motsvarande compose build).  
3. Öppna en konversation, t.ex. `http://127.0.0.1/alpha/<zinvite>`.  
4. Klicka **Sign in with BankID or Freja** → oidc-simulator → välj t.ex. `test.user.0@polis.test`.

### Aktivera lokalt (npm dev)

Kopiera `client-participation-alpha/example.env` → `.env` och avkommentera OIDC-raderna, sedan `npm run dev`.

## Testplan (mentor)

### Resultat från lokala enhetstester

Den 17 november 2026 kördes följande befintliga tester:

* Server: `eid.test.ts`, `standard-user-jwt.test.ts` och `create-user.test.ts`. Tre testsviter och 24 tester gick igenom.
* Deltagarappen: `idura.test.ts`. En testsvit och tre tester gick igenom.

Testerna verifierar inte faktisk inloggning med BankID eller Freja i Iduras sandbox. Den verifieringen och ett test av hela API-flödet återstår.

Den 17 november 2026 visade den lokala deltagarappen en inloggad session och ett påstående skickades med bekräftelsen "Statement submitted!". Enligt Mustafa användes BankID med testanvändare vid inloggningen. En tidigare serverfråga misslyckades eftersom databaskolumnen `eid_required` saknades; migrering `000019_add_eid_requirement.sql` kördes i den lokala utvecklingsdatabasen före det lyckade inskicket. Freja, verifiering av `acr` och hela flödet för båda metoderna återstår.

En kodgranskning hittade att en äldre deltagartoken kunde hindra deltagande efter eID-inloggning. En lokal ändring försöker igen med OIDC-token när servern uttryckligen kräver eID. Ändringen har riktade enhetstester men behöver granskas och verifieras i sandbox. Den är inte automatiskt driftsatt i den körande appen.

### Manuell testplan

1. **Flagga av:** ingen OIDC-knapp syns (default).  
2. **Flagga på + simulator:** knapp syns; login som `test.user.0@polis.test` / lösen från oidc-simulator README.  
3. Efter login: status **Signed in as …**; API-anrop skickar ett verifierat OIDC-token (simulator `access_token`, Idura `id_token`).
4. I Postgres: rad i `oidc_user_mappings` för användarens `oidc_sub`.  
5. Rösta/kommentera → participant JWT (standard user) fungerar.  
6. **XID-konflikt:** öppna `?xid=…` medan OIDC är inloggad → befintlig `XidOidcConflictWarning`.  
7. Sign out rensar OIDC-session.

```sql
SELECT oidc_sub, uid, created FROM oidc_user_mappings ORDER BY created DESC LIMIT 5;
```

## Demo (kort)

1. Visa inventering + spike-docs (Alt 2.1 / 2.2).  
2. Visa login-knapp → simulator (inte BankID).  
3. Visa DB-mapping.  
4. Förklara env-tabellen: samma kodväg, Idura när sandbox finns.

## Risker / begränsningar

* Utan `PUBLIC_ENABLE_OIDC_LOGIN` ändras inget för befintliga användare.  
* Riktig eID kräver Idura-sandbox och testanvändare från OKS.
* Det faktiska `acr`-värdet och tokenens audience måste verifieras i sandbox innan eID-kravet används.
* GDPR: lagra endast broker `sub` (+ e-post om simulator/Auth0 ger den), inte personnummer.
* Idura-kodändringarna är lokala och behöver code review innan de kan godkännas eller publiceras.

## Checklista Alt 2.3

* [x] Minimal PoC (OIDC-knapp + AuthProvider + connector)
* [x] Dokumentera env-byten (simulator → Idura)
* [x] Testplan för mentor
* [x] Uppdatera tavlan + länka PR/branch: https://github.com/MustafaGood/polis/pull/6
* [x] Kort demo (2026-08-18): knappen → oidc-simulator → `test.user.0@polis.test` → Signed in as …

## Idura Verify React SDK (uppdatering)

Paket: `@criipto/verify-react` (Idura hette Criipto). PKCE för public/SPA-klient. Guide: https://github.com/criipto/criipto-verify-react

När `PUBLIC_AUTH_ISSUER` pekar på Idura wrappas alpha i `CriiptoVerifyProvider` med:

* `domain`: host från issuer, t.ex. `example.test.idura.broker`
* `clientID`: t.ex. `urn:example:client-id`
* `redirectUri`: fast `http://localhost:4321/auth/idura/callback`, registrerad i Idura-testappen
* `sessionStore`: `sessionStorage` sparar Idura-tokenen för flödet från callbacken tillbaka till samtalssidan

Om ingen session finns kan SDK:n göra en tyst SSO-koll som ger `login_required`; det behandlas som att deltagaren ännu inte är inloggad, så inloggningsalternativen visas.

UI: `useCriiptoVerify` + `AuthMethodSelector` med tre `acr_values`: BankID QR (annan enhet), BankID same-device, Freja. Inte den generella `urn:grn:authn:se:bankid` (den duplicerar BankID-knappen). Fel visas alltid (`OAuth2Error`). Logout anropar SDK `logout({ redirectUri })`.

Simulator-issuer använder fortfarande `react-oidc-context`. SDK:n ersätter inte BankID for test (produktion-app och test-app kan inte samexistera på samma telefon).
