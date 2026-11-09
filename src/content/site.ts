// The site's fixed texts and facts. Events, news and photos come from Facebook through /api/…

import type { MembershipType } from "../lib/membership";

export const FACEBOOK_PAGE_URL = "https://www.facebook.com/profile.php?id=100088983360099";
export const CONTACT_EMAIL = "kulturrebild@gmail.com";
export const ADDRESS = { street: "Sverriggårdsvej 3", zip: "9520", town: "Skørping" };

/** The page's sections in order. Each is a »perron« with its own colour; the photo section only shows with photos. */
export type SectionId = "forside" | "aktiviteter" | "nyheder" | "billeder" | "frivillig" | "om-os" | "bliv-medlem";

export const SECTIONS: { id: SectionId; label: string; colour: string }[] = [
  { id: "forside", label: "Forside", colour: "var(--tomato)" },
  { id: "aktiviteter", label: "Aktiviteter", colour: "var(--gold)" },
  { id: "nyheder", label: "Nyheder", colour: "var(--pink)" },
  { id: "billeder", label: "Billeder", colour: "var(--sky)" },
  { id: "frivillig", label: "Frivillig", colour: "var(--teal)" },
  { id: "om-os", label: "Om os", colour: "var(--cream)" },
  { id: "bliv-medlem", label: "Bliv medlem", colour: "var(--lilac)" },
];

export const WELCOME_TEXT =
  "Kupéen er et lokalt mødested i hjertet af Skørping – af, med og for nærområdet. Det hele drives af frivillige: naboer, der står i baren, rigger lyden til og fylder kalenderen med koncerter, strik, quiz og brætspil. Og alle er velkomne ombord, også dig, der bare kommer forbi.";

/** The train's carriages spell the name; each has its own colour. */
export const CARRIAGE_COLOURS = ["var(--tomato)", "var(--gold)", "var(--teal)", "var(--pink)", "var(--cream)", "var(--teal)"];

export const VOLUNTEER_TEXT =
  "Alt i Kupéen sker, fordi nogen har lyst: frivillige fra Skørping og omegn står i baren, booker bands, rigger lyden til, bager kage og rydder op bagefter. Kupéen er af, med og for nærområdet – og alle andre er lige så velkomne.";

export const AF_MED_FOR = [
  { word: "AF", rest: "nærområdet", text: "Frivillige fra Skørping og omegn driver det hele.", colour: "var(--tomato)" },
  { word: "MED", rest: "nærområdet", text: "Lokale musikere, foreninger og ildsjæle laver programmet sammen med os.", colour: "var(--gold)" },
  { word: "FOR", rest: "nærområdet – og alle andre", text: "Et mødested for naboer og for alle, der kigger forbi.", colour: "var(--teal)" },
];

export const IDEAS_TEXT =
  "Har du en god idé til en aktivitet, et event eller noget, du gerne vil dele med fællesskabet? Vi er altid åbne for input og hjælper gerne med at få dine idéer ud i livet.";

export const ABOUT_TEXT =
  "Kupéen er mere end bare et café-lignende sted. Udover et varieret udvalg af drikkevarer, tilbyder Kupéen en lang række aktiviteter, der appellerer til både musikelskere, kreative sjæle og brætspilsfanatikere. Åbn en dør:";

/** »Vælg din kupé«: what Kupéen offers, one compartment each. */
export const OFFERS = [
  {
    title: "Vinylplader",
    text: "Køb eller lyt til din yndlingsmusik på klassiske vinylplader. Kupéen sætter fokus på den nostalgiske lyd og den unikke atmosfære, som kun vinyl kan give.",
    colour: "var(--tomato)",
  },
  {
    title: "Kreative aktiviteter",
    text: "Er du til DIY-projekter eller ønsker at udfolde din kreative side, så er Kupéen det perfekte sted. Der er jævnligt workshops og aktiviteter, hvor du kan lave alt fra maleri til håndarbejde og meget mere.",
    colour: "var(--gold)",
  },
  {
    title: "Brætspilscafé",
    text: "Kupéen er også hjem for en hyggelig brætspilscafé, hvor du kan udfordre vennerne eller møde nye mennesker til en omgang spil. Der er spil for alle smag og aldre, og stemningen er altid uformel og sjov.",
    colour: "var(--pink)",
  },
  {
    title: "Musik og koncerter",
    text: "Kupéen byder også på live musik og koncerter, hvor vi har særlig fokus på at skabe platform for lokale talenter, hvilket giver stedet en ekstra energi og en mulighed for at opleve nye musikgenrer.",
    colour: "var(--cream)",
  },
  {
    title: "Musikbingo, stand-up, højskolesange og alt muligt andet",
    text: "For dem der elsker lidt sjov og fællesskab, er musikbingo og fællessang en fast del af Kupéens tilbud. Her kan man både få rørt lattermusklerne og synge sammen med andre – en oplevelse, der styrker fællesskabet.",
    colour: "var(--gold)",
  },
];

export const MEMBERSHIP_TEXT =
  "Støt Kupéen med et medlemskab og få gode fordele. Klip din billet, udfyld formularen, og få tilsendt en faktura via din email.";

/** The membership cards: the text, colour and tilt of each type. */
export const MEMBERSHIP_CARDS: Record<MembershipType["id"], { text: string; colour: string; tilt: number }> = {
  ung: { text: "Unge under 25 år - der er også fortsat ungerabatter.", colour: "var(--teal)", tilt: -1.5 },
  almindelig: { text: "Et årligt medlemskab der giver stemmeret.", colour: "var(--gold)", tilt: 1 },
  plus: { text: "Et årligt medlemskab med nogle udefinerede goder.", colour: "var(--pink)", tilt: -0.8 },
  erhverv: { text: "Et erhvervsmedlemskab giver plads til et logo i vores årsprogram.", colour: "var(--cream)", tilt: 1.4 },
};
