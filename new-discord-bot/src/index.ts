import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits, Events } from "discord.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("DISCORD_TOKEN is required in .env");
}

const port = Number(process.env.PORT ?? 3000);
if (Number.isNaN(port) || port <= 0) {
  throw new Error("Invalid PORT value.");
}

const app = express();
app.get("/healthz", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Health endpoint available at http://localhost:${port}/healthz`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    await message.reply("Pong!");
  }
});

client.login(token).catch((error) => {
  console.error("Failed to login:", error);
  process.exit(1);
});
