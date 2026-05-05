import { SlashCommandBuilder, EmbedBuilder, ChannelType } from "discord.js";

// Simple in-memory storage (in production, gebruik database)
const guildSettings = new Map<string, string>();

export const data = new SlashCommandBuilder()
  .setName("vertrekbericht")
  .setDescription("Configureer het vertrekbericht")
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("Stel het kanaal voor vertrekberichten in")
      .addChannelOption((opt) =>
        opt
          .setName("kanaal")
          .setDescription("Het kanaal waar vertrekberichten gestuurd worden")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("view")
      .setDescription("Bekijk het ingestelde vertrekkanaal")
  );

export async function execute(interaction: any) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "set") {
    const channel = interaction.options.getChannel("kanaal");
    guildSettings.set(interaction.guildId, channel.id);

    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("✅ Vertrekkanaal ingesteld")
      .setDescription(`Vertrekberichten worden nu gestuurd naar ${channel}`)
      .setFooter({ text: "Leden die de server verlaten krijgen een vertrekbericht" });

    await interaction.reply({ embeds: [embed] });
  } else if (subcommand === "view") {
    const channelId = guildSettings.get(interaction.guildId);

    if (!channelId) {
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Geen kanaal ingesteld")
        .setDescription("Gebruik `/vertrekbericht set` om een kanaal in te stellen");
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor("#d4af37")
        .setTitle("📝 Hudig vertrekkanaal")
        .setDescription(`Vertrekberichten worden gestuurd naar <#${channelId}>`);
      await interaction.reply({ embeds: [embed] });
    }
  }
}

// Export voor use in main index.ts
export function registerLeaveListener(client: any) {
  client.on("guildMemberRemove", async (member: any) => {
    const channelId = guildSettings.get(member.guild.id);

    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("👋 Tot ziens!")
      .setDescription(`${member.user} heeft de server verlaten.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "Gebruiker", value: member.user.tag, inline: true },
        { name: "Leden totaal", value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: "We zullen je missen!" });

    await channel.send({ embeds: [embed] });
  });
}

export { guildSettings };
