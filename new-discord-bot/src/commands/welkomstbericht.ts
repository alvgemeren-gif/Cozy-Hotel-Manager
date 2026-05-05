import { SlashCommandBuilder, EmbedBuilder, ChannelType } from "discord.js";

// Simple in-memory storage (in production, gebruik database)
const guildSettings = new Map<string, string>();

export const data = new SlashCommandBuilder()
  .setName("welkomstbericht")
  .setDescription("Configureer het welkomstbericht")
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("Stel het kanaal voor welkomstberichten in")
      .addChannelOption((opt) =>
        opt
          .setName("kanaal")
          .setDescription("Het kanaal waar welkomstberichten gestuurd worden")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("view")
      .setDescription("Bekijk het ingestelde welkomstkanaal")
  );

export async function execute(interaction: any) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "set") {
    const channel = interaction.options.getChannel("kanaal");
    guildSettings.set(interaction.guildId, channel.id);

    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("✅ Welkomstkanaal ingesteld")
      .setDescription(`Welkomstberichten worden nu gestuurd naar ${channel}`)
      .setFooter({ text: "Nieuwe leden krijgen een welkomstbericht" });

    await interaction.reply({ embeds: [embed] });
  } else if (subcommand === "view") {
    const channelId = guildSettings.get(interaction.guildId);

    if (!channelId) {
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Geen kanaal ingesteld")
        .setDescription("Gebruik `/welkomstbericht set` om een kanaal in te stellen");
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor("#d4af37")
        .setTitle("📝 Hudig welkomstkanaal")
        .setDescription(`Welkomstberichten worden gestuurd naar <#${channelId}>`);
      await interaction.reply({ embeds: [embed] });
    }
  }
}

// Export voor use in main index.ts
export function registerWelcomeListener(client: any) {
  client.on("guildMemberAdd", async (member: any) => {
    const channelId = guildSettings.get(member.guild.id);

    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("🎉 Welkom!")
      .setDescription(`Welkom op de server, ${member.user}!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "Gebruiker", value: member.user.tag, inline: true },
        { name: "Leden totaal", value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: "Veel plezier!" });

    await channel.send({ embeds: [embed] });
  });
}

export { guildSettings };
