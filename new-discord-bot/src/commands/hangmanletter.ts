import { SlashCommandBuilder } from "discord.js";
import * as minigamesCommand from "./minigames";

export const data = new SlashCommandBuilder()
  .setName("hangmanletter")
  .setDescription("Guess a letter in Hangman")
  .addStringOption((opt) =>
    opt
      .setName("letter")
      .setDescription("A single letter to guess")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("session_id")
      .setDescription("The session ID from the game embed footer")
      .setRequired(true)
  );

export async function execute(interaction: any) {
  const letter = interaction.options.getString("letter");
  const sessionId = interaction.options.getString("session_id");
  await minigamesCommand.handleHangmanGuess(interaction, letter, sessionId);
}