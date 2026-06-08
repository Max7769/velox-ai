---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-size: 26px;
    background: #0b0d12;
    color: #e6e9ef;
  }
  h1 {
    color: #4f6ef7;
    font-size: 44px;
  }
  h2 {
    color: #8aa0ff;
    font-size: 32px;
  }
  strong { color: #ffffff; }
  table { font-size: 20px; }
  section.lead {
    text-align: center;
  }
---

<!-- _class: lead -->

# Velox AI
## Underwriting na sterydach: AI, które czyta zgłoszenia ubezpieczeniowe za underwritera

**Dokument roboczy dla założycieli — Max & wspólnik**
Wersja: wczesny etap / pre-revenue / demo

---

## 1. O co w ogóle chodzi w tym biznesie?

**Problem:** Underwriterzy w MGA (Managing General Agents) i syndykatach Lloyd's spędzają **godziny dziennie** na ręcznym czytaniu zgłoszeń ubezpieczeniowych (submission documents — PDF-y, maile, formularze brokerów), żeby:

- wyciągnąć dane (kto się ubezpiecza, jaki rodzaj ryzyka, jaka suma ubezpieczenia),
- ocenić ryzyko,
- zdecydować: przyjąć / odrzucić / skierować do seniora.

**Rozwiązanie Velox AI:** platforma SaaS, w której AI **automatycznie czyta dokumenty zgłoszeniowe**, wyciąga z nich dane, **liczy scoring ryzyka** i układa wszystko w czytelny pipeline (kanban), żeby underwriter w 30 sekund podjął decyzję zamiast w 30 minut.

> W skrócie: **zamieniamy "czytanie i przepisywanie" na "czytanie wyniku i klikanie decyzji"**.

---

## 2. Dlaczego to jest realny biznes (a nie zabawka)

- Rynek ubezpieczeń komercyjnych (Lloyd's of London + globalne MGA) to **dziesiątki miliardów $ rocznie** w przerabianych zgłoszeniach.
- Underwriting wciąż w dużej mierze działa na **mailach, PDF-ach i Excelu** — branża jest technologicznie do tyłu.
- Koszt jednego underwritera to **£60–120k rocznie** — a i tak jest wąskim gardłem (nie skaluje się liniowo).
- Każda godzina szybciej podjętej decyzji = **szybsze związanie ryzyka (bind) = realny przychód (premium)**.

**Nasza teza:** jeśli skrócimy czas obróbki zgłoszenia z godzin do minut i poprawimy jakość decyzji (lepszy risk score), MGA zarabia więcej i szybciej rośnie — **i zapłaci nam za to abonament**, bo to się im zwraca z nawiązką.

---

## 3. Jak to działa (warstwa produktowa)

1. **Wejście:** broker przesyła zgłoszenie (PDF/mail/API/upload) →
2. **Ekstrakcja AI:** Velox czyta dokument i wyciąga dane (ubezpieczony, typ ryzyka, suma, branża, lokalizacja) →
3. **Scoring ryzyka:** AI ocenia ryzyko na podstawie danych + reguł apetytu ryzykownego klienta (MGA) →
4. **Pipeline decyzyjny:** zgłoszenie ląduje w kolumnie: *w trakcie / do decyzji seniora / zaakceptowane / odrzucone* →
5. **Decyzja jednym kliknięciem:** underwriter akceptuje/odrzuca/kieruje dalej — z pełnym uzasadnieniem i śladem audytowym →
6. **Analityka:** MGA widzi w czasie rzeczywistym GWP (written premium), bind rate, wydajność brokerów, ekspozycję na ryzyko wg klasy.

To wszystko już **działa jako produkt demonstracyjny** — mamy działający pipeline, scoring, dashboard, panel ustawień, integracje (na razie mockowane).

---

## 4. Kim jest nasz klient (target customer)

### Klient płacący (kto podpisuje umowę i płaci abonament):
- **MGA (Managing General Agents)** — firmy, które underwritują ryzyko w imieniu ubezpieczycieli/syndykatów Lloyd's.
- **Mniejsze i średnie syndykaty Lloyd's of London** szukające narzędzi do modernizacji underwritingu.
- **Insurtechy i brokerzy specjalistyczni**, którzy sami underwritują nisze (cyber, marine, D&O, professional indemnity).

### Użytkownik końcowy (kto codziennie korzysta z platformy):
- **Underwriterzy** (decydują, akceptują/odrzucają),
- **Senior underwriterzy / risk managerowie** (ustawiają apetyt ryzykowy, zatwierdzają trudne przypadki),
- **Compliance / audyt** (potrzebują śladu decyzji),
- **Brokerzy** (w przyszłości: portal do śledzenia statusu swoich zgłoszeń).

### Dlaczego oni, a nie duże korporacje od razu?
Duzi ubezpieczyciele mają własne (drogie, powolne) systemy legacy. **MGA i mniejsze syndykaty są zwinniejsze, chętniej testują nowe narzędzia i bardziej odczuwają ból braku automatyzacji** — to nasz "beachhead market" (przyczółek), z którego później skalujemy w górę.

---

## 5. Dlaczego klient miałby nam zapłacić niemałe pieniądze

To nie jest "fajne narzędzie do PDF-ów". To jest **dźwignia na przychód i koszt operacyjny MGA**:

| Argument | Co to oznacza dla klienta w £ |
|---|---|
| **Szybszy czas decyzji** | Więcej zgłoszeń obsłużonych = więcej związanych polis (bound premium) tym samym zespołem |
| **Mniej błędów / lepszy scoring** | Mniej źle wycenionego ryzyka = lepszy loss ratio = wyższa rentowność |
| **Mniejszy zespół underwriterów potrzebny do tej samej skali** | Oszczędność £60–120k/rok na każdym etacie, którego nie trzeba zatrudnić |
| **Pełny ślad audytowy i zgodność (compliance)** | Mniej ryzyka regulacyjnego (FCA, Lloyd's, GDPR, AI Act) — unikanie kar |
| **Dane i analityka w czasie rzeczywistym** | Lepsze decyzje strategiczne (gdzie rosnąć, kogo unikać) |

**Model cenowy (propozycja na start):** SaaS subskrypcyjny per-seat + per-volume (np. £500–2000/underwriter/miesiąc + opłata za wolumen przetworzonych zgłoszeń) — typowe dla B2B insurtech, łatwe do uzasadnienia oszczędnościami, które generujemy.

---

## 6. Jak to skalujemy (go-to-market + produkt)

**Faza 1 — Fundament (0–6 mies.):** dopracowanie produktu (już w toku), pierwsi pilotażowi klienci (1–3 MGA), zbieranie realnych danych i opinii, dowód wartości (case study: "skróciliśmy czas decyzji o X%").

**Faza 2 — Przyczółek rynkowy (6–18 mies.):** sprzedaż do 10–30 MGA i mniejszych syndykatów (Lloyd's London Market jest skoncentrowany — łatwo dotrzeć przez konferencje branżowe, networking, rekomendacje). Rozwój integracji (Applied Epic, Salesforce, systemy policy administration).

**Faza 3 — Skala (18–36 mies.):**
- **Poziom (multi-tenant / white-label):** sprzedajemy platformę jako "private label" dla większych syndykatów.
- **Poziom (ekosystem):** portal dla brokerów, marketplace reguł underwritingowych, dane porównawcze rynku (premium intelligence).
- **Poziom (geografia):** ekspansja z Londynu na inne huby ubezpieczeniowe (Bermuda, Singapur, Zurych, USA — E&S market).

**Efekt sieciowy:** im więcej MGA korzysta z Velox, tym lepsze (bardziej trenowane na realnych danych) staje się nasze AI — klasyczna przewaga danych (data moat).

---

## 7. Skąd weźmiemy finansowanie (funding roadmap)

### Etap 1 — Pre-seed / Friends & Family / Bootstrapping (teraz)
- Cel: dokończyć MVP, zdobyć 1–3 pilotażowych klientów, mieć realne dane/case study.
- Kwota orientacyjna: **£50–150k** — wystarczy na 6–12 miesięcy rozwoju + pierwsze pilotaże.
- Źródła: oszczędności własne, granty dla startupów technologicznych (np. Innovate UK), aniołowie biznesu ze świata insurtech/fintech.

### Etap 2 — Seed Round (po pierwszych pilotażach i trakcji)
- Cel: zatrudnić mały zespół (sprzedaż, inżynieria), skalować do 10–20 płacących klientów.
- Kwota orientacyjna: **£500k – £1.5M**.
- Źródła: fundusze VC specjalizujące się w insurtech (np. Anthemis, Eos Venture Partners, Octopus Ventures), aniołowie z branży ubezpieczeniowej (byli underwriterzy/MGA founders — "smart money").

### Etap 3 — Series A (po udowodnieniu modelu, ARR rosnące)
- Cel: ekspansja geograficzna, multi-tenant/white-label, większy zespół.
- Kwota orientacyjna: **£3–8M**.
- Kluczowy dowód dla inwestorów: **powtarzalny przychód (ARR), niska rezygnacja klientów (churn), jasna ścieżka do dużego rynku (TAM)**.

> **Najważniejsza rzecz przed jakimkolwiek fundraisingiem:** mieć 1–2 prawdziwych, płacących (lub przynajmniej pilotujących za darmo z zamiarem płacenia) klientów i konkretne liczby ("skróciliśmy proces decyzji z 45 minut do 4 minut, zwiększyliśmy liczbę obsłużonych zgłoszeń o 30%"). To zamienia "mamy fajny produkt" w "mamy biznes, który da się skalować".

---

## 8. Wielkość rynku (dlaczego to się opłaca)

- **TAM (Total Addressable Market):** globalny rynek oprogramowania dla underwritingu i zarządzania ryzykiem w ubezpieczeniach komercyjnych — szacowany na **wiele miliardów USD rocznie** i rosnący wraz z cyfryzacją insurtech.
- **SAM (Serviceable Available Market):** MGA, syndykaty Lloyd's i wyspecjalizowani ubezpieczyciele komercyjni w Wielkiej Brytanii, Europie i USA — rynek liczony w **tysiącach potencjalnych firm-klientów**.
- **SOM (Serviceable Obtainable Market — pierwsze 3 lata):** realistycznie **20–50 MGA/syndykatów** jako pierwsi klienci, co przy cenie £2–10k/miesiąc/klient daje **£0.5M–6M ARR** w ciągu 2–3 lat — wystarczająco, by przyciągnąć poważny kapitał na dalszy wzrost.

**Dlaczego teraz?** Branża ubezpieczeniowa jest pod presją regulacyjną (AI Act, wymogi Lloyd's Blueprint Two/CDR) i kosztową — **muszą się zdigitalizować, a AI-native narzędzia (jak Velox) są na fali tego trendu**, w przeciwieństwie do starych systemów legacy.

---

## 9. Co wyróżnia Velox AI na tle konkurencji

- **AI-native od podstaw**, a nie "stary system + doklejony chatbot" (jak u wielu legacy graczy).
- **Skupienie na underwriterze jako użytkowniku** — szybki, przejrzysty interfejs (kanban, jeden klik decyzji), a nie skomplikowany ERP.
- **Pełna przejrzystość decyzji (explainable AI)** — underwriter widzi *dlaczego* AI tak ocenia ryzyko, co buduje zaufanie i spełnia wymogi regulacyjne.
- **Łatwa integracja** z istniejącymi narzędziami brokerów i MGA (Applied Epic, Salesforce, e-mail) zamiast wymuszania zmiany całego stacku.
- **Mali, zwinni, blisko klienta** — możemy dostosowywać produkt szybciej niż korporacyjni giganci.

---

## 10. Co dalej — następne kroki (najbliższe 90 dni)

1. **Domknąć MVP** — dopracować pipeline, scoring, dashboard (już w dużej mierze gotowe).
2. **Zdobyć 1–3 pilotażowych klientów** (MGA lub mały syndykat) — najlepiej za darmo/zniżkę w zamian za feedback i prawo do case study.
3. **Zmierzyć i udokumentować realny efekt** (czas decyzji, liczba obsłużonych zgłoszeń, jakość scoringu) — to nasza "amunicja" do rozmów sprzedażowych i z inwestorami.
4. **Zbudować prostą stronę/pitch deck sprzedażowy** skierowany do MGA — jasno komunikujący ROI ("ile to oszczędza w £ rocznie").
5. **Zacząć rozmowy z aniołami/funduszami insurtech** — równolegle, żeby mieć kapitał na zatrudnienie pierwszych osób do sprzedaży i wsparcia klientów.

---

<!-- _class: lead -->

# Podsumowanie

**Velox AI = AI, które robi za underwritera najbardziej żmudną robotę — czytanie, ocenę i wstępną decyzję — żeby ludzie mogli skupić się na trudnych przypadkach i budowaniu relacji z brokerami.**

To biznes, który **oszczędza realne pieniądze** klientom (mniej etatów, szybsze związywanie ryzyka, mniej błędów), więc **mogą i będą nam za to dobrze płacić**.

Następny krok: **pierwszy pilotaż + twarde liczby.**
