import type { ReactNode } from "react";
import { ADDRESS, CONTACT_EMAIL } from "../content/site";
import { Footer } from "../sections/Footer";

/** A fact only the club can fill in. Shown highlighted, so the page cannot go out with a gap nobody noticed. */
function Missing({ children }: { children: ReactNode }) {
  return <mark className="missing">[{children}]</mark>;
}

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

/** /privatliv: what happens with the data the membership form collects, and that the site itself tracks nobody. */
export function PrivacyPage() {
  return (
    <div className="page privacy-page">
      <main className="wrap privacy">
        <a className="back-link" href="/">
          ← Tilbage til forsiden
        </a>
        <h1 className="heading">Privatlivspolitik</h1>
        <p className="lead">
          Her kan du læse, hvordan Skørping Kulturforening behandler dine personoplysninger, når du bruger Kupéens hjemmeside og melder dig ind
          via medlemsformularen.
        </p>

        <h2>Hvem er ansvarlig</h2>
        <p>
          Skørping Kulturforening (Kupéen), {ADDRESS.street}, {ADDRESS.zip} {ADDRESS.town}, CVR-nr. <Missing>CVR-nummer</Missing>, er dataansvarlig
          for de oplysninger, du giver os. Har du spørgsmål, så skriv til {mail} <Missing>evt. navn på kontaktperson</Missing>.
        </p>

        <h2>Når du melder dig ind</h2>
        <p>
          Medlemsformularen beder om medlemstype, navn, adresse, postnummer, by, email, telefonnummer og fødselsdato. Vi bruger oplysningerne til at
          registrere dit medlemskab, sende dig en faktura og kontakte dig om dit medlemskab. Fødselsdatoen bruger vi til{" "}
          <Missing>formålet, fx at se om du kan være ungemedlem</Missing>.
        </p>
        <p>
          Grundlaget er dit medlemskab: vi har brug for oplysningerne for at kunne optage dig som medlem og opkræve kontingent
          (databeskyttelsesforordningens artikel 6, stk. 1, litra b).
        </p>

        <h2>Hvem får oplysningerne</h2>
        <p>
          Hjemmesiden drives af Netlify, Inc., som modtager og opbevarer formularen for os og sender den videre som en email. Netlify er et
          amerikansk firma og behandler oplysningerne som vores databehandler efter sin{" "}
          <a href="https://www.netlify.com/gdpr/">databehandleraftale</a>. Overførslen til USA sker på grundlag af EU-US Data Privacy Framework,
          som Netlify er certificeret under, og EU-Kommissionens standardkontraktbestemmelser. Emailen lander i foreningens Gmail-postkasse hos
          Google.
        </p>
        <p>Vi sælger ikke dine oplysninger og giver dem ikke videre til andre.</p>

        <h2>Hvor længe gemmer vi dem</h2>
        <p>
          Vi gemmer dine oplysninger, så længe du er medlem, og sletter dem <Missing>hvornår efter udmeldelse</Missing>. Fakturaer og andet
          regnskabsmateriale gemmes i fem år, som bogføringsloven kræver.
        </p>

        <h2>Når du bruger hjemmesiden</h2>
        <p>
          Hjemmesiden sætter ingen cookies og bruger ingen statistik- eller sporingsværktøjer. Arrangementer, nyheder og billeder kommer fra
          Kupéens Facebook-side, men hentes gennem vores egen server, så din browser ikke kontakter Facebook. Klikker du på et link til Facebook,
          gælder Metas egne regler derfra.
        </p>
        <p>
          Som alle webhoteller registrerer Netlify tekniske oplysninger som din IP-adresse, når siden hentes, for at kunne levere og beskytte den.
        </p>

        <h2>Dine rettigheder</h2>
        <p>
          Du har ret til at få at vide, hvilke oplysninger vi har om dig, og til at få dem rettet eller slettet. Du kan også gøre indsigelse mod
          behandlingen, få den begrænset og få dine oplysninger udleveret. Skriv til {mail}.
        </p>
        <p>
          Er du utilfreds med, hvordan vi behandler dine oplysninger, kan du klage til Datatilsynet,{" "}
          <a href="https://www.datatilsynet.dk">www.datatilsynet.dk</a>.
        </p>

        <p className="privacy-updated">
          Senest opdateret: <Missing>dato</Missing>
        </p>
      </main>
      <Footer />
    </div>
  );
}
