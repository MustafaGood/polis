# Alt 2.2 — BankID/eID: krav, alternativ & spike

**Författare:** Mustafa Salahuddin  
**Efter:** Alt 2.1 inventering (`docs/eid-auth-inventory-alt2-1.md`)  
**Branch (förslag):** `feature/eid-requirements-spike`  
**Status:** Pågår

## Mål

Besluta rekommenderad väg för OIDC-broker (BankID/Freja) och dokumentera vad som går lokalt vs kräver Idura/org.

## Checklista

- [ ] Bekräfta med mentor: finns Idura-sandbox / tidplan?
- [ ] Jämföra broker-alternativ (kort tabell): Idura, Sweden Connect / annan OIDC med JWKS
- [ ] Lista krav: redirect URI, claims (sub, ej personnummer), testanvändare, acr/LOA (valfritt)
- [ ] Spike-plan: mock OIDC (befintlig simulator) vs riktig Idura-sandbox
- [ ] Risker: GDPR, XID-konflikt, ledtid produktion
- [ ] Rekommendation + nästa steg till Alt 2.3 (PoC/PR)

## Broker-jämförelse (utkast — fyll i under arbetet)

| Leverantör | BankID | Freja | Gratis sandbox | OIDC + JWKS | Kommentar |
|------------|--------|-------|----------------|-------------|-----------|
| Idura (Criipto) | Ja | Ja | Ja (enligt praktikplan) | Ja | Rekommenderad i praktikplan |
| Sweden Connect | — | — | — | — | Offentlig sektor / eIDAS |
| Annan | — | — | — | — | Endast om OIDC+JWKS |

## Spike (när sandbox saknas)

1. Behåll lokal `oidc-simulator` som stand-in för broker-flöde  
2. Dokumentera exakt env-byten (`AUTH_ISSUER`, client id/secret, redirect)  
3. Skissa alpha: inloggningsknapp → OIDC → standard-user JWT  
4. Ingen lagring av personnummer

## Blocker

Organisationen måste lösa Idura-avtal/sandbox för riktig BankID/Freja-test.
