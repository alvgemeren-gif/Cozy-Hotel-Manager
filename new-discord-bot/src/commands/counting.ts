import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

// In-memory storage for counting sessions per channel
const countingSessions = new Map<string, {
  currentCount: number;
  lastUser: string;
  channelId: string;
  startedAt: Date;
}>();

export const data = new SlashCommandBuilder()
  .setName("startcounting")
  .setDescription("Start a counting game in this channel")
  .addStringOption((opt) =>
    opt
      .setName("starting_number")
      .setDescription("Starting number (default: 0)")
      .setRequired(false)
  )
  .addSubcommand((sub) =>
    sub
      .setName("stop")
      .setDescription("Stop the current counting game")
  );

export async function execute(interaction: any) {
  const subcommand = interaction.options.getSubcommand?.();
  const channelId = interaction.channelId;
  const sessionKey = `${interaction.guildId}-${channelId}`;

  if (subcommand === "stop") {
    const session = countingSessions.get(sessionKey);
    
    if (!session) {
      const embed = new EmbedBuilder()
        .setColor("#ff6b6b")
        .setTitle("❌ No counting game active")
        .setDescription("There is no active counting game in this channel!");

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("⏹️ Counting game stopped")
      .setDescription(`Final count: **${session.currentCount}**`)
      .addFields(
        { name: "Duration", value: `${Math.floor((Date.now() - session.startedAt.getTime()) / 1000)} seconds` }
      );

    countingSessions.delete(sessionKey);

    await interaction.reply({ embeds: [embed] });
    return;
  }

  // Start counting
  const existingSession = countingSessions.get(sessionKey);
  if (existingSession) {
    const embed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("❌ Game already active")
      .setDescription(`A counting game is already active in this channel! Current count: **${existingSession.currentCount}**`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const startNumber = parseInt(interaction.options.getString("starting_number") || "0");
  
  if (isNaN(startNumber)) {
    await interaction.reply({
      content: "❌ Starting number must be a valid number!",
      ephemeral: true
    });
    return;
  }

  const session = {
    currentCount: startNumber,
    lastUser: interaction.user.id,
    channelId: channelId,
    startedAt: new Date()
  };

  countingSessions.set(sessionKey, session);

  const embed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle("🔢 Counting game started!")
    .setDescription(`Current count: **${session.currentCount}**\n\nNext person must count: **${session.currentCount + 1}**`)
    .addFields(
      { name: "Rules", value: "• Only the correct next number counts\n• Wrong numbers are ignored\n• Use `/count` to submit your number" }
    )
    .setFooter({ text: `Started by ${interaction.user.username}` });

  await interaction.reply({ embeds: [embed] });
}

// Export function to handle /count command
export async function handleCount(interaction: any, number: number) {
  const channelId = interaction.channelId;
  const sessionKey = `${interaction.guildId}-${channelId}`;
  const session = countingSessions.get(sessionKey);

  if (!session) {
    const embed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("❌ No counting game active")
      .setDescription("Start one with `/startcounting`!");

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  // Check if same user is counting twice
  if (session.lastUser === interaction.user.id) {
    const embed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("❌ You can't count twice in a row!")
      .setDescription(`Wait for someone else to count. Current count: **${session.currentCount}**\nNext number should be: **${session.currentCount + 1}**`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const expectedNumber = session.currentCount + 1;

  if (number === expectedNumber) {
    // Correct number!
    session.currentCount = expectedNumber;
    session.lastUser = interaction.user.id;

    const embed = new EmbedBuilder()
      .setColor("#51cf66")
      .setTitle("✅ Correct!")
      .setDescription(`${interaction.user} counted **${number}** correctly!`)
      .addFields(
        { name: "Current count", value: `**${session.currentCount}**`, inline: true },
        { name: "Next number", value: `**${session.currentCount + 1}**`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  } else {
    // Wrong number - ignore it
    const embed = new EmbedBuilder()
      .setColor("#ffd43b")
      .setTitle("❌ Wrong number!")
      .setDescription(`${interaction.user} tried to count **${number}**, but the correct number is **${expectedNumber}**!\n\nCounting continues...`);

    await interaction.reply({ embeds: [embed] });
  }
}

// Get current session info
export function getSessionInfo(guildId: string, channelId: string) {
  const sessionKey = `${guildId}-${channelId}`;
  return countingSessions.get(sessionKey);
}