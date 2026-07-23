import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const CONTEXT_WINDOW = 20;

const composer = new Composer<Ctx>();

function isRateLimited(timestamps: number[], now: number): boolean {
  const cutoff = now - RATE_WINDOW_MS;
  const recent = timestamps.filter((t) => t > cutoff);
  return recent.length >= RATE_LIMIT;
}

function generateResponse(userMessage: string, history: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hey there! 👋 How can I help you today?";
  }
  if (lower.includes("how are you") || lower.includes("how's it going")) {
    return "I'm doing great, thanks for asking! 😊 What's on your mind?";
  }
  if (lower.includes("help")) {
    return "I'm here to help! You can ask me questions, brainstorm ideas, or just chat. What would you like to talk about?";
  }
  if (lower.includes("thank")) {
    return "You're welcome! 😊 Is there anything else I can help with?";
  }
  if (lower.includes("bye") || lower.includes("goodbye")) {
    return "Goodbye! 👋 Come back anytime you want to chat.";
  }

  if (history.length > 1) {
    return `I hear you! You've been sharing some interesting thoughts. Tell me more about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? "..." : ""}".`;
  }

  return `Thanks for your message! I'm a chat assistant designed for conversation and brainstorming. You said: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? "..." : ""}". What would you like to explore?`;
}

composer.callbackQuery("chat:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "💬 Let's chat!\n\nJust type a message below and I'll reply. You can ask questions, brainstorm ideas, or just have a conversation.",
    {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    },
  );
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.message.text.startsWith("/")) return next();

  const now = Date.now();
  const timestamps = ctx.session.messageTimestamps ?? [];

  if (isRateLimited(timestamps, now)) {
    await ctx.reply(
      "⏳ You've sent a lot of messages recently. Please wait a moment before sending another.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const userMessage = ctx.message.text;
  const history = ctx.session.messageHistory ?? [];

  const response = generateResponse(userMessage, history);

  ctx.session.messageHistory = [
    ...history,
    { role: "user" as const, content: userMessage, timestamp: now },
    { role: "assistant" as const, content: response, timestamp: now },
  ].slice(-CONTEXT_WINDOW * 2);

  ctx.session.messageTimestamps = [...timestamps, now].slice(-RATE_LIMIT);

  await ctx.reply(response, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;
