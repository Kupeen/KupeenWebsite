import { describe, expect, it } from "vitest";
import { cutAtWord, flatten, isWebUrl, splitLinks, teaser, titleOf } from "./text";

describe("texts from Facebook", () => {
  it("makes a teaser of whole words on one line", () => {
    expect(flatten("Hej\n\n  med dig\nigen")).toBe("Hej med dig igen");
    expect(cutAtWord("Kom og vær med til endnu en aften", 20)).toBe("Kom og vær med til …");
    expect(teaser("Kort tekst")).toBe("Kort tekst");
    expect(teaser("ord ".repeat(80)).length).toBeLessThanOrEqual(202);
  });

  it("takes a post's first line as its title", () => {
    expect(titleOf("Vi har holdt på en lille hemmelighed…!\n\nI morgen …")).toBe("Vi har holdt på en lille hemmelighed…!");
    const long = "Skørping Kulturforening siger tak for en hylende morsom aften igår med Jan Gintberg som vært - vi har";
    expect(titleOf(long)).toBe("Skørping Kulturforening siger tak for en hylende morsom aften igår med Jan Gintberg som …");
  });

  it("accepts only http and https addresses", () => {
    expect(isWebUrl("https://place2book.com/da/sw2/sales/7wjj0ji1ou")).toBe(true);
    expect(isWebUrl("javascript:alert(1)")).toBe(false);
    expect(isWebUrl("place2book.com")).toBe(false);
    expect(isWebUrl("")).toBe(false);
    expect(isWebUrl(undefined)).toBe(false);
  });

  it("finds the addresses in a text, without the full stop after them", () => {
    expect(splitLinks("Billetter: https://place2book.com/x. Vi ses!")).toEqual([
      { text: "Billetter: " },
      { url: "https://place2book.com/x" },
      { text: ". Vi ses!" },
    ]);
    expect(splitLinks("Ingen links her")).toEqual([{ text: "Ingen links her" }]);
  });
});
