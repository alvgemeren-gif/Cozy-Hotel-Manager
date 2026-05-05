import { SlashCommandBuilder, EmbedBuilder, ChannelType } from "discord.js";

// Simple in-memory storage (in production, gebruik database)
const guildSettings = new Map<string, string>();

export const data = new SlashCommandBuilder()
  .setName("welcome_message")
  .setDescription("Configure the welcome message")
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("Set the channel for welcome messages")
      .addChannelOption((opt) =>
        opt
          .setName("channel")
          .setDescription("The channel where welcome messages will be sent")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("view")
      .setDescription("View the set welcome channel")
  );

export async function execute(interaction: any) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "set") {
    const channel = interaction.options.getChannel("kanaal");
    guildSettings.set(interaction.guildId, channel.id);

    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("✅ Welcome channel set")
      .setDescription(`Welcome messages will now be sent to ${channel}`)
      .setFooter({ text: "New members will receive a welcome message" });

    await interaction.reply({ embeds: [embed] });
  } else if (subcommand === "view") {
    const channelId = guildSettings.get(interaction.guildId);

    if (!channelId) {
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ No channel set")
        .setDescription("Use `/welcome_message set` to set a channel");
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor("#d4af37")
        .setTitle("📝 Current welcome channel")
        .setDescription(`Welcome messages will be sent to <#${channelId}>`);
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
      .setTitle("🎉 Welcome!")
      .setDescription(`Welcome to the server, ${member.user}!`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "User", value: member.user.tag, inline: true },
        { name: "Total members", value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: "Enjoy your stay!" });

    await channel.send({ embeds: [embed] });
  });
}

export { guildSettings };
