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

**Isolerad komponentkontroll 2026-11-23:** Chromium körde de riktiga
deltagarkomponenterna med syntetiska data och simulerade tangenttryck, utan
server eller databas. Samtliga 21 fokusstopp i den uppsättningen hade ett
beräknat fokus-outline; kontrollen omfattade röstning, formulär,
invite/login och PCA, inklusive knappar som först aktiverades med testtext.
Två knappar i login-kodsmodalen fick också fokus-outline efter
tangentbordsnavigation. En fokuserad röstknapp granskades visuellt.
Andra vyer, teman, webbläsare och det verkliga flödet återstår.

**Användarrapport 2026-11-24, formulärfel:** Användaren uppgav att
Skärmläsaren läste upp fel för duplicerat påstående, ogiltig e-postadress,
ogiltig inbjudningskod och ogiltig inloggningskod efter instruktioner för den
isolerade testmiljön. Uppläsningen och de exakta testförhållandena kunde inte
observeras självständigt; på den delade sidan syntes ingen alert vid
efterkontrollen. E-postfallet avsåg webbläsarens validering, inte API-fel.
Nätverksfel, andra formulärfall och en fullständig skärmläsargranskning
återstår.

**Utökad axe-kontroll 2026-11-24:** Helsidesskanning hittade kontrastbrister
i inviteformulärets separator och knapp under inskick. Färgerna justerades.
Efter ombyggnad passerade 13 Cypress-tester i isolerad miljö. De omfattade
deltagarsida, duplikatfel, inviteformulär, ogiltiga koder, väntande inskick
och en simulerad kodmodal utan kritiska eller allvarliga axe-fynd.
Modalens fokus, Tab och Escape kontrollerades med simulerade tangenttryck.
Detta ersätter inte en fullständig manuell granskning.

**Användarrapport 2026-11-24, tangentbord:** Efter instruktioner att tabba
genom röstknappar, påståendefält, Submit och sidfotslänkar på den isolerade
deltagarsidan uppgav användaren att synliga kontroller kunde nås, att fokus
syntes och att ingen tangentbordsfälla uppstod. De exakta förhållandena
observerades inte självständigt; övriga tillstånd och hela flöden återstår.
Efter instruktioner för den separata invitevyn uppgav användaren också att
båda kodformulären nåddes och skickades med Enter, fokus syntes och det gick
att navigera vidare efter felen.

**Utökad fel- och PCA-kontroll 2026-11-24:** Den utökade Cypress-sviten med
11 tester passerade, inklusive simulerade HTTP 503-fel vid röstning, påståenden och
e-post. Axe hittade inga kritiska eller allvarliga fel i dessa tillstånd;
ingen e-postprenumeration skapades. En separat skanning av livegrafen med
grupp A och påstående 0 valda gav inga WCAG 2.0/2.1 A/AA-fynd, men sju
kontrastpunkter kräver manuell bedömning. Uppmätta gruppetiketter hade
kontrast 5,22:1 som valda och 10,31:1 som icke valda; övriga punkter återstår.
Användaren uppgav att ett simulerat serverfel för påståenden lästes upp, men
inget fel syntes vid direkt efterkontroll. Därefter utlöste assistenten
serverfelet och såg en alert; användarens interaktion och uppläsningen kunde
inte bekräftas självständigt. Användaren kunde inte genomföra
skärmläsarkontrollen av PCA-tabellen.

---

## Förutsättningar

- [ ] Dev-stack igång (alpha på :4321 eller `/alpha/` via nginx)
- [ ] Tangentbord endast (mus bort)
- [ ] Synlig fokusring (`:focus-visible`) syns
- [ ] (Valfritt) Skärmläsare: NVDA (Win) / VoiceOver (macOS)

---

## 1. Rösta (Statement)

| #   | Check                                                      | Resultat  | Anteckning                                                                                                                        |
| --- | ---------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Tab når Agree / Disagree / Pass i logisk ordning           | Delvis    | Simulerad Tab i isolerad livekonversation; samtliga tre hade fokusring                                                            |
| 1.2 | Enter/Space aktiverar röstknapp                            | Delvis    | Alla sex knapp- och tangentkombinationer testade med simulerade HTTP 200-svar; tre kombinationer tidigare med verkliga teströster |
| 1.3 | Knappar har tillgängligt namn (aria-label / text)          | Delvis    | Namn synliga i Chromiums tillgänglighetsträd; skärmläsare återstår                                                                |
| 1.4 | Efter röst: nästa statement eller slutvy utan fokusförlust | Delvis    | Fokusförlust hittades och åtgärdades; livekontroll gav fokus på röstknappen vid nästa statement och e-postfältet i slutvyn        |
| 1.5 | `role="alert"` vid vote-fel (om simulerat)                 | Delvis    | Simulerat HTTP 503 gav alert och fokus åter till Disagree; användaren uppger att röstfelet lästes upp med Skärmläsaren            |
| 1.6 | Importance-checkbox (om aktiverad) har synlig label        | Ej testat |                                                                                                                                   |

**Skärmläsare:** knappar tillkännages med namn; fel läses upp.

**Användarrapport 2026-11-24:** Efter instruktioner att rösta med Enter på
den delade isolerade testsidan uppgav användaren att bekräftelsen hördes med
Windows Skärmläsaren. Uppläsningen och exakta testförhållanden observerades
inte självständigt; övriga skärmläsarflöden återstår.

---

## 2. Skicka statement (SurveyForm)

| #   | Check                                                                                                 | Resultat | Anteckning                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Label kopplad till textarea (`htmlFor` / `id`)                                                        | Pass     | Isolerad livekonversation, Chromium/engelska                                                                                                                                  |
| 2.2 | Tab: label-kontext → textarea → Submit                                                                | Delvis   | Simulerad Tab i isolerad livekonversation; fokusring och fältetikett kontrollerade, skärmläsare återstår                                                                      |
| 2.3 | Submit disabled tills text finns; Tab till knappen och Enter/Space aktiverar den                      | Pass     | Tomt och enbart blanksteg blockerades; Enter och Space skickade var sitt syntetiskt påstående i isolerad livekonversation                                                     |
| 2.4 | Framgång: `role="status"` (live region)                                                               | Pass     | Statusmeddelande visades efter båda lyckade inskicken; uppläsning återstår                                                                                                    |
| 2.5 | Fel annonseras; duplicerad text kopplas till fältet som ogiltig                                       | Delvis   | Verkligt duplikat gav HTTP 409, alert och `aria-invalid`; simulerat HTTP 503 gav alert utan ogiltigmarkering. Användaren uppger att formulärfelet lästes upp med Skärmläsaren |
| 2.6 | Hjälptext HTML (`<b>`) renderas korrekt (inga trasiga taggar)                                         | Pass     | Fetstilselement och text kontrollerade i isolerad livekonversation, engelska                                                                                                  |
| 2.7 | Teckengränsen och räknaren visar 400 även på andra språk; texten finns kvar under inskick och vid fel | Delvis   | Engelska: 401 tangenttryck begränsades till 400 och räknaren visade 400; text kvar vid fel. Andra språk ej testade                                                            |

**Isolerad formulärkontroll 2026-11-23:** Simulerade tangenttryck i Chromium
mot konversation `2ckftjy8sn`. Två nya syntetiska påståenden skickades med
Enter respektive Space och gav HTTP 200; fokus återgick till textfältet.
Ett duplikat gav HTTP 409 och felmarkeringen försvann vid redigering.
Ett separat simulerat HTTP 503 behöll texten och gav generiskt fel utan att
markera den som ogiltig. Inga skärmläsarmeddelanden har lyssnats på.

---

## 3. E-postformulär (EmailSubscribeForm)

_Visas ofta när statements är slut._

| #   | Check                                                                                 | Resultat | Anteckning                                                                                                         |
| --- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| 3.1 | Synlig label för e-postfält                                                           | Pass     | Isolerad livekonversation, Chromium/engelska                                                                       |
| 3.2 | Tab till input → Subscribe                                                            | Delvis   | Simulerad Tab i isolerad livekonversation; båda fick fokus-outline, fältets fokusring granskades visuellt          |
| 3.3 | API-fel annonseras och kopplas till fältet utan att ange en giltig adress som ogiltig | Delvis   | Simulerat HTTP 503 gav alert kopplat till fältet utan `aria-invalid`; skärmläsare återstår                         |
| 3.4 | Framgång via `role="status"`                                                          | Delvis   | Simulerat HTTP 200 gav status och flyttade fokus till meddelandet; verklig prenumeration och uppläsning ej testade |
| 3.5 | Ogiltig e-post kan skickas till webbläsarens validering och ingen API-begäran görs    | Delvis   | Chromium: adress utan `@` gav inbyggd validering, fokus på fältet och noll API-anrop                               |

**Isolerad e-postkontroll 2026-11-23:** Simulerade tangenttryck i Chromium
mot konversation `2ckftjy8sn`. Enter på ogiltig adress stoppades av
webbläsaren. Därefter testades API-fel med simulerat HTTP 503 och lyckat svar
med simulerat HTTP 200 och Space. Felmeddelandet försvann vid redigering,
och framgångsmeddelandet fick fokus. API-svaren fångades upp i webbläsaren:
ingen prenumeration skapades. Skärmläsare och verkligt backend-svar återstår.

---

## 4. Invite / login-kod (InviteCodeSubmissionForm)

_Om treevite/invite krävs._

| #   | Check                                                                                     | Resultat | Anteckning                                                                                                                |
| --- | ----------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Båda fälten har synliga labels                                                            | Pass     | Isolerad invitekonversation, Chromium/engelska                                                                            |
| 4.2 | Ogiltig kod annonseras och anges på rätt fält; nätverksfel anges inte som ogiltig kod     | Delvis   | Ogiltiga syntetiska koder gav verkliga HTTP 400/401 och fältkopplade alerts; användaren uppger att invitefelet lästes upp |
| 4.3 | Framgång: `role="status"`                                                                 | Delvis   | Verklig testinloggning gav status efter fix; skärmläsaruppläsning återstår                                                |
| 4.4 | Endast blanksteg kan inte skickas; det andra kodformuläret väntar medan ett inskick pågår | Delvis   | Blanksteg och upprepat inskick testade i Chromium; båda formulärens samtidighet testad med Jest                           |

---

## 5. Modal (TreeviteLoginCodeModal)

Automatiserade Jest-tester täcker fokus, Tab, Escape, dialogens beskrivning,
kopieringsfel och återgång till deltagandet när formuläret har försvunnit.
Tabellen nedan gäller fortfarande manuella kontroller i det verkliga flödet.

| #   | Check                                                                     | Resultat | Anteckning                                              |
| --- | ------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| 5.1 | Fokus flyttas in i modal vid öppning                                      | Delvis   | Giltig testinbjudan öppnade modalen med fokus på OK     |
| 5.2 | Tab fångas inne i modal (fokusfälla)                                      | Delvis   | Tab och Shift+Tab kontrollerade mellan båda knapparna   |
| 5.3 | Escape stänger modal                                                      | Delvis   | Kontrollerat med giltig testinbjudan                    |
| 5.4 | Fokus återställs till utlösaren eller deltagandet om utlösaren försvunnit | Delvis   | Fokus återgick till deltagandet när formuläret försvann |
| 5.5 | `aria-labelledby` / `aria-describedby` på dialog                          | Delvis   | Attributen fanns; skärmläsare återstår                  |

**Isolerad invite- och modalkontroll 2026-11-24:** I den separata
testkonversationen `22whrfmsd3` användes simulerade tangenttryck. Verkliga
ogiltiga syntetiska invite- och loginkoder gav fältkopplade fel. För att
öppna modalen simulerades ett lyckat invite-svar med en syntetisk kod;
ingen giltig kod löstes in och ingen faktisk inloggning gjordes. Testet
verifierar inte skärmläsaruppläsning eller hela det verkliga framgångsflödet.
Användaren uppgav senare att invitefelet lästes upp med Windows Skärmläsaren;
felmeddelandet syntes inte vid efterkontrollen, så uppläsningen är endast
användarrapporterad. Nätverksfel och övriga uppläsningsfall återstår.

**Verkligt inviteflöde i isolerad miljö 2026-11-24:** Giltiga syntetiska
inbjudningar löstes in och den utfärdade testkoden användes för återinloggning.
API-svaren var HTTP 201 respektive 200. Med simulerade tangenttryck i Chromium
fungerade Enter, modalens Tab/Shift+Tab och Escape, och fokus återvände till
deltagandet. Ett separat Cypress-test med Space passerade båda flödena.
Cypress `cy.press(Enter)` skickade däremot ingen begäran i vare sig Electron
eller Chrome, medan Playwrights Enter fungerade. På en fristående HTML-knapp
gav Cypress 15.8.1 Enter tangentbordshändelser men inget klick eller submit,
medan Space fungerade. Cypress skickar Enter utan text i Chromium-protokollet.
I Electron gav ett direkt protokollanrop med Enter-text (carriage return)
klick och submit även utan tangentkod; enbart tangentkod gav det inte.
Det visar en skillnad i testverktygets inmatning i denna miljö, inte ett
påvisat appfel eller ett resultat för alla webbläsare.
Cypress har nu separata regressionstester med simulerad `.type('{enter}')`
på respektive fokuserad knapp och mockade felsvar. De kontrollerar att
förfrågan skickas och felet kopplas till rätt fält. Den isolerade sviten
passerade 3 av 3 tester i både Electron och Chrome, men ersätter inte manuell
tangentbords- eller skärmläsarkontroll.
Inloggningsbekräftelsen försvann först när formuläret avmonterades. Den har
flyttats till en bestående statusregion och kontrollerats efter en verklig
testinloggning. Faktisk skärmläsaruppläsning av framgång återstår.

---

## 6. Landmarks & i18n-smoke

| #   | Check                                                   | Resultat  | Anteckning                                                                                                         |
| --- | ------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| 6.1 | Sidan har `<main>` (landmark)                           | Delvis    | Finns i den isolerade konversationen med franska och svenska språkparametrar                                       |
| 6.2 | Skip/tab-ordning känns logisk top→bottom                | Ej testat |                                                                                                                    |
| 6.3 | `?ui_lang=fr` byter UI-strängar (Agree → franska m.m.)  | Delvis    | Röstknappar och nya PCA-texter visas på franska; vissa andra texter faller tillbaka till engelska                  |
| 6.4 | `?ui_lang=sv` eller Accept-Language påverkar UI rimligt | Delvis    | `ui_lang=sv` och svensk Accept-Language ger nu engelska standardsträngar med `lang="en"`; svenska är inte översatt |

**Isolerad språkkontroll 2026-11-23:** Med `ui_lang=fr` visades franska
röstknappar. PCA-texten föll först tillbaka till engelska; den och
röstbekräftelsen har översatts till franska. Den uppdaterade PCA-beskrivningen
kontrollerades i livegrafen och röstbekräftelsen med ett simulerat API-svar.
Med `ui_lang=sv` visades engelska standardsträngar trots `lang="sv"`.
Inga verkliga röster eller formulär skickades i denna kontroll. Övriga språk
och faktisk skärmläsaruppläsning återstår.

**Språkuppföljning 2026-11-24:** Efter användarens val används engelska som
dokumentspråk när det begärda språket saknar översättning. `ui_lang=sv` och
svensk Accept-Language kontrollerades i den isolerade klienten; franska
behöll `lang="fr"`. Användargenererat innehåll och engelska reservsträngar
i delvis översatta språk kan fortfarande behöva separat språkmarkering.

**Kompletterande axe-kontroll 2026-11-23:** En helsidesskanning i den
isolerade engelska konversationen hittade ett allvarligt kontrastfel på
sidfotens Privacy- och TOS-länkar: 2,84:1 mot kravet 4,5:1. Några SVG-textelement
kräver manuell kontrastkontroll. Den riktade Cypress-sviten för röstkort och
formulär passerade då 5/5.

**Uppföljning av sidfoten:** Länkfärgen har mörkats; kontrasten mot vit
bakgrund är cirka 5,74:1. En ny helsidesskanning av den isolerade engelska
konversationen rapporterade inga axe-fel, men SVG-textens kontrast behöver
fortfarande manuell granskning. Cypress-sviten omfattar nu även sidfoten och
passerade 6/6. Andra vyer och teman är inte verifierade av denna kontroll.

**PCA-kontrastuppföljning 2026-11-24:** I den isolerade grafen gav vald
grupps vita text på blå bakgrund tidigare cirka 2,63:1. Vald grupps knapp och
SVG-etikett använder nu en mörkare blå färg; beräknad kontrast är 5,22:1.
Övrig SVG-text och andra tillstånd är inte fullständigt granskade.

**Skärmläsarkontroll rapporterad av användaren 2026-11-23:** Användaren
uppgav att både röstfel och formulärfel lästes upp med Windows Skärmläsaren.
Testsidan hade förberetts med simulerade HTTP 503- respektive 409-svar.
Felens sluttillstånd syntes inte vid efterkontrollen i webbläsaren, så
observationen är användarrapporterad. Övriga formulär, fel och flöden återstår.

---

## 7. PCA-visualisering

| #   | Check                                                                             | Resultat  | Anteckning                                                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 | Tangentbord kan öppna och stänga textbeskrivningen                                | Delvis    | I isolerad livegraf öppnade Space beskrivningen och Enter öppnade båda formlistorna. Tidigare test stängde med Enter. Fullständig tangentbordsrunda återstår.                                                                    |
| 7.2 | Gruppantal, PCA 1/2-intervall, centrum och koordinatlistor motsvarar grafens data | Delvis    | I isolerad livegraf stämde antal och avrundade koordinater med API-data. Polygonens ordnade hörn, linjens ändpunkter och axelriktning kontrollerades också mot den aktuella grafen; fler datavarianter och skärmläsare återstår. |
| 7.3 | Egen klusterposition läses begripligt när den finns                               | Delvis    | Markören låg visuellt i grupp A och dess koordinater stämde med texten i det isolerade exemplet. Skärmläsarbedömning och fler datavarianter återstår.                                                                            |
| 7.4 | Grupp- och påståendekontroller har begripligt namn och aktuellt valt tillstånd    | Delvis    | Namn/`aria-pressed` testas i Jest; skärmläsare återstår                                                                                                                                                                          |
| 7.5 | Röstdatatabellens rubriker och gruppvärden förstås med skärmläsare                | Ej testat | Jest kontrollerar tabellsemantik, inte NVDA/VoiceOver                                                                                                                                                                            |

**Skärmläsare:** kontrollera att disclosure-namnet, gruppbeskrivningarna,
koordinatlistorna, deltagarpositionen och vald status går att hitta och förstå
med NVDA/VoiceOver.

**Isolerad PCA-kontroll 2026-11-23:** Egen Compose-testdatabas och syntetisk
konversation `2ckftjy8sn`; 12 syntetiska deltagare röstade. PCA-resultatet
innehöll totalt 13 deltagare.
Chromium visade grupp A till höger med 7 deltagare, grupp B till vänster med
6 och deltagarmarkören vid grupp A:s högra övre kant. Gruppantal, centrum,
intervall och samtliga sex avrundade klusterkoordinater jämfördes med
PCA-API:ets data. Textens deltagarposition (PCA 1 2.06, PCA 2 -0.684) låg
vid markören. Grafen ritade en yta för A och en linje för B; vid den kontrollen
angav texten inte formerna eller att ökande PCA 2 visas nedåt. Texten har därefter
kompletterats med axelriktningar och polygonhörn/linjeändpunkter baserade på
grafens faktiska geometri. Nio komponenttester täcker bland annat ordning,
sammanfallande punkter och grupper utan ritad form. En ny livejämförelse
kunde inte genomföras eftersom Docker gav serverfel och testsidan slutade svara.
Denna begränsade tidigare visuella
kontroll och simulerade tangenttryck verifierar inte skärmläsarförståelse,
full geometrisk likvärdighet eller WCAG-konformitet.

**Kompletterande webbläsarkontroll 2026-11-23:** Den aktuella PCA-komponenten
ritades med sex syntetiska koordinater i en isolerad komponentmiljö. Med den
faktiska hull-algoritmen motsvarade textens ordnade polygonhörn och
linjeändpunkter SVG-formernas koordinater (största uppmätta avvikelse mindre
än 0,001 SVG-enheter). Texten angav PCA 1 åt höger och PCA 2 nedåt. Detta var
inte en livekonversation och kontrollen omfattade inte deltagarmarkör eller
skärmläsare.

**Uppföljande livekontroll 2026-11-23:** Docker-motorn återhämtade sig efter
omstart med användarens godkännande. Den isolerade klienten byggdes om med
testkonfigurationen och konversation `2ckftjy8sn` svarade. Grupp A:s
polygonhörn och grupp B:s linjeändpunkter jämfördes i ordning med SVG:n och
avrundade API-koordinater; alla stämde. Axelriktningarna och deltagarmarkörens
position stämde med grafen. Simulerad Tab-navigering gav beräknat fokus-outline
för 15 fokusstopp på sidan; grupp A och påstående 0 valdes med Enter, och
rösttabellen visades. Fokus på Submit och påståendeknappen granskades visuellt.
Ingen röstning eller formulärinlämning gjordes. Andra livevyer och faktisk
skärmläsaruppläsning återstår.

---

## 8. Fullständig manuell tangentbordsgranskning av liveflöden

**Status: Ej utförd.** Använd denna sektion för ett separat, dokumenterat
genomspel på en dedikerad testmiljö. Röstning, kommentarer, prenumeration,
invite och login kan skapa eller ändra data. Använd inte produktionsdata eller
en gemensam databas.

### Körningsuppgifter

| Fält                              | Värde     |
| --------------------------------- | --------- |
| Datum / testare                   | Ej ifyllt |
| Gren / commit                     | Ej ifyllt |
| Miljö / testkonversation          | Ej ifyllt |
| Webbläsare / version              | Ej ifyllt |
| Operativsystem                    | Ej ifyllt |
| Språk / zoomnivå                  | Ej ifyllt |
| Skärmläsare / version (om använd) | Ej ifyllt |

### Resultat för tangentbordsflöden

Markera varje rad Pass / Delvis / Fail / N/A och ange observationer. Kör först
med tangentbord utan mus. Starta om från en ren konversationssida mellan
flödena där det behövs.

| Flöde              | Manuell kontroll                                                                                                                                                                                                        | Kriterier                                | Resultat / anteckning |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------- |
| Sidnavigation      | Ladda konversationen och tabba från sidstart. Kontrollera att fokus är synligt hela tiden, ordningen är begriplig, sidans huvuddel går att nå och inget element fångar fokus.                                           | 2.1.1, 2.1.2, 2.4.3, 2.4.7               | Ej testat             |
| Röstning           | Tabba till Agree, Disagree och Pass. Aktivera var och en separat med Enter och Space i testkonversation. Kontrollera fokus efter nästa påstående, slutvy och simulerat fel.                                             | 2.1.1, 2.4.3, 2.4.7, 4.1.2, 4.1.3        | Ej testat             |
| Skicka påstående   | Tabba till textarea och Submit. Skicka ett testpåstående med Enter och prova tomt, ogiltigt och duplicerat svar. Kontrollera att text, fel, fokus och statusmeddelande hanteras utan mus.                               | 1.3.1, 2.1.1, 3.3.1, 3.3.2, 3.3.3, 4.1.3 | Ej testat             |
| E-postformulär     | I en konversation utan fler påståenden: tabba till e-postfält och Subscribe. Prova ogiltig adress, API-fel och testad lyckad prenumeration; kontrollera fokus när formuläret ersätts av bekräftelse.                    | 2.1.1, 2.4.3, 3.3.1, 3.3.2, 4.1.3        | Ej testat             |
| Invite / login-kod | I en testkonversation som kräver invite: tabba genom båda formulären. Skicka giltig och ogiltig testkod med Enter. Kontrollera fältkopplade fel, status och återhämtning efter fel.                                     | 2.1.1, 2.4.3, 3.3.1, 3.3.2, 4.1.3        | Ej testat             |
| Login-modal        | Öppna login-kodsmodalen via inviteflödet. Kontrollera startfokus, Tab och Shift+Tab-gränser, Escape, kopieringsknapp samt fokusåtergång även om utlösaren försvinner.                                                   | 2.1.1, 2.1.2, 2.4.3, 4.1.2               | Ej testat             |
| PCA                | Öppna textbeskrivningen med tangentbord. Gå igenom gruppkontroller, påståendekontroller och tabellen. Aktivera val med Enter/Space och kontrollera `aria-pressed`, status och fokus. Jämför koordinatlistor med grafen. | 1.1.1, 1.3.1, 2.1.1, 2.4.3, 4.1.2, 4.1.3 | Ej testat             |
| OIDC-simulator     | Om simulatorn är konfigurerad: kör inloggning och utloggning med tangentbord, inklusive avbruten login och felåterhämtning. Detta verifierar inte BankID/Freja i Idura-sandbox.                                         | 2.1.1, 2.4.3, 3.3.1, 4.1.2, 4.1.3        | Ej testat             |

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
