# New Discord Bot

A simple Discord bot starter.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in your token:
   ```bash
   cp .env.example .env
   ```

3. Start the bot in development:
   ```bash
   pnpm run dev
   ```

## Commands

- `!ping` - the bot responds with `Pong!`

## Render deployment

1. Make sure `DISCORD_TOKEN` is added as a secret in Render.
2. Make sure the service root points to `new-discord-bot`.
3. Use this build command:
   ```bash
   pnpm install && pnpm run build
   ```
4. Use this start command:
   ```bash
   pnpm run start
   ```
5. Set an external health check to `/healthz` so your app stays awake.
