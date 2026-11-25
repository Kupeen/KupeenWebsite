import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { applicationBody, checkApplication, FORM_NAME, HONEYPOT_FIELD, MEMBERSHIP_FIELDS, MEMBERSHIP_TYPES, receiptText, sendApplication, type FieldName } from "./membership";

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

  const application = () => {
    const result = checkApplication(MEMBERSHIP_TYPES[1], (name) => filled[name]);
    if (!("application" in result)) throw new Error("expected an application");
    return result.application;
  };

  it("posts the application url-encoded to Netlify Forms, with the form's name and the type with its price", async () => {
    let request: { url: string; init?: RequestInit } | null = null;
    const post = (async (url: string, init?: RequestInit) => {
      request = { url, init };
      return new Response("", { status: 200 });
    }) as typeof fetch;
    expect(await sendApplication(application(), "", post)).toEqual({ sent: true });
    expect(request!.url).toBe("/");
    expect(request!.init?.method).toBe("POST");
    expect(request!.init?.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
    const body = new URLSearchParams(String(request!.init?.body));
    expect(body.get("form-name")).toBe("medlemskab");
    expect(body.get("type")).toBe("Almindeligt medlem (100 kr.)");
    expect(body.get("name")).toBe("Mette Kjær");
    expect(body.get("birthdate")).toBe("1980-05-01");
    expect(body.get(HONEYPOT_FIELD)).toBe("");
  });

  it("counts an error answer or no answer as not sent", async () => {
    const refused = (async () => new Response("", { status: 404 })) as unknown as typeof fetch;
    const offline = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await sendApplication(application(), "", refused)).toEqual({ sent: false });
    expect(await sendApplication(application(), "", offline)).toEqual({ sent: false });
  });

  it("matches the static copy Netlify detects the form from (public/forms.html)", () => {
    const html = readFileSync(new URL("../../public/forms.html", import.meta.url), "utf8");
    expect(html).toContain(`name="${FORM_NAME}"`);
    expect(html).toContain(`netlify-honeypot="${HONEYPOT_FIELD}"`);
    const posted = [...new URLSearchParams(applicationBody(application())).keys()].filter((key) => key !== "form-name");
    for (const field of posted) expect(html).toContain(`name="${field}"`);
    expect(posted).toEqual(expect.arrayContaining(MEMBERSHIP_FIELDS.map((f) => f.name)));
  });
});
