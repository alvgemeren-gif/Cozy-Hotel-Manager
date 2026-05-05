import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("review")
  .setDescription("Review een boek")
  .addStringOption((opt) =>
    opt
      .setName("titel")
      .setDescription("Titel van het boek")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("schrijver")
      .setDescription("Schrijver van het boek")
      .setRequired(true)
  )
  .addIntegerOption((opt) =>
    opt
      .setName("sterren")
      .setDescription("Aantal sterren (1-5)")
      .setMinValue(1)
      .setMaxValue(5)
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("beschrijving")
      .setDescription("Jouw beschrijving van het boek")
      .setRequired(true)
  );

function getStarRating(stars: number): string {
  const fullStar = "⭐";
  const emptyStar = "☆";
  return fullStar.repeat(stars) + emptyStar.repeat(5 - stars);
}

export async function execute(interaction: any) {
  const titel = interaction.options.getString("titel");
  const schrijver = interaction.options.getString("schrijver");
  const sterren = interaction.options.getInteger("sterren");
  const beschrijving = interaction.options.getString("beschrijving");

  const starRating = getStarRating(sterren);

  const embed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`📚 ${titel}`)
    .addFields(
      { name: "Schrijver", value: schrijver, inline: true },
      { name: "Rating", value: starRating, inline: true },
      { name: "\u200b", value: "\u200b", inline: true },
      { name: "Review", value: beschrijving }
    )
    .setFooter({
      text: `Review door ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
