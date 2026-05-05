import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("embeds")
  .setDescription("Stuurt een mooie embed");

export async function execute(interaction: any) {
  const embed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle("Welkom!")
    .setDescription("Dit is een test embed met goudkleur.")
    .setFooter({ text: "Gemaakt door de bot" });

  await interaction.reply({ embeds: [embed] });
}
