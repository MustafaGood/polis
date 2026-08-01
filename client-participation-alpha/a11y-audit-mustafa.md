# WCAG 2.1 AA Audit-rapport — client-participation-alpha

**Författare:** Mustafa  
**Scope:** P0 (formulär, live regions, focus-visible, modaler)  
**Standard:** WCAG 2.1 AA  
**Datum:** 2026-08-01  
**Metod:** Statisk kodgranskning av working tree  
**Miljö:** `npm run verify` grön (Jest 29.7, 88 tester)

---

## Sammanfattning

| Status | Antal |
|--------|------:|
| P0 öppna | 8 |
| Delvis OK / redan på plats | 4 |

Högst prioritet: **saknade labels** på tre formulär, **saknade live regions** på fel/success, **modal utan Escape/fokusfälla**, **saknad global `:focus-visible`**.

---

## P0 — Öppna brister

### 1. Formulärlabels (WCAG 3.3.2 / 1.3.1)

| Komponent | Problem | Evidence |
|-----------|---------|----------|
| `EmailSubscribeForm.tsx` | E-postfält saknar `<label>` / `htmlFor` / `aria-label` | Endast `placeholder` |
| `SurveyForm.tsx` | Kommentar-textarea saknar synlig/programmatisk label | Endast `placeholder={s.writePrompt}` |
| `InviteCodeSubmissionForm.tsx` | Invite- och login-fält saknar labels | Placeholder-only |

**Åtgärd:** Lägg till synliga `<label htmlFor="…">` (eller `aria-label` om UI medvetet ska vara komprimerat). Placeholder räcker inte som enda label.

---

### 2. Live regions / statusmeddelanden (WCAG 4.1.3 / 3.3.1)

| Komponent | Problem | Evidence |
|-----------|---------|----------|
| `SurveyForm.tsx` | Success/error är vanliga `<p>` utan `role`/`aria-live` | Feedback-/error-block |
| `EmailSubscribeForm.tsx` | Success och `.subscribe-error` annonseras inte | Success `<p>` / error `<p>` |
| `Statement.tsx` | `voteError` utan live region | `{voteError && <p className="vote-error">…}` |

**Redan OK:** `InviteCodeSubmissionForm.tsx` har `role="status"` (success) och `role="alert"` (error).

**Åtgärd:** Success → `role="status"` (eller `aria-live="polite"`). Fel → `role="alert"` (eller `aria-live="assertive"`).

---

### 3. Focus visible (WCAG 2.4.7)

| Plats | Problem | Evidence |
|-------|---------|----------|
| `global.css` | Ingen global `:focus-visible` för interaktiva element | Endast `.vis-control-btn:focus-visible` |
| `InviteCodeSubmissionForm.tsx` | `outline: none` på inputs | Delvis kompenserad med `:focus` border/box-shadow |

**Åtgärd:** Global regel för `a`, `button`, `input`, `textarea`, `[tabindex]`. Ta inte bort outline utan synlig ersättning.

---

### 4. Modaler (WCAG 2.1.1 / 2.4.3 / 4.1.2)

**Fil:** `TreeviteLoginCodeModal.tsx`

| Krav | Status |
|------|--------|
| `role="dialog"` + `aria-modal="true"` | OK |
| `aria-labelledby` / `aria-label` | Saknas |
| Escape stänger | Saknas |
| Fokusfälla + initial fokus | Saknas |
| Fokus återställs vid stängning | Saknas |

**Åtgärd:** `aria-labelledby` till titel-id, Escape → close, fokus in i dialogen vid öppning, Tab-cykel inom dialogen, återställ fokus till trigger vid stängning.

---

## Redan på plats (relevant för P0)

- `Statement.tsx`: `aria-label` på agree/disagree/pass; `<label htmlFor="important">` för importance-checkbox
- `InviteCodeSubmissionForm.tsx`: `role="status"` / `role="alert"`
- `TreeviteLoginCodeModal.tsx`: grundläggande dialog-roller
- Viz-kontroller: lokal `:focus-visible` i `global.css`

---

## Föreslagen PR #1-ordning

1. Labels på `SurveyForm`, `InviteCodeSubmissionForm`, `EmailSubscribeForm`
2. Live regions på SurveyForm, EmailSubscribeForm, Statement `voteError`
3. Global `:focus-visible` (+ se över `outline: none`)
4. Treevite-modal: labelledby, Escape, fokusfälla, fokus-restore

---

## Utanför P0-kärnan (nästa sprint)

| Gap | Fil | Kriterium |
|-----|-----|-----------|
| Ingen `<main>` / `<nav>` | `Layout.astro` | 1.3.1 / 2.4.1 |
| PCA SVG utan textalternativ | `PCAVisualization.tsx` | 1.1.1 |
| Toggle-knappar utan `aria-pressed` | `VisualizationControls.tsx` | 4.1.2 |

---

## Checklista

```
[ ] EmailSubscribeForm — label på email-input
[ ] SurveyForm — label på textarea
[ ] InviteCodeSubmissionForm — labels på invite + login
[ ] SurveyForm — role=status / role=alert
[ ] EmailSubscribeForm — live regions för success/error
[ ] Statement — role=alert på voteError
[ ] global.css — :focus-visible för a/button/input/textarea
[ ] TreeviteLoginCodeModal — aria-labelledby + Escape + focus trap + restore
```
