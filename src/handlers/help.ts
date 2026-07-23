import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const HELP =
  "💡 Here are some things you can try:\n\n" +
  "\"What's the weather like?\"\n" +
  "\"Help me brainstorm gift ideas\"\n" +
  "\"Explain quantum computing simply\"\n" +
  "\"What should I cook for dinner?\"\n\n" +
  "Just type naturally — I'll do my best to help!\n\n" +
  "🔒 Safety: I keep your chats private and never share your data.";

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

const composer = new Composer<Ctx>();

composer.command("help", async (ctx) => {
  await ctx.reply(HELP);
});

composer.callbackQuery("menu:help", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(HELP, { reply_markup: backToMenu });
});

export default composer;
