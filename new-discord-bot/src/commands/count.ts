import { SlashCommandBuilder } from "discord.js";
import * as countingCommand from "./counting";

export const data = new SlashCommandBuilder()
  .setName("count")
  .setDescription("Submit your number in the counting game")
  .addIntegerOption((opt) =>
    opt
      .setName("number")
      .setDescription("The number you want to count")
      .setRequired(true)
  );

export async function execute(interaction: any) {
  const number = interaction.options.getInteger("number");
  await countingCommand.handleCount(interaction, number);
}