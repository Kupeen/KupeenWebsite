import { describe, expect, it } from "vitest";
import { checkApplication, MEMBERSHIP_TYPES, receiptText, sendApplication, type FieldName } from "./membership";

const filled: Record<FieldName, string> = {
  name: "Mette Kjær",
  address: "Sverriggårdsvej 3",
  zip: "9520",
  city: "Skørping",
  email: "mette@example.dk",
  phone: "12345678",
  birthdate: "1980-05-01",
};

describe("the membership form", () => {
  it("names every field that is missing or wrong, and a missing type", () => {
    const result = checkApplication(null, (name) => (name === "email" ? "mette@" : ""));
    expect("errors" in result && result.errors).toEqual({
      type: "Du skal vælge en type",
      name: "Du skal skrive dit navn",
      address: "Du skal skrive din adresse",
      zip: "Du skal skrive dit postnummer",
      city: "Du skal skrive et bynavn",
      email: "Du skal skrive en gyldig email",
      phone: "Du skal skrive et telefonnummer",
      birthdate: "Du skal vælge din fødselsdato",
    });
  });

  it("accepts a filled form and writes the receipt", () => {
    const plus = MEMBERSHIP_TYPES[2];
    const result = checkApplication(plus, (name) => ` ${filled[name]} `);
    expect("application" in result).toBe(true);
    if (!("application" in result)) return;
    expect(result.application.values.name).toBe("Mette Kjær");
    expect(receiptText(result.application)).toBe("Du er tilmeldt som plusmedlem. Kupéen sender en faktura på 500 kr. til mette@example.dk.");
    const young = { ...result.application, type: MEMBERSHIP_TYPES[0] };
    expect(receiptText(young)).toContain("Det er gratis, så der kommer ingen faktura");
  });

  it("does not send anything until a way of sending is chosen", async () => {
    const result = checkApplication(MEMBERSHIP_TYPES[1], (name) => filled[name]);
    if (!("application" in result)) throw new Error("expected an application");
    expect(await sendApplication(result.application)).toEqual({ sent: false, reason: "not-connected" });
  });
});
