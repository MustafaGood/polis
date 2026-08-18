# Alt 2.2 — BankID/eID: krav, alternativ & spike

**Författare:** Mustafa Salahuddin  
**Efter:** Alt 2.1 inventering (`docs/eid-auth-inventory-alt2-1.md`)  
**Branch:** `feature/eid-requirements-spike`  
**Datum:** 2026-08-18  
**Status:** Klar för mentor-avstämning (Idura-sandbox fortfarande blocker)

## Mål

Besluta rekommenderad väg för OIDC-broker (BankID/Freja) och dokumentera vad som går lokalt vs kräver Idura/org.

## Checklista

- [ ] Bekräfta med mentor: finns Idura-sandbox / tidplan? **(väntar på Mattias/OKS)**
- [x] Jämföra broker-alternativ (Idura, Signicat, GrandID, Sweden Connect)
- [x] Lista krav från organisationen (kontrakt, testkonto, redirect-URI)
- [x] Spike-plan: mock OIDC-simulator vs riktig Idura-sandbox
- [x] Risker: miljö, hemligheter, GDPR, XID-konflikt
- [x] Rekommendation + nästa steg till Alt 2.3

## Broker-jämförelse

Polis integrerar **inte** BankID/Freja direkt. Standardväg: **OIDC-broker med JWKS** (det Polis-servern redan validerar).

| Leverantör | BankID (SE) | Freja eID | Gratis sandbox | Produktion (ungefär) | OIDC + JWKS | Kommentar |
|------------|-------------|-----------|----------------|----------------------|-------------|-----------|
| **Idura** (tidigare Criipto) | Ja | Ja | Ja (Verify-sandbox, inget kreditkort) | Ca från EUR 67/mån + per BankID-inloggning | Ja | **Rekommenderad** i praktikplan |
| Signicat | Ja | Ja | Demo | Enterprise (kontakta sälj) | Ja | Tung/enterprise |
| Svensk e-identitet / GrandID | Ja | Delvis | Begränsad | Varierar | Varierar | Mindre tydlig OIDC-standardväg |
| Sweden Connect | Via federation | Via federation | Via offentlig sektor | Offentlig eIDAS-nod | Ja (federation) | Mer relevant för myndigheter än LIA-MVP |
| Native BankID SDK | Ja | Nej | Nej | Lång ledtid | Nej | **Ej i scope** (praktikplan A5) |

**Praktiskt för LIA:** Idura Verify-sandbox räcker för utveckling. Produktion kräver Swedbank-godkännande via Idura (veckor–månader).

## Krav från organisationen (OKS)

| Krav | Vem | Varför |
|------|-----|--------|
| Idura-konto (sandbox) | OKS | Utveckling/test utan riktig prod-kostnad |
| OIDC-klient: client id + secret | OKS / mentor | Samma mönster som `AUTH_CLIENT_*` idag |
| Redirect URI(s) | Dev + ev. staging | t.ex. `https://localhost/.../callback` (exakt lista när klient skapas) |
| Testanvändare BankID/Freja | Idura sandbox | Cypress/E2E och manuell demo |
| Juridik / DPIA-utkast | Mentor + jurist | GDPR; ingen lagring av personnummer |
| (Senare) Prod-ansökan / sponsring | OKS | Utanför LIA-MVP om tid saknas |

**Claims-policy (MVP):** spara endast broker `sub` (+ ev. hashad pseudonym). **Ingen** personnummer/SSN i Polis-DB. Valfritt senare: `acr`/`amr` för LOA (praktikplan A4).

## Spike-plan

### A) Nu — utan Idura (mock)

1. Använd befintlig `oidc-simulator` (`AUTH_ISSUER=https://localhost:3000/`)
2. Dokumentera env-byten som senare pekas om till Idura:
   - `AUTH_ISSUER`, `AUTH_AUDIENCE`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, JWKS-URI
3. Skissa deltagarflöde i alpha: **Logga in** → OIDC redirect → `oidc_user_mappings` → **Standard User JWT** (samma som inventering A1)
4. Definiera regel för XID + OIDC-konflikt (redan UI-varning finns)

### B) När Idura-sandbox finns

1. Skapa OIDC-klient i Idura-dashboard  
2. Byt env till Idura issuer/JWKS  
3. Testa BankID + Freja testusers  
4. Alt 2.3: minimal PoC/PR + E2E-smoke

## Risker

| Risk | Påverkan | Mitigering |
|------|----------|------------|
| Ingen Idura-sandbox | Blockerar riktig eID-demo | Mock mot simulator; dokumentera gap |
| GDPR / personnummer | Juridisk risk | Endast `sub`; DPIA med mentor |
| XID vs OIDC i embed | Fel identitet / förvirring | Tydlig policy + befintlig conflict-warning |
| Swedbank-godkännande (prod) | Lång ledtid | Håll prod utanför LIA-MVP |
| Hemligheter i repo | Säkerhet | Endast `.env` / secrets; aldrig committa client secret |
| Kostnad utan sponsor | Drift | Pitch civic tech / pilotavtal (praktikplan) |

## Rekommendation

1. **Välj Idura** som broker för LIA (sandbox först).  
2. **Huvudleverans A1:** OIDC för deltagare (alpha + server claim-mapping).  
3. **Utan sandbox nu:** genomför mock-spike mot `oidc-simulator` i Alt 2.3 (docs + eventuell UI-knapp bakom feature-flag).  
4. **Med sandbox:** byt issuer och leverera PoC med BankID/Freja-testusers.

## Nästa steg → Alt 2.3

- [ ] Mentor bekräftar Idura ja/nej + tidplan  
- [ ] PoC: inloggningsknapp i alpha (simulator eller Idura)  
- [ ] Server: verifiera claim → `oidc_user_mappings`  
- [ ] Kort demo + PR  
- [ ] Uppdatera projektboard

## Fråga till mentor (kopiera)

> Hej Mattias, Alt 2.1 inventering är klar och Alt 2.2 rekommenderar Idura som OIDC-broker. Finns Idura Verify-sandbox (eller tidplan) för LIA, eller ska jag göra PoC mot lokal oidc-simulator först?
