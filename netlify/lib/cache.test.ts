import { expect, test } from "vitest";
import { cached } from "./cache";

test("calls within the hour share one answer, also while it is on its way", async () => {
  let calls = 0;
  let clock = 0;
  const get = cached(async () => ++calls, 3600, () => clock);
  expect(await Promise.all([get(), get(), get()])).toEqual([1, 1, 1]);
  clock = 3599_000;
  expect(await get()).toBe(1);
  clock = 3600_000;
  expect(await get()).toBe(2);
  expect(calls).toBe(2);
});

test("an error keeps the last good answer, and without one it is passed on and not kept", async () => {
  let fail = false;
  let clock = 0;
  const get = cached(async () => {
    if (fail) throw new Error("Facebook is down");
    return "events";
  }, 3600, () => clock);
  await expect(cached(async () => { throw new Error("first"); })()).rejects.toThrow("first");
  expect(await get()).toBe("events");
  fail = true;
  clock = 7200_000;
  expect(await get()).toBe("events");
});
