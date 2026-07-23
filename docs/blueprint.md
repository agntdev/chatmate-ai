# General Chat Assistant — Bot specification

**Archetype:** custom

**Voice:** warm and encouraging — write every user-facing message, button label, error, and empty state in this voice.

A free, privacy-focused Telegram bot for general Q&A, casual conversation, and brainstorming. Maintains private per-user chat history with configurable language preferences and gentle usage limits.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- General Telegram users seeking conversational AI assistance

## Success criteria

- Handles Q&A and casual conversation in private 1:1 chats
- Maintains contextual chat history for 20 messages per user
- Implements per-user rate limiting (60 messages/hour default)
- Provides language preference settings and privacy controls

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Display welcome message with usage hints and privacy note
- **/help** (command, actor: user, command: /help) — Show sample prompts and safety guidance
- **/settings** (command, actor: user, command: /settings) — Configure language preferences or clear conversation history

## Flows

### onboarding
_Trigger:_ /start

1. Send welcome message
2. Display usage examples
3. Show privacy notice

_Data touched:_ user_profiles

### conversation
_Trigger:_ private chat message

1. Receive user message
2. Generate contextual response
3. Store message in session history

_Data touched:_ conversation_sessions, bot_messages

### settings_management
_Trigger:_ /settings

1. Display language selection
2. Process preference changes
3. Confirm action completion

_Data touched:_ user_profiles

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **user_profiles** _(retention: persistent)_ — Telegram ID, display name, language preference, opt-out flags
  - fields: telegram_id, display_name, language, opt_out_flags
- **conversation_sessions** _(retention: persistent)_ — Private chat history with rolling window context
  - fields: user_id, message_history, timestamps
- **bot_messages** _(retention: session)_ — Generated responses and system messages
  - fields: message_id, content, timestamp

## Integrations

- **Telegram** (required) — Bot API messaging
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Configure rate limits (messages/hour)
- Adjust context window size (messages kept)
- Manage content filtering policies
- Set data retention duration (default 30 days)

## Permissions & privacy

- Private 1:1 chats only (no group sharing)
- User data retained 30 days max
- Conversation history purged automatically
- User consent required for data retention

## Edge cases

- Handle message rate limit violations gracefully
- Manage unsupported language requests
- Provide fallback responses for system errors
- Prevent public chat room abuse attempts

## Required tests

- End-to-end conversation flow with context retention
- Rate limiting behavior under load
- Settings persistence across sessions
- Privacy mode verification

## Assumptions

- Default context window of 20 messages
- English as primary language with optional translations
- 60 messages/hour rate limit as baseline
