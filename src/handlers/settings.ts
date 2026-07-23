import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
];

const composer = new Composer<Ctx>();

function settingsMenu(lang?: string) {
  const current = LANGUAGES.find((l) => l.code === lang);
  const langLabel = current ? current.label : "English";
  return {
    text:
      "⚙️ Settings\n\n" +
      `Language: ${langLabel}\n` +
      "Conversation history: stored locally",
    markup: inlineKeyboard([
      [inlineButton("🌐 Change language", "settings:lang")],
      [inlineButton("🗑 Clear history", "settings:clear")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  };
}

composer.command("settings", async (ctx) => {
  const { text, markup } = settingsMenu(ctx.session.language);
  await ctx.reply(text, { reply_markup: markup });
});

composer.callbackQuery("settings:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  const { text, markup } = settingsMenu(ctx.session.language);
  await ctx.editMessageText(text, { reply_markup: markup });
});

composer.callbackQuery("settings:lang", async (ctx) => {
  await ctx.answerCallbackQuery();
  const buttons = LANGUAGES.map((l) => [inlineButton(l.label, `settings:set:${l.code}`)]);
  buttons.push([inlineButton("⬅️ Back", "settings:show")]);
  await ctx.editMessageText("🌐 Pick your language:", {
    reply_markup: inlineKeyboard(buttons),
  });
});

composer.callbackQuery(/^settings:set:(.+)$/, async (ctx) => {
  const code = ctx.match?.[1];
  if (!code) return;
  ctx.session.language = code;
  const lang = LANGUAGES.find((l) => l.code === code);
  await ctx.answerCallbackQuery({ text: `Language set to ${lang?.label ?? code}` });
  const { text, markup } = settingsMenu(code);
  await ctx.editMessageText(text, { reply_markup: markup });
});

composer.callbackQuery("settings:clear", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "🗑 Clear conversation history?\n\nThis will remove all past messages from my memory.",
    {
      reply_markup: inlineKeyboard([
        [
          inlineButton("✅ Yes, clear it", "settings:clear:yes"),
          inlineButton("❌ No, keep it", "settings:show"),
        ],
      ]),
    },
  );
});

composer.callbackQuery("settings:clear:yes", async (ctx) => {
  ctx.session.messageHistory = [];
  ctx.session.messageTimestamps = [];
  await ctx.answerCallbackQuery({ text: "History cleared" });
  const { text, markup } = settingsMenu(ctx.session.language);
  await ctx.editMessageText(text, { reply_markup: markup });
});

export default composer;
