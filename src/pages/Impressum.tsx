import { Link } from "react-router-dom";
import { LegalPage, LegalLanguage, LegalHeading } from "../components/LegalPage";
import { ROUTE_META } from "../data/routeMeta";
import { legal } from "../data/legal";

export function Impressum() {
  return (
    <LegalPage title={ROUTE_META["/impressum"].title} label="LEGAL NOTICE · IMPRESSUM">
      <LegalLanguage id="de" lang="de" heading="Impressum">
        <LegalHeading>Angaben gemäß § 5 DDG</LegalHeading>
        <p className="text-ink">
          {legal.name}
          <br />
          {legal.street}
          <br />
          {legal.city}
          <br />
          {legal.country.de}
        </p>

        <LegalHeading>Kontakt</LegalHeading>
        <p>
          E-Mail:{" "}
          <a href={`mailto:${legal.email}`} className="text-i3">
            {legal.email}
          </a>
        </p>

        <LegalHeading>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</LegalHeading>
        <p>
          {legal.name}, {legal.street}, {legal.city}
        </p>

        <LegalHeading>Haftung für Links</LegalHeading>
        <p>
          Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für
          diese fremden Inhalte kann ich keine Gewähr übernehmen. Verantwortlich ist stets der jeweilige Anbieter
          oder Betreiber der verlinkten Seite. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.
          Bei Bekanntwerden von Rechtsverletzungen entferne ich derartige Links umgehend.
        </p>

        <LegalHeading>Urheberrecht</LegalHeading>
        <p>
          Die Inhalte dieser Website (Texte, Grafiken, Diagramme) wurden von mir erstellt, soweit nicht anders
          angegeben, und unterliegen dem deutschen Urheberrecht. Die Vervielfältigung oder Verwendung über die
          gesetzlichen Schranken hinaus bedarf meiner Zustimmung.
        </p>

        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in der{" "}
          <Link to="/datenschutz" className="text-i3">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </LegalLanguage>

      <LegalLanguage id="en" lang="en" heading="Legal notice (Impressum)">
        <LegalHeading>Information pursuant to § 5 DDG (German Digital Services Act)</LegalHeading>
        <p className="text-ink">
          {legal.name}
          <br />
          {legal.street}
          <br />
          {legal.city}
          <br />
          {legal.country.en}
        </p>

        <LegalHeading>Contact</LegalHeading>
        <p>
          Email:{" "}
          <a href={`mailto:${legal.email}`} className="text-i3">
            {legal.email}
          </a>
        </p>

        <LegalHeading>Responsible for content under § 18 (2) MStV</LegalHeading>
        <p>
          {legal.name}, {legal.street}, {legal.city}
        </p>

        <LegalHeading>Liability for links</LegalHeading>
        <p>
          This website links to external third-party websites whose content I do not control, and I cannot accept
          liability for it. The respective provider or operator of a linked page is always responsible for its
          content. No legal violations were apparent when the links were added. If I learn of any, I will remove
          the link promptly.
        </p>

        <LegalHeading>Copyright</LegalHeading>
        <p>
          Unless stated otherwise, the content of this website (text, graphics, diagrams) was created by me and is
          subject to German copyright law. Reproduction or use beyond the limits of the law requires my consent.
        </p>

        <p>
          Information on how personal data is processed is in the{" "}
          <Link to="/datenschutz" className="text-i3">
            privacy notice
          </Link>
          .
        </p>
      </LegalLanguage>
    </LegalPage>
  );
}
