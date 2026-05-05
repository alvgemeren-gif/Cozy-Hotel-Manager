import { SlashCommandBuilder } from "discord.js";
import * as minigamesCommand from "./minigames";

export const data = new SlashCommandBuilder()
  .setName("wordleguess")
  .setDescription("Submit your Wordle guess")
  .addStringOption((opt) =>
    opt
      .setName("word")
      .setDescription("Your 5-letter guess")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("session_id")
      .setDescription("The session ID from the game embed footer")
      .setRequired(true)
  );

export async function execute(interaction: any) {
  const word = interaction.options.getString("word");
  const sessionId = interaction.options.getString("session_id");
  await minigamesCommand.handleWordleGuess(interaction, word, sessionId);
}