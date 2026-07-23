import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "💬 Chat", data: "chat:start", order: 10 });
registerMainMenuItem({ label: "⚙️ Settings", data: "settings:show", order: 30 });

const WELCOME =
  "👋 Hi there! I'm your personal chat assistant.\n\n" +
  "Just send me a message and I'll reply. Here's what I can do:\n" +
  "• Answer questions and brainstorm ideas\n" +
  "• Help you think through problems\n" +
  "• Have a friendly conversation\n\n" +
  "🔒 Your chats are private — I never share your messages.";

const composer = new Composer<Ctx>();

composer.command("start", async (ctx) => {
  await ctx.reply(WELCOME, {
    reply_markup: inlineKeyboard([
      [inlineButton("💬 Start chatting", "chat:start")],
      [inlineButton("⚙️ Settings", "settings:show")],
    ]),
  });
});

composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(WELCOME, {
    reply_markup: inlineKeyboard([
      [inlineButton("💬 Start chatting", "chat:start")],
      [inlineButton("⚙️ Settings", "settings:show")],
    ]),
  });
});

export default composer;
