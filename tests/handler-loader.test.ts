import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { buildBot } from "../src/bot.js";
import { runSpecs, parseBotSpec } from "../src/toolkit/index.js";

describe("buildBot handler loader", () => {
  it("loads src/handlers/start.ts so /start replies via the harness", async () => {
    const raw = JSON.parse(
      readFileSync(new URL("./specs/start.json", import.meta.url), "utf8"),
    ) as unknown[];
    const specs = raw.map(parseBotSpec);
    const suite = await runSpecs(() => buildBot("test-token"), specs);
    expect(suite.failed).toBe(0);
    expect(suite.passed).toBeGreaterThan(0);
  });

  it("unknown input falls through to the conversation handler", async () => {
    const suite = await runSpecs(() => buildBot("test-token"), [
      parseBotSpec({
        name: "unknown text hits the conversation handler",
        steps: [
          { send: { text: "qwerty" },
            expect: [{ method: "sendMessage", payload: { text: "Thanks for your message! I'm a chat assistant designed for conversation and brainstorming. You said: \"qwerty\". What would you like to explore?" } }] },
        ],
      }),
    ]);
    expect(suite.failed).toBe(0);
  });
});
