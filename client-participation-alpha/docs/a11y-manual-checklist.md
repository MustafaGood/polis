# Manuell a11y-checklista — client-participation-alpha

**Vecka 11–12 (P1)** · WCAG 2.1 AA · Konversation: `52czbnk3jn`  
**URL:** `http://127.0.0.1:4321/52czbnk3jn` (undvik Cursor-browser HTTPS-certfel)

Markera: Pass · Delvis · Fail · N/A · Ej testat

**Kompletterande webbläsarkontroll 2026-11-18:** Delar av tangentbordstestet
kördes med simulerade tangenttryck i Chromium mot isolerade komponenter och
mockade API-svar. Resultat märkta "Delvis" nedan gäller endast den testmiljön,
inte hela liveflödet eller en skärmläsare.

**Kod- och testuppdatering 2026-11-23:** Vote-success status och textalternativ
för PCA-grupper, koordinater och deltagarens klusterposition har lagts till.
Komponenttester täcker vissa tangentbordsflöden. Detta är inte en manuell
skärmläsarbedömning; checkliststatus nedan ändras inte till Pass utan manuell
kontroll.

---

## Förutsättningar

- [ ] Dev-stack igång (alpha på :4321 eller `/alpha/` via nginx)
- [ ] Tangentbord endast (mus bort)
- [ ] Synlig fokusring (`:focus-visible`) syns
- [ ] (Valfritt) Skärmläsare: NVDA (Win) / VoiceOver (macOS)

---

## 1. Rösta (Statement)

| #   | Check                                                      | Resultat  | Anteckning |
| --- | ---------------------------------------------------------- | --------- | ---------- |
| 1.1 | Tab når Agree / Disagree / Pass i logisk ordning           | Delvis    | Chromium, isolerad komponent; 3 px fokusring |
| 1.2 | Enter/Space aktiverar röstknapp                            | Delvis    | Space på Agree med mockad röst; övriga kombinationer ej testade |
| 1.3 | Knappar har tillgängligt namn (aria-label / text)          | Ej testat |            |
| 1.4 | Efter röst: nästa statement eller slutvy utan fokusförlust | Ej testat |            |
| 1.5 | `role="alert"` vid vote-fel (om simulerat)                 | Ej testat |            |
| 1.6 | Importance-checkbox (om aktiverad) har synlig label        | Ej testat |            |

**Skärmläsare:** knappar tillkännages med namn; fel läses upp.

---

## 2. Skicka statement (SurveyForm)

| #   | Check                                                         | Resultat  | Anteckning |
| --- | ------------------------------------------------------------- | --------- | ---------- |
| 2.1 | Label kopplad till textarea (`htmlFor` / `id`)                | Ej testat |            |
| 2.2 | Tab: label-kontext → textarea → Submit                        | Delvis    | Chromium, isolerad komponent och synlig fokusring |
| 2.3 | Submit disabled tills text finns; Tab till knappen och Enter/Space aktiverar den | Delvis | Enter testat med mockat API; Space ej testat |
| 2.4 | Framgång: `role="status"` (live region)                       | Ej testat |            |
| 2.5 | Fel annonseras; duplicerad text kopplas till fältet som ogiltig | Ej testat |            |
| 2.6 | Hjälptext HTML (`<b>`) renderas korrekt (inga trasiga taggar) | Ej testat |            |
| 2.7 | Teckengränsen och räknaren visar 400 även på andra språk; texten finns kvar under inskick och vid fel | Delvis | Engelska och mockat API testat; andra språk ej körda i webbläsare |

---

## 3. E-postformulär (EmailSubscribeForm)

_Visas ofta när statements är slut._

| #   | Check                                                 | Resultat  | Anteckning |
| --- | ----------------------------------------------------- | --------- | ---------- |
| 3.1 | Synlig label för e-postfält                           | Ej testat |            |
| 3.2 | Tab till input → Subscribe                            | Delvis    | Chromium, isolerad komponent och synlig fokusring |
| 3.3 | API-fel annonseras och kopplas till fältet utan att ange en giltig adress som ogiltig | Ej testat |            |
| 3.4 | Framgång via `role="status"`                          | Ej testat |            |
| 3.5 | Ogiltig e-post kan skickas till webbläsarens validering och ingen API-begäran görs | Delvis | Chromium med mockat API |

---

## 4. Invite / login-kod (InviteCodeSubmissionForm)

_Om treevite/invite krävs._

| #   | Check                                             | Resultat  | Anteckning |
| --- | ------------------------------------------------- | --------- | ---------- |
| 4.1 | Båda fälten har synliga labels                    | Ej testat |            |
| 4.2 | Ogiltig kod annonseras och anges på rätt fält; nätverksfel anges inte som ogiltig kod | Ej testat |            |
| 4.3 | Framgång: `role="status"`                         | Ej testat |            |
| 4.4 | Endast blanksteg kan inte skickas; det andra kodformuläret väntar medan ett inskick pågår | Delvis | Blanksteg och upprepat inskick testade i Chromium; båda formulärens samtidighet testad med Jest |

---

## 5. Modal (TreeviteLoginCodeModal)

Automatiserade Jest-tester täcker fokus, Tab, Escape, dialogens beskrivning,
kopieringsfel och återgång till deltagandet när formuläret har försvunnit.
Tabellen nedan gäller fortfarande manuella kontroller i det verkliga flödet.

| #   | Check                                            | Resultat  | Anteckning |
| --- | ------------------------------------------------ | --------- | ---------- |
| 5.1 | Fokus flyttas in i modal vid öppning             | Ej testat |            |
| 5.2 | Tab fångas inne i modal (fokusfälla)             | Ej testat |            |
| 5.3 | Escape stänger modal                             | Ej testat |            |
| 5.4 | Fokus återställs till utlösaren eller deltagandet om utlösaren försvunnit | Ej testat | |
| 5.5 | `aria-labelledby` / `aria-describedby` på dialog | Ej testat |            |

---

## 6. Landmarks & i18n-smoke

| #   | Check                                                   | Resultat  | Anteckning |
| --- | ------------------------------------------------------- | --------- | ---------- |
| 6.1 | Sidan har `<main>` (landmark)                           | Ej testat |            |
| 6.2 | Skip/tab-ordning känns logisk top→bottom                | Ej testat |            |
| 6.3 | `?ui_lang=fr` byter UI-strängar (Agree → franska m.m.)  | Ej testat |            |
| 6.4 | `?ui_lang=sv` eller Accept-Language påverkar UI rimligt | Ej testat |            |

---

## 7. PCA-visualisering

| #   | Check | Resultat | Anteckning |
| --- | ----- | -------- | ---------- |
| 7.1 | Tangentbord kan öppna och stänga textbeskrivningen | Ej testat | Komponenttest täcker tangentbordsaktivering av Consensus- och gruppknappar |
| 7.2 | Gruppantal, PCA 1/2-intervall, centrum och koordinatlistor motsvarar grafens data | Ej testat | Textalternativ finns i en utfällbar beskrivning; jämför mot grafen manuellt |
| 7.3 | Egen klusterposition läses begripligt när den finns | Ej testat | Beskrivningen använder klustrets PCA-koordinater, inte en separat exakt individpunkt |
| 7.4 | Grupp- och påståendekontroller har begripligt namn och aktuellt valt tillstånd | Delvis | Namn/`aria-pressed` testas i Jest; skärmläsare återstår |
| 7.5 | Röstdatatabellens rubriker och gruppvärden förstås med skärmläsare | Ej testat | Jest kontrollerar tabellsemantik, inte NVDA/VoiceOver |

**Skärmläsare:** kontrollera att disclosure-namnet, gruppbeskrivningarna,
koordinatlistorna, deltagarpositionen och vald status går att hitta och förstå
med NVDA/VoiceOver.

---

## 8. Fullständig manuell tangentbordsgranskning av liveflöden

**Status: Ej utförd.** Använd denna sektion för ett separat, dokumenterat
genomspel på en dedikerad testmiljö. Röstning, kommentarer, prenumeration,
invite och login kan skapa eller ändra data. Använd inte produktionsdata eller
en gemensam databas.

### Körningsuppgifter

| Fält | Värde |
| --- | --- |
| Datum / testare | Ej ifyllt |
| Gren / commit | Ej ifyllt |
| Miljö / testkonversation | Ej ifyllt |
| Webbläsare / version | Ej ifyllt |
| Operativsystem | Ej ifyllt |
| Språk / zoomnivå | Ej ifyllt |
| Skärmläsare / version (om använd) | Ej ifyllt |

### Resultat för tangentbordsflöden

Markera varje rad Pass / Delvis / Fail / N/A och ange observationer. Kör först
med tangentbord utan mus. Starta om från en ren konversationssida mellan
flödena där det behövs.

| Flöde | Manuell kontroll | Kriterier | Resultat / anteckning |
| --- | --- | --- | --- |
| Sidnavigation | Ladda konversationen och tabba från sidstart. Kontrollera att fokus är synligt hela tiden, ordningen är begriplig, sidans huvuddel går att nå och inget element fångar fokus. | 2.1.1, 2.1.2, 2.4.3, 2.4.7 | Ej testat |
| Röstning | Tabba till Agree, Disagree och Pass. Aktivera var och en separat med Enter och Space i testkonversation. Kontrollera fokus efter nästa påstående, slutvy och simulerat fel. | 2.1.1, 2.4.3, 2.4.7, 4.1.2, 4.1.3 | Ej testat |
| Skicka påstående | Tabba till textarea och Submit. Skicka ett testpåstående med Enter och prova tomt, ogiltigt och duplicerat svar. Kontrollera att text, fel, fokus och statusmeddelande hanteras utan mus. | 1.3.1, 2.1.1, 3.3.1, 3.3.2, 3.3.3, 4.1.3 | Ej testat |
| E-postformulär | I en konversation utan fler påståenden: tabba till e-postfält och Subscribe. Prova ogiltig adress, API-fel och testad lyckad prenumeration; kontrollera fokus när formuläret ersätts av bekräftelse. | 2.1.1, 2.4.3, 3.3.1, 3.3.2, 4.1.3 | Ej testat |
| Invite / login-kod | I en testkonversation som kräver invite: tabba genom båda formulären. Skicka giltig och ogiltig testkod med Enter. Kontrollera fältkopplade fel, status och återhämtning efter fel. | 2.1.1, 2.4.3, 3.3.1, 3.3.2, 4.1.3 | Ej testat |
| Login-modal | Öppna login-kodsmodalen via inviteflödet. Kontrollera startfokus, Tab och Shift+Tab-gränser, Escape, kopieringsknapp samt fokusåtergång även om utlösaren försvinner. | 2.1.1, 2.1.2, 2.4.3, 4.1.2 | Ej testat |
| PCA | Öppna textbeskrivningen med tangentbord. Gå igenom gruppkontroller, påståendekontroller och tabellen. Aktivera val med Enter/Space och kontrollera `aria-pressed`, status och fokus. Jämför koordinatlistor med grafen. | 1.1.1, 1.3.1, 2.1.1, 2.4.3, 4.1.2, 4.1.3 | Ej testat |
| OIDC-simulator | Om simulatorn är konfigurerad: kör inloggning och utloggning med tangentbord, inklusive avbruten login och felåterhämtning. Detta verifierar inte BankID/Freja i Idura-sandbox. | 2.1.1, 2.4.3, 3.3.1, 4.1.2, 4.1.3 | Ej testat |

### Avslut och rapportering

- [ ] Alla kontroller som gäller har fått ett resultat och observation.
- [ ] Fail/Delvis har ett reproducerbart steg, förväntat resultat och faktiskt resultat.
- [ ] Testdata har skapats endast i den dedikerade testmiljön och har hanterats enligt projektets testdataregler.
- [ ] Sammanfattningen skiljer mellan tangentbordstest, automatisk axe-körning och eventuell skärmläsartestning.

---

## Historisk sammanfattning (kod och automatiserade kontroller)

Denna sammanfattning är inte ett resultat av de manuella kontrollerna ovan.
Kontrollernas aktuella status och testmiljö anges i respektive tabell.

| Område           | Status           | Blockerande fynd                   |
| ---------------- | ---------------- | ---------------------------------- |
| Rösta            | Pass             | —                                  |
| Statement-form   | Pass             | —                                  |
| E-post           | Pass (kod + axe) | API 404 i dev (ej a11y)            |
| Invite           | Pass (kod + axe) | —                                  |
| Modal            | Pass (kod)       | Live-trigger ej kört denna session |
| Landmarks / i18n | Pass             | —                                  |

**Testare:** Mustafa (DOM-smoke + kod + axe; skärmläsare stickprov rekommenderas)  
**Datum:** 2026-08-03  
**Miljö:** Windows 10, alpha `http://127.0.0.1:4321`, Chromium via Cypress tidigare

Se även: [a11y-manual-results-week-11-12.md](./a11y-manual-results-week-11-12.md)
