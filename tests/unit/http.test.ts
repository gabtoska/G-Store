import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { readJson } from "../../src/server/http";

test("mutation boundary rejects cross-origin requests, wrong media types, invalid JSON and oversized bodies", async () => {
  const origin = new URL(process.env.AUTH_URL ?? "http://localhost:3000")
    .origin;
  const request = (
    body: string,
    source = origin,
    contentType = "application/json",
  ) =>
    new Request(`${origin}/api/orders`, {
      method: "POST",
      body,
      headers: { Origin: source, "Content-Type": contentType },
    });
  const schema = z.object({ ok: z.boolean() }).strict();
  assert.deepEqual(await readJson(request('{"ok":true}'), schema), {
    ok: true,
  });
  await assert.rejects(
    readJson(request('{"ok":true}', "https://other.example"), schema),
    { status: 403 },
  );
  await assert.rejects(
    readJson(request('{"ok":true}', origin, "text/plain"), schema),
    { status: 415 },
  );
  await assert.rejects(readJson(request("{broken"), schema), { status: 400 });
  await assert.rejects(
    readJson(request('"' + "a".repeat(32768) + '"'), schema),
    { status: 413 },
  );
});
