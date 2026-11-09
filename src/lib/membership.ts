// The membership form: its types, fields and checks. The texts and rules are those of the club's current form.

export interface MembershipType {
  id: "ung" | "almindelig" | "plus" | "erhverv";
  name: string;
  price: string;
  /** How the receipt names it: »Du er tilmeldt som …« */
  as: string;
  /** Free memberships get no invoice. */
  free: boolean;
}

export const MEMBERSHIP_TYPES: MembershipType[] = [
  { id: "ung", name: "Ungemedlem", price: "Gratis", as: "ungemedlem", free: true },
  { id: "almindelig", name: "Almindeligt medlem", price: "100 kr.", as: "almindeligt medlem", free: false },
  { id: "plus", name: "Plusmedlem", price: "500 kr.", as: "plusmedlem", free: false },
  { id: "erhverv", name: "Erhverv", price: "1000 kr.", as: "erhvervsmedlem", free: false },
];

export type FieldName = "name" | "address" | "zip" | "city" | "email" | "phone" | "birthdate";

export interface MembershipField {
  name: FieldName;
  label: string;
  type: "text" | "tel" | "date";
  autoComplete: string;
  inputMode?: "numeric" | "email" | "tel";
  /** Spans the whole width of the form. */
  full?: boolean;
  message: string;
}

export const MEMBERSHIP_FIELDS: MembershipField[] = [
  { name: "name", label: "NAVN", type: "text", autoComplete: "name", full: true, message: "Du skal skrive dit navn" },
  { name: "address", label: "ADRESSE", type: "text", autoComplete: "street-address", full: true, message: "Du skal skrive din adresse" },
  { name: "zip", label: "POSTNUMMER", type: "text", autoComplete: "postal-code", inputMode: "numeric", message: "Du skal skrive dit postnummer" },
  { name: "city", label: "BY", type: "text", autoComplete: "address-level2", message: "Du skal skrive et bynavn" },
  // A text field, not type="email": the browser's own check would stop »Send« before our message shows.
  { name: "email", label: "EMAIL", type: "text", autoComplete: "email", inputMode: "email", message: "Du skal skrive en gyldig email" },
  { name: "phone", label: "TELEFON", type: "tel", autoComplete: "tel", inputMode: "tel", message: "Du skal skrive et telefonnummer" },
  { name: "birthdate", label: "FØDSELSDATO", type: "date", autoComplete: "bday", message: "Du skal vælge din fødselsdato" },
];

export const TYPE_MESSAGE = "Du skal vælge en type";

export type MembershipErrors = Partial<Record<FieldName | "type", string>>;

export interface Application {
  type: MembershipType;
  values: Record<FieldName, string>;
}

/** The application, or the message for every field that needs fixing. */
export function checkApplication(
  type: MembershipType | null,
  value: (name: FieldName) => string,
): { application: Application } | { errors: MembershipErrors } {
  const errors: MembershipErrors = {};
  if (!type) errors.type = TYPE_MESSAGE;
  const values = {} as Record<FieldName, string>;
  for (const field of MEMBERSHIP_FIELDS) {
    const v = value(field.name).trim();
    values[field.name] = v;
    const ok = field.name === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : v.length > 0;
    if (!ok) errors[field.name] = field.message;
  }
  if (!type || Object.keys(errors).length > 0) return { errors };
  return { application: { type, values } };
}

/** The receipt's text once the application has been sent. */
export function receiptText({ type, values }: Application): string {
  return type.free
    ? `Du er tilmeldt som ${type.as}. Det er gratis, så der kommer ingen faktura; vi kontakter dig snarest på ${values.email}.`
    : `Du er tilmeldt som ${type.as}. Kupéen sender en faktura på ${type.price} til ${values.email}.`;
}

export type SendResult = { sent: true } | { sent: false; reason: "not-connected" };

/**
 * Sends the application to the club. Where it goes (Netlify Forms, a mail service or the club's database) is not
 * decided yet, so nothing is sent and nothing leaves the browser.
 */
export async function sendApplication(application: Application): Promise<SendResult> {
  void application;
  return { sent: false, reason: "not-connected" };
}
