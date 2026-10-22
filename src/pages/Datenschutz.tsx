import { Link } from "react-router-dom";
import { LegalPage, LegalLanguage, LegalHeading } from "../components/LegalPage";
import { ROUTE_META } from "../data/routeMeta";
import { legal } from "../data/legal";

const mail = (
  <a href={`mailto:${legal.email}`} className="text-i3">
    {legal.email}
  </a>
);

export function Datenschutz() {
  return (
    <LegalPage title={ROUTE_META["/datenschutz"].title} label="PRIVACY NOTICE · DATENSCHUTZERKLÄRUNG">
      {/* ------------------------------------------------------------------ */}
      <LegalLanguage id="de" lang="de" heading="Datenschutzerklärung">
        <LegalHeading>1. Verantwortlicher</LegalHeading>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:
          <br />
          <span className="text-ink">
            {legal.name}, {legal.street}, {legal.city}, {legal.country.de}
          </span>
          <br />
          E-Mail: {mail}
        </p>

        <LegalHeading>2. Kurzüberblick</LegalHeading>
        <p>
          Diese Website verwendet keine Cookies, keine Werbe- oder Analysedienste und speichert nichts auf Ihrem
          Endgerät. Es werden keine Schriftarten oder Skripte von Dritten nachgeladen. Personenbezogene Daten
          fallen nur an den unten genannten Stellen an: beim Hosting, bei der Domain-Auflösung, bei dem
          Besucherhinweis (nur Land) und wenn Sie mir eine E-Mail schreiben.
        </p>

        <LegalHeading>3. Hosting (GitHub Pages)</LegalHeading>
        <p>
          Die Website wird über GitHub Pages bereitgestellt (GitHub Inc., USA, ein Unternehmen der
          Microsoft-Gruppe). Beim Aufruf der Seite verarbeitet der Hosting-Anbieter technisch notwendige
          Verbindungsdaten, insbesondere Ihre IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite und Angaben zu
          Ihrem Browser. Ich selbst habe auf diese Protokolle keinen Zugriff.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO: Mein berechtigtes Interesse liegt in der sicheren und
          zuverlässigen Bereitstellung dieser Website. GitHub gibt an, unter dem EU-US Data Privacy Framework
          zertifiziert zu sein; die Übermittlung in die USA stützt sich daher auf den Angemessenheitsbeschluss der
          EU-Kommission dazu, im Übrigen auf EU-Standardvertragsklauseln.
        </p>

        <LegalHeading>4. Domain und DNS (Porkbun)</LegalHeading>
        <p>
          Die Domain adityarawat.de ist bei Porkbun LLC (USA) registriert und wird dort per DNS aufgelöst. Bei der
          Namensauflösung können technische Verbindungsdaten (in der Regel die IP-Adresse des anfragenden
          DNS-Servers) bei Porkbun anfallen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Erreichbarkeit der
          Website). Die Übermittlung in die USA stützt sich auf die EU-Standardvertragsklauseln, die Teil der
          Datenverarbeitungsvereinbarung von Porkbun sind.
        </p>

        <LegalHeading>5. Besucherhinweis (Cloudflare Worker)</LegalHeading>
        <p>
          Wenn Sie die Seite aufrufen, sendet Ihr Browser eine leere Anfrage ohne Inhalt an einen von mir
          betriebenen Cloudflare Worker (Cloudflare, Inc., USA). Der Worker ermittelt aus der technisch
          übermittelten Verbindung das Herkunftsland und schickt mir daraufhin eine kurze Benachrichtigung, die nur
          lautet: „Jemand hat die Seite geöffnet“ und das Land nennt. Es werden keine IP-Adresse, kein Ort, keine
          Netzwerkangabe, kein Browser und keine besuchte Unterseite übermittelt oder von mir gespeichert. Auf
          Ihrem Gerät wird nichts gespeichert oder ausgelesen. Die Benachrichtigung bleibt auf meinem Gerät, bis
          ich sie lösche.
        </p>
        <p>
          Zweck ist, dass ich erfahre, ob und aus welchen Ländern die Seite aufgerufen wird. Rechtsgrundlage ist
          Art. 6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse an dieser groben Reichweitenkenntnis).
          Cloudflare gibt an, unter dem EU-US Data Privacy Framework zertifiziert zu sein, und stützt sich
          hilfsweise auf EU-Standardvertragsklauseln.
        </p>
        <p>
          Sie können dem widersprechen (siehe Abschnitt 9). Technisch lässt sich die Anfrage auch durch einen
          Inhaltsblocker oder das Sperren von „*.workers.dev“ im Browser verhindern; die Seite funktioniert
          unverändert weiter.
        </p>

        <LegalHeading>6. Schriftarten</LegalHeading>
        <p>
          Die verwendeten Schriftarten (Archivo, IBM Plex Mono, Inter; Lizenz: SIL Open Font License) werden von
          dieser Website selbst ausgeliefert. Es besteht dafür keine Verbindung zu Google oder anderen
          Schriftanbietern.
        </p>

        <LegalHeading>7. Externe Links</LegalHeading>
        <p>
          Die Seite verlinkt auf externe Angebote (z. B. GitHub, Hugging Face, Coursera, LinkedIn). Erst wenn Sie
          einen solchen Link anklicken, werden Daten an den jeweiligen Anbieter übertragen. Für deren
          Datenverarbeitung gelten die dortigen Datenschutzhinweise.
        </p>

        <LegalHeading>8. Kontakt per E-Mail</LegalHeading>
        <p>
          Wenn Sie mir schreiben, verarbeite ich Ihre Nachricht und Ihre E-Mail-Adresse, um Ihre Anfrage zu
          beantworten (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Ich lösche die Daten, sobald sie dafür nicht mehr
          erforderlich sind und keine Aufbewahrungspflichten entgegenstehen.
        </p>

        <LegalHeading>9. Ihre Rechte</LegalHeading>
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
          Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen eine auf
          berechtigtem Interesse beruhende Verarbeitung (Art. 21). Schreiben Sie dazu einfach an {mail}.
        </p>
        <p>
          Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der
          Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Düsseldorf.
        </p>

        <p className="text-ink-soft">
          Stand: {legal.updated.de}. Siehe auch das{" "}
          <Link to="/impressum" className="text-i3">
            Impressum
          </Link>
          .
        </p>
      </LegalLanguage>

      {/* ------------------------------------------------------------------ */}
      <LegalLanguage id="en" lang="en" heading="Privacy notice">
        <LegalHeading>1. Controller</LegalHeading>
        <p>
          The controller for data processing on this website under the GDPR is:
          <br />
          <span className="text-ink">
            {legal.name}, {legal.street}, {legal.city}, {legal.country.en}
          </span>
          <br />
          Email: {mail}
        </p>

        <LegalHeading>2. Summary</LegalHeading>
        <p>
          This website uses no cookies, no advertising or analytics services, and stores nothing on your device. No
          third-party fonts or scripts are loaded. Personal data arises only in the places listed below: hosting,
          domain resolution, the visitor notification (country only), and when you email me.
        </p>

        <LegalHeading>3. Hosting (GitHub Pages)</LegalHeading>
        <p>
          The site is served through GitHub Pages (GitHub Inc., USA, a Microsoft company). When you open a page, the
          host processes technically necessary connection data, in particular your IP address, date and time, the
          page requested and details of your browser. I have no access to these logs.
        </p>
        <p>
          The legal basis is Art. 6(1)(f) GDPR: my legitimate interest in providing this website securely and
          reliably. GitHub states that it is certified under the EU-US Data Privacy Framework, so transfers to the
          USA rely on the European Commission&apos;s adequacy decision for that framework, and otherwise on EU
          standard contractual clauses.
        </p>

        <LegalHeading>4. Domain and DNS (Porkbun)</LegalHeading>
        <p>
          The domain adityarawat.de is registered with Porkbun LLC (USA) and resolved through its DNS. Technical
          connection data (usually the IP address of the requesting DNS server) may arise at Porkbun during name
          resolution. The legal basis is Art. 6(1)(f) GDPR (keeping the website reachable). The transfer to the USA
          relies on the EU standard contractual clauses that form part of Porkbun&apos;s data processing addendum.
        </p>

        <LegalHeading>5. Visitor notification (Cloudflare Worker)</LegalHeading>
        <p>
          When you open the site, your browser sends an empty request with no content to a Cloudflare Worker that I
          operate (Cloudflare, Inc., USA). From the connection that is transmitted technically, the Worker works
          out the country of origin and sends me a short notification that says only &ldquo;Someone opened the
          site&rdquo; and names the country. No IP address, city, network details, browser or page visited is
          passed on or stored by me. Nothing is stored on or read from your device. The notification stays on my
          device until I delete it.
        </p>
        <p>
          The purpose is to let me know whether the site is visited and from which countries. The legal basis is
          Art. 6(1)(f) GDPR (my legitimate interest in this rough picture of reach). Cloudflare states that it is
          certified under the EU-US Data Privacy Framework and falls back on EU standard contractual clauses if
          that certification lapses.
        </p>
        <p>
          You can object (see section 9). Technically you can also prevent the request with a content blocker, or
          by blocking &ldquo;*.workers.dev&rdquo; in your browser; the site keeps working as before.
        </p>

        <LegalHeading>6. Fonts</LegalHeading>
        <p>
          The fonts used (Archivo, IBM Plex Mono, Inter; licence: SIL Open Font License) are served by this website
          itself. No connection to Google or any other font provider is made for them.
        </p>

        <LegalHeading>7. External links</LegalHeading>
        <p>
          The site links to external services (for example GitHub, Hugging Face, Coursera, LinkedIn). Data is
          transmitted to those providers only once you click such a link. Their own privacy notices apply to what
          they process.
        </p>

        <LegalHeading>8. Contact by email</LegalHeading>
        <p>
          If you write to me, I process your message and your email address to answer your request (Art. 6(1)(b)
          or (f) GDPR). I delete the data once it is no longer needed for that purpose and no retention duty
          applies.
        </p>

        <LegalHeading>9. Your rights</LegalHeading>
        <p>
          You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of
          processing (Art. 18), data portability (Art. 20) and to object to processing based on legitimate
          interest (Art. 21). Just write to {mail}.
        </p>
        <p>
          You may also complain to a data protection supervisory authority, for example the State Commissioner for
          Data Protection and Freedom of Information of North Rhine-Westphalia (LDI NRW), Düsseldorf.
        </p>

        <p className="text-ink-soft">
          Last updated: {legal.updated.en}. See also the{" "}
          <Link to="/impressum" className="text-i3">
            legal notice
          </Link>
          .
        </p>
      </LegalLanguage>
    </LegalPage>
  );
}
