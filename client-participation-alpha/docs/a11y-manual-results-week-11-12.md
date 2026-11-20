# Resultat av manuell tillgänglighetstestning och i18n (vecka 11 och 12)

**Datum:** 2026-08-03  
**Branch:** `feature/a11y-manual-i18n`  
**Konversation:** `52czbnk3jn`  
**URL:** `http://127.0.0.1:4321/52czbnk3jn`  
**Checklista:** [a11y-manual-checklist.md](./a11y-manual-checklist.md)

## Metod

1. **Kodgranskning** av ändringar i P0 och P1 (labels, live regions, fokus, modal)
2. **Kontroll av DOM** via SSR HTML (`curl` mot alpha)
3. **Automatiserade tester med axe** från vecka 9 och 10 (jest-axe + cypress-axe)
4. **i18n:** `?ui_lang=fr` verifierad i HTML

Full skärmläsar-session (NVDA/VoiceOver) rekommenderas fortfarande som manuell stickprov.

## Resultat per område

| Område                | Status              | Evidens                                                                                                                        |
| --------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Rösta                 | Pass             | `aria-label` på Agree/Disagree/Pass i DOM; jest-axe Statement; cypress-axe `.statement-card`                                   |
| Statement-form        | Pass             | `label for="comment-textarea"`; `aria-invalid`; jest-axe SurveyForm; cypress-axe `.submit-form`                                |
| E-post                | Pass (kod + axe) | Labels + `role="alert"`/`status` i kod; jest-axe EmailSubscribeForm                                                            |
| Invite                | Pass (kod + axe) | Labels + alert/status i kod; jest-axe InviteCodeSubmissionForm                                                                 |
| Modal (Treevite)      | Pass (kod)       | `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape/fokusfälla i `TreeviteLoginCodeModal` (ej live-trigger denna session) |
| Landmarks             | Pass             | `<main>` i Layout + SSR-HTML                                                                                                   |
| i18n                  | Pass             | `?ui_lang=fr` → "En accord" / "En désaccord" / fransk write-prompt                                                             |
| HTML i översättningar | Pass             | Trasiga `<b>`/`</b>` och orphan `</i>` fixade (en_us + spegling)                                                               |

## Fynd som åtgärdades denna sprint

* Trasiga boldtaggar i hjälptexter och tips (`en_us` + ar/bs/es_la/hr/my/ps/sw/vi)
* Ensamma `</i>` i bland annat zh, pt_br, nl, it, da och fy_nl

## Kvar / rekommendation

* [ ] Ett manuellt stickprov med NVDA eller VoiceOver för röstning och inskick av påstående
* [ ] Testa modalen i Treevite i webbläsaren när inbjudningsflödet är tillgängligt
* [ ] API för e-post returnerar 404 i utvecklingsmiljön. Felmeddelandets live region fungerar, men produktfelet ligger utanför tillgänglighetsarbetet.

## Koppling till tidigare PR:er

| PR         | Innehåll                                                |
| ---------- | ------------------------------------------------------- |
| #1         | Labels, live regions, `:focus-visible`, modal, `<main>` |
| #2         | `aria-describedby` / `aria-invalid`, `aria-pressed`     |
| #3         | PCA textalternativ                                      |
| #4         | jest-axe + cypress-axe                                  |
| #5 (denna) | Korrigering av HTML för i18n samt manuell checklista och resultat |
