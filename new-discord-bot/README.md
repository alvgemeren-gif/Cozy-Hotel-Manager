# New Discord Bot

Een eenvoudige Discord-bot starter.

## Setup

1. Installeer dependencies:
   ```bash
   pnpm install
   ```

2. Kopieer `.env.example` naar `.env` en vul je token in:
   ```bash
   cp .env.example .env
   ```

3. Start de bot in development:
   ```bash
   pnpm run dev
   ```

## Commands

- `!ping` - de bot antwoordt met `Pong!`

## Render deployment

1. Zorg dat je `DISCORD_TOKEN` als secret in Render toevoegt.
2. Zorg dat je service `root` naar `new-discord-bot` wijst.
3. Gebruik deze build command:
   ```bash
   pnpm install && pnpm run build
   ```
4. Gebruik deze start command:
   ```bash
   pnpm run start
   ```
5. Zet een external health check op naar `/healthz` zodat je app wakker blijft.
