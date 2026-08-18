# Alt 2.3 — Participant OIDC PoC (mock / env-swap)

**Författare:** Mustafa Salahuddin  
**Efter:** Alt 2.1 + Alt 2.2  
**Branch:** `feature/eid-oidc-poc`  
**Datum:** 2026-08-18  
**Status:** PoC implementerad mot lokal `oidc-simulator` (feature-flag). Idura-sandbox fortfarande org-blocker för riktig eID.

## Mål

Visa att deltagare i `client-participation-alpha` kan logga in via samma OIDC-mönster som admin (react-oidc-context), så att servern får OIDC Bearer → `oidc_user_mappings` → Standard User JWT. Senare byts issuer till Idura utan ny auth-arkitektur.

## Vad som levereras

| Del | Innehåll |
|-----|----------|
| UI | `OidcAuthIsland` + `ParticipantOidcLogin` (knapp) på konversationssidan |
| Wiring | `OidcConnector` → `setOidcTokenGetter` / `setOidcActions` i `net.ts` |
| Flagga | `PUBLIC_ENABLE_OIDC_LOGIN=true` (av som default) |
| Env | `PUBLIC_AUTH_ISSUER`, `PUBLIC_AUTH_CLIENT_ID`, `PUBLIC_AUTH_AUDIENCE` |
| Docs | Denna fil + testplan |

**Inte i PoC:** BankID/Freja UI, `eid_required`, personnummer, Cypress eID-sandbox.

## Env-byten: simulator → Idura

| Variabel (alpha / build) | Lokal simulator | Idura (senare) |
|--------------------------|-----------------|----------------|
| `PUBLIC_ENABLE_OIDC_LOGIN` | `true` | `true` |
| `PUBLIC_AUTH_ISSUER` / `AUTH_ISSUER` | `https://localhost:3000/` | Idura issuer-URL |
| `PUBLIC_AUTH_CLIENT_ID` / `AUTH_CLIENT_ID` | `dev-client-id` | Idura client id |
| `PUBLIC_AUTH_AUDIENCE` / `AUTH_AUDIENCE` | `users` | Idura audience |
| Server `JWKS_URI` | simulator JWKS | Idura JWKS |
| Redirect URI | `http://127.0.0.1/alpha/<zinvite>` (aktuell path) | Registrerad i Idura-dashboard |

Server använder redan samma `AUTH_*` / JWKS för att validera OIDC JWT. Alpha speglar värdena som `PUBLIC_*` vid **build** (Astro).

### Aktivera lokalt (Docker)

1. I `.env`: sätt `PUBLIC_ENABLE_OIDC_LOGIN=true` (övriga `AUTH_*` finns redan för admin).  
2. Rebuild alpha: `make DETACH=true rebuild-web` (eller motsvarande compose build).  
3. Öppna en konversation, t.ex. `http://127.0.0.1/alpha/<zinvite>`.  
4. Klicka **Sign in with OIDC (eID PoC)** → oidc-simulator → välj t.ex. `test.user.0@polis.test`.

### Aktivera lokalt (npm dev)

Kopiera `client-participation-alpha/example.env` → `.env` och avkommentera OIDC-raderna, sedan `npm run dev`.

## Testplan (mentor)

1. **Flagga av:** ingen OIDC-knapp syns (default).  
2. **Flagga på + simulator:** knapp syns; login som `test.user.0@polis.test` / lösen från oidc-simulator README.  
3. Efter login: status **Signed in as …**; API-anrop skickar `Authorization: Bearer <access_token>`.  
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

- Utan `PUBLIC_ENABLE_OIDC_LOGIN` ändras inget för befintliga användare.  
- Riktig eID kräver Idura-sandbox från OKS.  
- GDPR: lagra endast broker `sub` (+ e-post om simulator/Auth0 ger den) — ingen personnummer.

## Checklista Alt 2.3

- [x] Minimal PoC (OIDC-knapp + AuthProvider + connector)
- [x] Dokumentera env-byten (simulator → Idura)
- [x] Testplan för mentor
- [x] Uppdatera tavlan + länka PR/branch — https://github.com/MustafaGood/polis/pull/6
- [x] Kort demo (2026-08-18): knappen → oidc-simulator → `test.user.0@polis.test` → Signed in as …
