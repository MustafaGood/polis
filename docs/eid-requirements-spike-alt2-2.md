# Alt 2.2: BankID/eID, krav, alternativ och spike

**Författare:** Mustafa Salahuddin  
**Efter:** Alt 2.1 inventering (`docs/eid-auth-inventory-alt2-1.md`)  
**Branch:** `feature/eid-requirements-spike`  
**Datum:** 2026-08-18  
**Status:** Klar (docs). Idura-sandbox och tidsplan är bekräftade enligt Mustafa. Se Alt 2.3 för aktuell PoC-status och återstående sandboxverifiering.

## Mål

Besluta rekommenderad väg för OIDC-broker (BankID/Freja) och dokumentera vad som går lokalt vs kräver Idura/org.

## LIA: sammanhang och status

LIA betyder lärande i arbete. Praktikplanen föreslår 16 veckor i Polis med antingen e-legitimation, tillgänglighet eller en kombination av båda. Valet av spår och slutlig bedömning görs tillsammans med handledare och utbildning; detta dokument är inte ett godkännande av hela LIA-perioden.

| Område | Dokumenterat arbete | Kvar eller behöver bekräftas |
|--------|---------------------|------------------------------|
| eID: förstudie | Autentisering inventerad och broker-alternativ jämförda. Sandbox och tidsplan bekräftade enligt Mustafa. | Säkerställ tillgång till testanvändare och överenskomna testförutsättningar. |
| eID: implementation | Simulator-PoC och lokala Idura-ändringar finns; eID-krav per konversation är implementerat lokalt. | Verifiera BankID och Freja samt API-flödet i sandbox, inklusive E2E-tester och code review. |
| Tillgänglighet | Förbättringar, automatiserade tester och en manuell checklista är dokumenterade. | Genomför eller bekräfta manuell skärmläsartest och live-test av modalen om de ingår i det valda spåret. |
| Avslut | Dokumentation och en simulator-demo finns. | Stäm av överenskomna leveranser, slutdemo, eventuell GDPR-dokumentation och utbildningens krav med handledaren. |

De avbockade punkterna i detta dokuments checklista gäller **förstudien**, inte hela eID-integrationen eller hela LIA:n. Det finns inte tillräckligt underlag för en tillförlitlig procentsats för hela LIA-perioden.

Mer information: [auth-inventering](./eid-auth-inventory-alt2-1.md), [eID-PoC och testplan](./eid-oidc-poc-alt2-3.md) och [tillgänglighetsresultat](../client-participation-alpha/docs/a11y-manual-results-week-11-12.md).

## Checklista

* [x] Bekräfta Idura-sandbox och tidsplan **(bekräftat enligt Mustafa)**
* [x] Jämföra broker-alternativ (Idura, Signicat, GrandID, Sweden Connect)
* [x] Lista krav från organisationen (kontrakt, testkonto, redirect-URI)
* [x] Spike-plan: mock OIDC-simulator vs riktig Idura-sandbox
* [x] Risker: miljö, hemligheter, GDPR, XID-konflikt
* [x] Rekommendation + nästa steg till Alt 2.3

## Broker-jämförelse

Polis integrerar **inte** BankID/Freja direkt. Standardväg: **OIDC-broker med JWKS** (det Polis-servern redan validerar).

| Leverantör | BankID (SE) | Freja eID | Gratis sandbox | Produktion (ungefär) | OIDC + JWKS | Kommentar |
|------------|-------------|-----------|----------------|----------------------|-------------|-----------|
| **Idura** (tidigare Criipto) | Ja | Ja | Ja (Verify-sandbox, inget kreditkort) | Ca från EUR 67/mån + per BankID-inloggning | Ja | **Rekommenderad** i praktikplan |
| Signicat | Ja | Ja | Demo | Enterprise (kontakta sälj) | Ja | Tung/enterprise |
| Svensk e-identitet / GrandID | Ja | Delvis | Begränsad | Varierar | Varierar | Mindre tydlig OIDC-standardväg |
| Sweden Connect | Via federation | Via federation | Via offentlig sektor | Offentlig eIDAS-nod | Ja (federation) | Mer relevant för myndigheter än LIA-MVP |
| Native BankID SDK | Ja | Nej | Nej | Lång ledtid | Nej | **Ej i scope** (praktikplan A5) |

**Praktiskt för LIA:** Idura Verify-sandbox räcker för utveckling. Produktion kräver Swedbank-godkännande via Idura (veckor till månader).

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

## Ursprunglig spike-plan

### A) Utan Idura (mock)

1. Använd befintlig `oidc-simulator` (`AUTH_ISSUER=https://localhost:3000/`)
2. Dokumentera env-byten som senare pekas om till Idura:
   * `AUTH_ISSUER`, `AUTH_AUDIENCE`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, JWKS-URI
3. Skissa deltagarflöde i alpha: **Logga in** → OIDC redirect → `oidc_user_mappings` → **Standard User JWT** (samma som inventering A1)
4. Definiera regel för XID + OIDC-konflikt (redan UI-varning finns)

### B) Med Idura-sandbox

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
3. Simulator-PoC finns; verifiera nu Idura-flödet med BankID/Freja-testanvändare enligt [testplanen](./eid-oidc-poc-alt2-3.md).

## Nästa steg → Alt 2.3

* [x] Idura-sandbox och tidsplan bekräftade enligt Mustafa
* [x] PoC och simulator-demo dokumenterade i Alt 2.3
* [ ] Verifiera riktig BankID/Freja-login och API-flöde mot Idura-sandbox
* [ ] Code review av de lokala Idura-ändringarna

