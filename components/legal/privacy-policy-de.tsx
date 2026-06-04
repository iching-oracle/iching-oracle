import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_OPERATOR } from "@/lib/legal/content";

const LAST_UPDATED = "2. Juni 2026";

const TOC = [
  { id: "verantwortlicher", label: "Verantwortlicher" },
  { id: "uebersicht", label: "Überblick" },
  { id: "hosting", label: "Hosting" },
  { id: "server-logfiles", label: "Server-Logfiles" },
  { id: "registrierung", label: "Registrierung und Benutzerkonto" },
  { id: "google-oauth", label: "Google Login (OAuth)" },
  { id: "stripe", label: "Zahlungsabwicklung (Stripe)" },
  { id: "ki-inhalte", label: "KI-generierte Inhalte" },
  { id: "e-mail", label: "E-Mail-Kommunikation" },
  { id: "cookies", label: "Cookies und Sessions" },
  { id: "analytics", label: "Analyse-Tools (optional)" },
  { id: "speicherdauer", label: "Speicherdauer" },
  { id: "rechte", label: "Rechte der betroffenen Personen" },
  { id: "widerruf-loeschung", label: "Widerruf und Löschung" },
  { id: "sicherheit", label: "Datensicherheit" },
  { id: "aenderungen", label: "Änderungen" },
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-white/[0.04] pb-10 last:border-0 last:pb-0"
    >
      <h2 className="font-serif text-xl text-foreground sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-[1.75] text-foreground/88 sm:text-base">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 border-l border-amber-gold/20 pl-4 sm:pl-5">
      {items.map((item) => (
        <li key={item} className="pl-1">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  const op = LEGAL_OPERATOR;

  return (
    <div className="relative min-h-full overflow-hidden bg-zen-bg">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-cosmic-purple/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-gold/6 blur-[90px]"
        aria-hidden
      />

      <article className="relative z-10 mx-auto max-w-3xl px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 lg:max-w-4xl">
        <header className="border-b border-white/[0.08] pb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
            Rechtliches
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            Datenschutzerklärung
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zen-muted">
            Informationen zur Verarbeitung personenbezogener Daten bei der Nutzung
            von {op.name} ({op.website}) gemäß der Datenschutz-Grundverordnung
            (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
          </p>
          <p className="mt-3 text-xs text-zen-muted/80">
            Stand: <time dateTime="2026-06-02">{LAST_UPDATED}</time>
          </p>
        </header>

        <nav
          aria-label="Inhaltsverzeichnis"
          className="mt-8 rounded-xl border border-white/[0.06] bg-zen-surface/40 px-4 py-4 sm:px-5"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zen-muted">
            Inhalt
          </p>
          <ol className="mt-3 columns-1 gap-x-8 text-sm sm:columns-2">
            {TOC.map((item) => (
              <li key={item.id} className="mb-1.5 break-inside-avoid">
                <a
                  href={`#${item.id}`}
                  className="text-foreground/75 transition-colors hover:text-amber-gold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-12 sm:mt-12">
          <Section id="verantwortlicher" title="1. Verantwortlicher">
            <P>
              Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO:
            </P>
            <Ul
              items={[
                op.legalName,
                op.street,
                `${op.postalCode} ${op.city}`,
                op.country,
                `E-Mail: ${op.email}`,
                `Website: ${op.website}`,
              ]}
            />
            <P>
              Für allgemeine Anfragen außerhalb des Datenschutzes:{" "}
              <a
                href={`mailto:${op.contactEmail}`}
                className="text-amber-gold underline-offset-2 hover:underline"
              >
                {op.contactEmail}
              </a>
              .
            </P>
          </Section>

          <Section id="uebersicht" title="2. Überblick">
            <P>
              {op.name} ist eine webbasierte Anwendung für I-Ging-inspirierte
              Beratungen mit KI-unterstützten Deutungen. Nutzerinnen und Nutzer
              können ein Konto anlegen, Beratungen durchführen, Verläufe
              speichern und optional ein kostenpflichtiges Premium-Abo abschließen
              (Freemium-SaaS).
            </P>
            <P>
              Wir verarbeiten personenbezogene Daten nur, soweit dies für den
              Betrieb der Website, die Vertragserfüllung, berechtigte Interessen
              oder Ihre Einwilligung erforderlich ist. Eine Weitergabe an Dritte
              erfolgt nur im Rahmen der in dieser Erklärung beschriebenen
              Auftragsverarbeitung oder wenn wir gesetzlich dazu verpflichtet sind.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Rechtsgrundlagen (Auswahl):
              </strong>{" "}
              Art. 6 Abs. 1 lit. b DSGVO (Vertrag), lit. f DSGVO (berechtigtes
              Interesse, z. B. IT-Sicherheit), lit. a DSGVO (Einwilligung, z. B.
              optionale Analyse-Cookies), lit. c DSGVO (rechtliche Verpflichtung).
            </P>
          </Section>

          <Section id="hosting" title="3. Hosting">
            <P>
              Unsere Website und API werden bei einem professionellen
              Hosting-Anbieter betrieben (derzeit u. a. Vercel Inc. für
              Bereitstellung und Edge-Netzwerk). Dabei können technische Daten
              (z. B. IP-Adresse, Zeitstempel, angeforderte URL) in Server- und
              CDN-Logfiles anfallen.
            </P>
            <P>
              Mit dem Hosting-Anbieter bestehen Auftragsverarbeitungsverträge
              gemäß Art. 28 DSGVO. Sofern Daten in Drittländern (z. B. USA)
              verarbeitet werden, setzen wir — soweit erforderlich — geeignete
              Garantien ein (z. B. EU-Standardvertragsklauseln).
            </P>
            <P>
              Die Anwendungsdatenbank (PostgreSQL) wird über einen separaten
              Datenbank-Hosting-Dienst bereitgestellt; Vertragspartner und
              Standort entnehmen Sie ggf. ergänzenden Unterlagen im internen
              Verarbeitungsverzeichnis.
            </P>
          </Section>

          <Section id="server-logfiles" title="4. Server-Logfiles">
            <P>
              Bei jedem Aufruf unserer Website werden automatisch Informationen
              durch Ihren Browser übermittelt und in Logfiles gespeichert, u. a.:
            </P>
            <Ul
              items={[
                "IP-Adresse (ggf. gekürzt oder pseudonymisiert)",
                "Datum und Uhrzeit der Anfrage",
                "aufgerufene Seite bzw. API-Route",
                "HTTP-Statuscode",
                "Browsertyp und -version, Betriebssystem",
                "Referrer-URL",
              ]}
            />
            <P>
              <strong className="font-medium text-foreground">
                Zweck:
              </strong>{" "}
              Bereitstellung der Website, Fehleranalyse, Abwehr von Angriffen,
              Missbrauchserkennung.
              <br />
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. f DSGVO.
              <br />
              <strong className="font-medium text-foreground">
                Speicherdauer:
              </strong>{" "}
              in der Regel wenige Tage bis maximal ca. 30 Tage, sofern keine
              längere Aufbewahrung aus Sicherheitsgründen erforderlich ist.
            </P>
          </Section>

          <Section id="registrierung" title="5. Registrierung und Benutzerkonto">
            <P>
              Sie können ein Benutzerkonto mit E-Mail und Passwort anlegen. Dabei
              verarbeiten wir insbesondere:
            </P>
            <Ul
              items={[
                "E-Mail-Adresse",
                "Passwort (nur als kryptografischer Hash, kein Klartext)",
                "optional: Anzeigename und Profilbild",
                "Spracheinstellungen und Kontoeinstellungen",
                "Beratungsverlauf: Fragen, Hexagramm-Ergebnisse, KI-Deutungen, Notizen, Favoriten",
                "Nutzungsdaten: Guthaben/Credits, Abonnementstatus, Zeitstempel",
              ]}
            />
            <P>
              <strong className="font-medium text-foreground">
                Zweck:
              </strong>{" "}
              Vertragserfüllung, Bereitstellung personalisierter Funktionen.
              <br />
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. b DSGVO.
            </P>
            <P>
              Sie können Ihr Konto in den Kontoeinstellungen löschen. Dadurch
              werden Ihre Profildaten und zugehörige Beratungen aus den aktiven
              Systemen entfernt, vorbehaltlich technischer Backup-Fristen und
              gesetzlicher Aufbewahrungspflichten (siehe Abschnitt Speicherdauer).
            </P>
          </Section>

          <Section id="google-oauth" title="6. Google Login (OAuth)">
            <P>
              Optional können Sie sich mit Google anmelden (OAuth 2.0 über
              Auth.js / NextAuth). Dabei erhält unser System von Google u. a.:
            </P>
            <Ul
              items={[
                "E-Mail-Adresse",
                "Name und Profilbild (sofern in Ihrem Google-Konto hinterlegt und freigegeben)",
                "eindeutige Google-Kennung (Subject-ID) zur Kontoverknüpfung",
              ]}
            />
            <P>
              Anbieter: Google Ireland Limited / Google LLC. Es gelten die
              Datenschutzbestimmungen von Google:{" "}
              <a
                href="https://policies.google.com/privacy"
                className="text-amber-gold underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                policies.google.com/privacy
              </a>
              .
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. b DSGVO (Anmeldung/Vertrag) sowie ggf. lit. a
              DSGVO, soweit Sie die Google-Anmeldung aktiv wählen.
            </P>
          </Section>

          <Section id="stripe" title="7. Zahlungsabwicklung mit Stripe">
            <P>
              Für Premium-Abonnements nutzen wir Stripe, Inc. als
              Zahlungsdienstleister. Beim Checkout werden Zahlungsdaten (z. B.
              Kartennummer) <strong className="text-foreground">direkt bei Stripe</strong>{" "}
              eingegeben und verarbeitet — nicht auf unseren Servern.
            </P>
            <P>
              Von Stripe erhalten wir nur die für die Vertragsabwicklung
              erforderlichen Metadaten, z. B.:
            </P>
            <Ul
              items={[
                "Stripe-Kunden-ID und Abonnement-ID",
                "Zahlungs- und Abonnementstatus",
                "Abrechnungszeiträume",
                "Rechnungsreferenzen (keine vollständigen Kartendaten)",
              ]}
            />
            <P>
              Stripe verarbeitet Daten eigenverantwortlich und nach eigenen
              Datenschutzgrundsätzen:{" "}
              <a
                href="https://stripe.com/de/privacy"
                className="text-amber-gold underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                stripe.com/de/privacy
              </a>
              . Eine Übermittlung in die USA kann nicht ausgeschlossen werden;
              Stripe stellt hierfür geeignete Garantien bereit.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. b DSGVO (Vertrag) und lit. c DSGVO (steuerliche
              Aufbewahrung von Rechnungsdaten).
            </P>
          </Section>

          <Section id="ki-inhalte" title="8. KI-generierte Inhalte (DeepSeek / KI-API)">
            <P>
              Zur Erzeugung von Deutungen und Mustertexten übermitteln wir
              ausgewählte Inhalte Ihrer Beratung (z. B. Fragestellung,
              Hexagramm-Symbole, Kontext) an einen externen KI-Dienstleister.
              Derzeit nutzen wir die <strong className="text-foreground">DeepSeek-API</strong>{" "}
              über eine OpenAI-kompatible Schnittstelle.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Wichtiger Hinweis:
              </strong>{" "}
              Die Verarbeitung kann auf Servern <strong className="text-foreground">außerhalb der EU/des EWR</strong>{" "}
              (insbesondere in Drittländern) erfolgen. Soweit erforderlich, werden
              geeignete Schutzmaßnahmen (z. B. Standardvertragsklauseln)
              eingesetzt.
            </P>
            <P>
              Wir verwenden Ihre Eingaben <strong className="text-foreground">nicht</strong>, um
              öffentliche KI-Modelle zu trainieren. Die Übermittlung dient der
              Bereitstellung Ihrer jeweiligen Sitzung und verbundener Funktionen
              (z. B. Mustererkennung für Premium-Nutzer).
            </P>
            <P>
              KI-Ausgaben sind automatisch generiert, können unzutreffend oder
              unvollständig sein und stellen keine medizinische, psychologische,
              rechtliche oder finanzielle Beratung dar.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Leistung) sowie lit. f DSGVO
              (technisch notwendige Weiterleitung zur KI-Verarbeitung).
            </P>
          </Section>

          <Section id="e-mail" title="9. E-Mail-Kommunikation">
            <P>
              Wir versenden E-Mails über den Dienstleister Resend, u. a.:
            </P>
            <Ul
              items={[
                "Transaktions-E-Mails (z. B. E-Mail-Bestätigung, Passwort-Reset)",
                "optional: Lebenszyklus-E-Mails (tägliche Impulse, wöchentliche Reflexion) — nur mit Ihrer Einwilligung bzw. soweit erlaubt",
                "Antworten auf Support-Anfragen",
              ]}
            />
            <P>
              Verarbeitet werden mindestens die E-Mail-Adresse, Betreff, Inhalt
              sowie technische Zustellinformationen. Sie können Marketing- und
              Lebenszyklus-E-Mails in den Kontoeinstellungen oder über
              Abmeldelinks in der E-Mail abbestellen.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. b DSGVO (transaktional) bzw. lit. a DSGVO
              (optionale Inhalte).
            </P>
          </Section>

          <Section id="cookies" title="10. Cookies und Sessions">
            <P>
              Wir verwenden Cookies und vergleichbare Technologien:
            </P>
            <Ul
              items={[
                "Session-/Authentifizierungs-Cookies (NextAuth) — für Anmeldung erforderlich",
                "Einwilligungs-Speicher — merkt sich Ihre Cookie-/Analyse-Wahl",
                "optional: Besucher-Cookie für die tägliche Orakel-Vorschau ohne Konto",
                "optionale Analyse-Cookies — nur nach Einwilligung (siehe nächster Abschnitt)",
              ]}
            />
            <P>
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. b DSGVO (technisch notwendig) bzw. lit. a DSGVO
              (nicht essenzielle Cookies). Sie können Cookies in Ihrem Browser
              löschen oder blockieren; einzelne Funktionen stehen dann ggf. nicht
              zur Verfügung.
            </P>
            <P>
              Ausführliche Informationen finden Sie in unserer{" "}
              <Link href="/cookies" className="text-amber-gold hover:underline">
                Cookie-Richtlinie
              </Link>
              .
            </P>
          </Section>

          <Section id="analytics" title="11. Analyse-Tools (optional)">
            <P>
              Sofern Sie im Cookie-Banner zustimmen, können wir
              datenschutzfreundliche Analyse-Tools einsetzen (z. B. PostHog
              und/oder Google Analytics), um Nutzungsmuster zu verstehen und
              das Produkt zu verbessern.
            </P>
            <P>
              Analyse wird <strong className="text-foreground">nicht</strong> ohne
              Ihre Einwilligung aktiviert. Sie können die Einwilligung jederzeit
              über die Cookie-Einstellungen im Footer widerrufen.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Rechtsgrundlage:
              </strong>{" "}
              Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 TTDSG.
            </P>
          </Section>

          <Section id="speicherdauer" title="12. Speicherdauer">
            <P>
              Wir speichern personenbezogene Daten nur so lange, wie es für die
              genannten Zwecke erforderlich ist:
            </P>
            <Ul
              items={[
                "Kontodaten und Beratungsverlauf: bis zur Kontolöschung",
                "Backups: begrenzte technische Wiederherstellungsfrist, danach Löschung",
                "Abrechnungsdaten: gemäß handels- und steuerrechtlichen Fristen (in der Regel bis zu 10 Jahre, soweit anwendbar)",
                "Server-Logs: siehe Abschnitt Server-Logfiles",
                "Einwilligungsnachweise (Cookies): entsprechend gesetzlicher Nachweispflichten",
              ]}
            />
          </Section>

          <Section id="rechte" title="13. Rechte der betroffenen Personen">
            <P>
              Sie haben gegenüber uns insbesondere folgende Rechte:
            </P>
            <Ul
              items={[
                "Auskunft (Art. 15 DSGVO)",
                "Berichtigung (Art. 16 DSGVO)",
                "Löschung (Art. 17 DSGVO)",
                "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
                "Datenübertragbarkeit (Art. 20 DSGVO)",
                "Widerspruch gegen Verarbeitung auf Basis von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)",
                "Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)",
              ]}
            />
            <P>
              Zur Ausübung wenden Sie sich an:{" "}
              <a
                href={`mailto:${op.email}`}
                className="text-amber-gold underline-offset-2 hover:underline"
              >
                {op.email}
              </a>
              . Wir werden Anfragen innerhalb der gesetzlichen Fristen bearbeiten.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Beschwerderecht:
              </strong>{" "}
              Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren,
              z. B. beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA),
              wenn Sie in Bayern ansässig sind oder die Verarbeitung dort
              erhebliche Auswirkungen hat.
            </P>
          </Section>

          <Section id="widerruf-loeschung" title="14. Widerruf und Löschung">
            <P>
              <strong className="font-medium text-foreground">
                Einwilligungen:
              </strong>{" "}
              Sie können erteilte Einwilligungen (z. B. für Analyse-Cookies oder
              optionale E-Mails) jederzeit mit Wirkung für die Zukunft widerrufen.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Kontolöschung:
              </strong>{" "}
              In den Kontoeinstellungen können Sie Ihr Konto selbst löschen.
            </P>
            <P>
              <strong className="font-medium text-foreground">
                Löschanfragen:
              </strong>{" "}
              Ohne Zugang zum Konto können Sie die Löschung oder Auskunft per
              E-Mail an{" "}
              <a
                href={`mailto:${op.email}`}
                className="text-amber-gold underline-offset-2 hover:underline"
              >
                {op.email}
              </a>{" "}
              beantragen. Zur Verifikation können wir eine Rückfrage an die bei
              uns hinterlegte E-Mail-Adresse stellen.
            </P>
            <P>
              Eine Löschung ist nicht möglich, soweit wir zur Aufbewahrung
              gesetzlich verpflichtet sind oder berechtigte Interessen
              entgegenstehen (z. B. Abwehr von Rechtsansprüchen).
            </P>
          </Section>

          <Section id="sicherheit" title="15. Datensicherheit">
            <P>
              Wir treffen angemessene technische und organisatorische Maßnahmen
              zum Schutz Ihrer Daten, u. a.:
            </P>
            <Ul
              items={[
                "Verschlüsselte Übertragung (HTTPS/TLS)",
                "Passwort-Hashing (keine Klartextspeicherung)",
                "Zugriffsbeschränkungen und rollenbasierte Administration",
                "Hosting bei etablierten Cloud-Anbietern mit Sicherheitsstandards",
              ]}
            />
            <P>
              Absolute Sicherheit kann im Internet nicht garantiert werden. Bitte
              schützen Sie Ihre Zugangsdaten und melden Sie verdächtige Aktivitäten
              an {op.contactEmail}.
            </P>
          </Section>

          <Section id="aenderungen" title="16. Änderungen dieser Datenschutzerklärung">
            <P>
              Wir passen diese Datenschutzerklärung an, wenn sich Rechtslage,
              Dienste oder Verarbeitungspraktiken ändern. Die jeweils aktuelle
              Fassung ist auf dieser Seite abrufbar; das Datum „Stand“ oben gibt
              den Zeitpunkt der letzten wesentlichen Aktualisierung an.
            </P>
            <P>
              Bei wesentlichen Änderungen informieren wir registrierte Nutzer,
              soweit erforderlich, per E-Mail oder Hinweis in der Anwendung.
            </P>
          </Section>
        </div>

        <footer className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.08] pt-8 text-sm text-zen-muted">
          <Link href="/impressum" className="transition-colors hover:text-amber-gold">
            Impressum
          </Link>
          <Link href="/terms" className="transition-colors hover:text-amber-gold">
            Nutzungsbedingungen
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-amber-gold">
            Cookies
          </Link>
          <Link href="/support" className="transition-colors hover:text-amber-gold">
            Kontakt
          </Link>
          <Link
            href="/privacy?lang=en"
            className="transition-colors hover:text-amber-gold"
            hrefLang="en"
          >
            English version
          </Link>
        </footer>
      </article>
    </div>
  );
}
