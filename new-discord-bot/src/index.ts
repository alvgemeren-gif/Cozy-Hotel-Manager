import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import * as embedsCommand from "./commands/embeds";
import * as welkomstCommand from "./commands/welkomstbericht";
import * as vertrekCommand from "./commands/vertrekbericht";
import * as keuzerollenCommand from "./commands/keuzerollen";
import * as reviewCommand from "./commands/review";
import * as countingCommand from "./commands/counting";
import * as countCommand from "./commands/count";

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
    GatewayIntentBits.GuildMembers,
  ],
}) as any;

client.commands = new Collection();

// Register slash commands
const commands = [embedsCommand, welkomstCommand, vertrekCommand, keuzerollenCommand, reviewCommand, countingCommand, countCommand];
commands.forEach((cmd: any) => {
  client.commands.set(cmd.data.name, cmd);
});

// Register event listeners
welkomstCommand.registerWelcomeListener(client);
vertrekCommand.registerLeaveListener(client);
keuzerollenCommand.registerRoleButtonHandler(client);

client.once(Events.ClientReady, (c: any) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: any) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Error executing command:", error);
      await interaction.reply({
        content: "An error occurred!",
        ephemeral: true,
      });
    }
  } else if (interaction.isModalSubmit()) {
    // Handle modal submissions
    if (interaction.customId.startsWith("review_")) {
      try {
        await reviewCommand.handleModal(interaction);
      } catch (error) {
        console.error("Error handling modal:", error);
        await interaction.reply({
          content: "An error occurred while processing your review!",
          ephemeral: true,
        });
      }
    }
  }
});

client.on(Events.MessageCreate, async (message: any) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    await message.reply("Pong!");
  }
});

client.login(token).catch((error: any) => {
  console.error("Failed to login:", error);
  process.exit(1);
});
