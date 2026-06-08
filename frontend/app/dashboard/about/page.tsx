"use client";
import { Download, FileText, Presentation } from "lucide-react";

type Section = { title: string; body: React.ReactNode };

const SECTIONS: Section[] = [
  {
    title: "1. O co w ogóle chodzi w tym biznesie?",
    body: (
      <>
        <p>
          <strong className="text-white">Problem:</strong> Underwriterzy w MGA (Managing General Agents) i syndykatach
          Lloyd&apos;s spędzają godziny dziennie na ręcznym czytaniu zgłoszeń ubezpieczeniowych (submission documents —
          PDF-y, maile, formularze brokerów), żeby wyciągnąć dane, ocenić ryzyko i zdecydować: przyjąć / odrzucić /
          skierować do seniora.
        </p>
        <p>
          <strong className="text-white">Rozwiązanie Velox AI:</strong> platforma SaaS, w której AI automatycznie
          czyta dokumenty zgłoszeniowe, wyciąga z nich dane, liczy scoring ryzyka i układa wszystko w czytelny pipeline
          (kanban), żeby underwriter w 30 sekund podjął decyzję zamiast w 30 minut.
        </p>
        <p className="italic text-slate-400">
          W skrócie: zamieniamy &quot;czytanie i przepisywanie&quot; na &quot;czytanie wyniku i klikanie decyzji&quot;.
        </p>
      </>
    ),
  },
  {
    title: "2. Dlaczego to jest realny biznes",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Rynek ubezpieczeń komercyjnych (Lloyd&apos;s of London + globalne MGA) to dziesiątki miliardów $ rocznie w przerabianych zgłoszeniach.</li>
        <li>Underwriting wciąż w dużej mierze działa na mailach, PDF-ach i Excelu — branża jest technologicznie do tyłu.</li>
        <li>Koszt jednego underwritera to £60–120k rocznie — a i tak jest wąskim gardłem (nie skaluje się liniowo).</li>
        <li>Każda godzina szybciej podjętej decyzji = szybsze związanie ryzyka (bind) = realny przychód (premium).</li>
      </ul>
    ),
  },
  {
    title: "3. Jak to działa (warstwa produktowa)",
    body: (
      <ol className="list-decimal pl-5 space-y-1.5">
        <li><strong className="text-white">Wejście:</strong> broker przesyła zgłoszenie (PDF / mail / API / upload)</li>
        <li><strong className="text-white">Ekstrakcja AI:</strong> Velox czyta dokument i wyciąga dane (ubezpieczony, typ ryzyka, suma, branża, lokalizacja)</li>
        <li><strong className="text-white">Scoring ryzyka:</strong> AI ocenia ryzyko na podstawie danych + reguł apetytu ryzykownego klienta (MGA)</li>
        <li><strong className="text-white">Pipeline decyzyjny:</strong> zgłoszenie ląduje w kolumnie: w trakcie / do decyzji seniora / zaakceptowane / odrzucone</li>
        <li><strong className="text-white">Decyzja jednym kliknięciem:</strong> underwriter akceptuje / odrzuca / kieruje dalej — z pełnym uzasadnieniem i śladem audytowym</li>
        <li><strong className="text-white">Analityka:</strong> MGA widzi w czasie rzeczywistym GWP, bind rate, wydajność brokerów, ekspozycję na ryzyko</li>
      </ol>
    ),
  },
  {
    title: "4. Kim jest nasz klient",
    body: (
      <>
        <p className="font-semibold text-white mb-1">Klient płacący (kto podpisuje umowę i płaci abonament):</p>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>MGA (Managing General Agents) — underwritują ryzyko w imieniu ubezpieczycieli/syndykatów Lloyd&apos;s</li>
          <li>Mniejsze i średnie syndykaty Lloyd&apos;s of London szukające narzędzi do modernizacji underwritingu</li>
          <li>Insurtechy i brokerzy specjalistyczni (cyber, marine, D&amp;O, professional indemnity)</li>
        </ul>
        <p className="font-semibold text-white mb-1">Użytkownik końcowy:</p>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Underwriterzy (decydują, akceptują/odrzucają)</li>
          <li>Senior underwriterzy / risk managerowie (apetyt ryzykowy, trudne przypadki)</li>
          <li>Compliance / audyt (ślad decyzji)</li>
          <li>Brokerzy (docelowo: portal do śledzenia statusu zgłoszeń)</li>
        </ul>
        <p className="italic text-slate-400">
          Duzi ubezpieczyciele mają drogie systemy legacy. MGA i mniejsze syndykaty są zwinniejsze i bardziej
          odczuwają ból braku automatyzacji — to nasz &quot;beachhead market&quot;, z którego skalujemy w górę.
        </p>
      </>
    ),
  },
  {
    title: "5. Dlaczego klient zapłaci nam niemałe pieniądze",
    body: (
      <>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-400 border-b" style={{ borderColor: "var(--border)" }}>
                <th className="py-2 pr-4 font-medium">Argument</th>
                <th className="py-2 font-medium">Co to oznacza dla klienta w £</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                ["Szybszy czas decyzji", "Więcej zgłoszeń obsłużonych = więcej związanych polis (bound premium) tym samym zespołem"],
                ["Mniej błędów / lepszy scoring", "Lepiej wycenione ryzyko = lepszy loss ratio = wyższa rentowność"],
                ["Mniejszy zespół potrzebny do tej skali", "Oszczędność £60–120k/rok na każdym etacie, którego nie trzeba zatrudnić"],
                ["Pełny ślad audytowy i zgodność", "Mniej ryzyka regulacyjnego (FCA, Lloyd's, GDPR, AI Act) — unikanie kar"],
                ["Dane i analityka w czasie rzeczywistym", "Lepsze decyzje strategiczne (gdzie rosnąć, kogo unikać)"],
              ].map(([a, b]) => (
                <tr key={a} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4 font-medium text-white align-top whitespace-nowrap">{a}</td>
                  <td className="py-2 align-top">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong className="text-white">Model cenowy (propozycja na start):</strong> SaaS subskrypcyjny per-seat +
          per-volume (np. £500–2000/underwriter/miesiąc + opłata za wolumen przetworzonych zgłoszeń) — typowe dla B2B
          insurtech, łatwe do uzasadnienia oszczędnościami, które generujemy.
        </p>
      </>
    ),
  },
  {
    title: "6. Jak to skalujemy (go-to-market + produkt)",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li><strong className="text-white">Faza 1 — Fundament (0–6 mies.):</strong> dopracowanie produktu (już w toku), pierwsi pilotażowi klienci (1–3 MGA), dowód wartości (case study).</li>
        <li><strong className="text-white">Faza 2 — Przyczółek rynkowy (6–18 mies.):</strong> sprzedaż do 10–30 MGA i mniejszych syndykatów, rozwój integracji (Applied Epic, Salesforce, policy administration).</li>
        <li><strong className="text-white">Faza 3 — Skala (18–36 mies.):</strong> multi-tenant / white-label dla syndykatów, portal dla brokerów, marketplace reguł underwritingowych, ekspansja geograficzna (Bermuda, Singapur, Zurych, USA).</li>
        <li><strong className="text-white">Efekt sieciowy:</strong> im więcej MGA korzysta z Velox, tym lepsze (trenowane na realnych danych) staje się nasze AI — klasyczna przewaga danych (data moat).</li>
      </ul>
    ),
  },
  {
    title: "7. Skąd weźmiemy finansowanie",
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong className="text-white">Etap 1 — Pre-seed / Friends &amp; Family / Bootstrapping (teraz):</strong> dokończyć
          MVP, zdobyć 1–3 pilotaże. Kwota orientacyjna: £50–150k. Źródła: oszczędności własne, granty (Innovate UK),
          aniołowie biznesu z insurtech/fintech.
        </li>
        <li>
          <strong className="text-white">Etap 2 — Seed Round:</strong> zatrudnić mały zespół, skalować do 10–20 płacących
          klientów. Kwota orientacyjna: £500k–1.5M. Źródła: VC insurtech (np. Anthemis, Eos Venture Partners, Octopus
          Ventures), aniołowie z branży ubezpieczeniowej.
        </li>
        <li>
          <strong className="text-white">Etap 3 — Series A:</strong> ekspansja geograficzna, multi-tenant/white-label,
          większy zespół. Kwota orientacyjna: £3–8M. Kluczowy dowód: powtarzalny przychód (ARR), niski churn, jasna
          ścieżka do dużego rynku (TAM).
        </li>
        <li className="italic text-slate-400">
          Najważniejsza rzecz przed jakimkolwiek fundraisingiem: mieć 1–2 prawdziwych (lub pilotujących z zamiarem
          płacenia) klientów i konkretne liczby — to zamienia &quot;mamy fajny produkt&quot; w &quot;mamy biznes, który
          da się skalować&quot;.
        </li>
      </ul>
    ),
  },
  {
    title: "8. Wielkość rynku (dlaczego się to opłaca)",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong className="text-white">TAM:</strong> globalny rynek oprogramowania dla underwritingu i zarządzania ryzykiem w ubezpieczeniach komercyjnych — wiele miliardów USD rocznie i rośnie wraz z cyfryzacją insurtech.</li>
        <li><strong className="text-white">SAM:</strong> MGA, syndykaty Lloyd&apos;s i wyspecjalizowani ubezpieczyciele komercyjni w UK, Europie i USA — tysiące potencjalnych firm-klientów.</li>
        <li><strong className="text-white">SOM (pierwsze 3 lata):</strong> realistycznie 20–50 MGA/syndykatów jako pierwsi klienci; przy £2–10k/miesiąc/klient daje to £0.5M–6M ARR w ciągu 2–3 lat.</li>
        <li className="italic text-slate-400">Dlaczego teraz? Branża jest pod presją regulacyjną (AI Act, Lloyd&apos;s Blueprint Two/CDR) i kosztową — musi się zdigitalizować, a AI-native narzędzia jak Velox są na fali tego trendu.</li>
      </ul>
    ),
  },
  {
    title: "9. Co wyróżnia Velox AI na tle konkurencji",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>AI-native od podstaw, a nie &quot;stary system + doklejony chatbot&quot;</li>
        <li>Skupienie na underwriterze jako użytkowniku — szybki, przejrzysty interfejs (kanban, jeden klik decyzji)</li>
        <li>Pełna przejrzystość decyzji (explainable AI) — buduje zaufanie i spełnia wymogi regulacyjne</li>
        <li>Łatwa integracja z istniejącymi narzędziami brokerów i MGA zamiast wymuszania zmiany całego stacku</li>
        <li>Mali, zwinni, blisko klienta — szybsze dostosowanie produktu niż korporacyjni giganci</li>
      </ul>
    ),
  },
  {
    title: "10. Co dalej — następne kroki (90 dni)",
    body: (
      <ol className="list-decimal pl-5 space-y-1.5">
        <li>Domknąć MVP — dopracować pipeline, scoring, dashboard</li>
        <li>Zdobyć 1–3 pilotażowych klientów (MGA lub mały syndykat) — za feedback i prawo do case study</li>
        <li>Zmierzyć i udokumentować realny efekt (czas decyzji, liczba zgłoszeń, jakość scoringu)</li>
        <li>Zbudować prosty pitch deck sprzedażowy dla MGA — jasno komunikujący ROI w £</li>
        <li>Zacząć rozmowy z aniołami / funduszami insurtech równolegle z budową pierwszych pilotaży</li>
      </ol>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Na czym polega nasz biznes?</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Velox AI = AI, które robi za underwritera najbardziej żmudną robotę — czytanie, ocenę i wstępną decyzję —
          żeby ludzie mogli skupić się na trudnych przypadkach i budowaniu relacji z brokerami.
        </p>
      </div>

      {/* Download links to the full deck */}
      <div className="flex flex-wrap gap-3">
        <a href="/pitch/velox-ai-overview.pdf" download
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "#e6e9ef" }}>
          <FileText size={15} />
          Pobierz prezentację (PDF)
          <Download size={13} className="text-slate-500" />
        </a>
        <a href="/pitch/velox-ai-overview.pptx" download
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "#e6e9ef" }}>
          <Presentation size={15} />
          Pobierz prezentację (PowerPoint)
          <Download size={13} className="text-slate-500" />
        </a>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map(s => (
          <div key={s.title} className="card p-5">
            <h2 className="text-base font-semibold text-white mb-3">{s.title}</h2>
            <div className="text-sm text-slate-300 leading-relaxed space-y-2">{s.body}</div>
          </div>
        ))}
      </div>

      <div className="card p-5 text-center" style={{ background: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.2)" }}>
        <p className="text-sm text-slate-300">
          To biznes, który <strong className="text-white">oszczędza realne pieniądze</strong> klientom (mniej etatów,
          szybsze związywanie ryzyka, mniej błędów), więc <strong className="text-white">mogą i będą nam za to dobrze
          płacić</strong>.
        </p>
        <p className="text-sm text-white font-semibold mt-2">Następny krok: pierwszy pilotaż + twarde liczby.</p>
      </div>
    </div>
  );
}
