import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

// In-memory storage for role panels (in production, use database)
const rolePanels = new Map<string, { messageId: string; roles: { id: string; name: string; emoji?: string }[] }>();

export const data = new SlashCommandBuilder()
  .setName("role_selection")
  .setDescription("Create a role selection panel")
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("Create a new role selection panel")
      .addStringOption((opt) =>
        opt
          .setName("title")
          .setDescription("Title of the panel")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("description")
          .setDescription("Description of the panel")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("add_role")
      .setDescription("Add a role to an existing panel")
      .addStringOption((opt) =>
        opt
          .setName("panel_id")
          .setDescription("ID of the panel (from the embed footer)")
          .setRequired(true)
      )
      .addRoleOption((opt) =>
        opt
          .setName("role")
          .setDescription("Role to add")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("emoji")
          .setDescription("Emoji for the role button (optional)")
      )
  );

export async function execute(interaction: any) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "create") {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");

    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle(title)
      .setDescription(description + "\n\nClick the buttons below to get or remove roles!")
      .setFooter({ text: `Panel ID: ${Date.now()}` });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("role_placeholder")
          .setLabel("Add roles using /role_selection add_role")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    // Store panel info
    const panelId = embed.data.footer.text.split(": ")[1];
    rolePanels.set(panelId, {
      messageId: message.id,
      roles: []
    });

  } else if (subcommand === "add_role") {
    const panelId = interaction.options.getString("panel_id");
    const role = interaction.options.getRole("role");
    const emoji = interaction.options.getString("emoji");

    const panel = rolePanels.get(panelId);
    if (!panel) {
      return await interaction.reply({
        content: "Panel not found! Check the Panel ID in the embed footer.",
        ephemeral: true
      });
    }

    // Check if role already exists
    if (panel.roles.some(r => r.id === role.id)) {
      return await interaction.reply({
        content: "This role is already in the panel!",
        ephemeral: true
      });
    }

    // Add role to panel
    panel.roles.push({
      id: role.id,
      name: role.name,
      emoji: emoji || undefined
    });

    // Update the embed with new buttons
    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("Role Selection")
      .setDescription("Click the buttons below to get or remove roles!")
      .setFooter({ text: `Panel ID: ${panelId}` });

    const row = new ActionRowBuilder<ButtonBuilder>();

    panel.roles.forEach((roleData) => {
      const button = new ButtonBuilder()
        .setCustomId(`role_${roleData.id}`)
        .setLabel(roleData.emoji ? `${roleData.emoji} ${roleData.name}` : roleData.name)
        .setStyle(ButtonStyle.Primary);

      row.addComponents(button);
    });

    try {
      const channel = interaction.channel;
      const message = await channel.messages.fetch(panel.messageId);

      await message.edit({
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: `Added role ${role.name} to the panel!`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: "Failed to update the panel. Make sure the message still exists.",
        ephemeral: true
      });
    }
  }
}

// Handle button interactions
export function registerRoleButtonHandler(client: any) {
  client.on("interactionCreate", async (interaction: any) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith("role_")) {
      const roleId = interaction.customId.split("_")[1];

      try {
        const member = interaction.member;
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
          return await interaction.reply({
            content: "Role not found!",
            ephemeral: true
          });
        }

        if (member.roles.cache.has(roleId)) {
          // Remove role
          await member.roles.remove(roleId);
          await interaction.reply({
            content: `Removed role ${role.name}!`,
            ephemeral: true
          });
        } else {
          // Add role
          await member.roles.add(roleId);
          await interaction.reply({
            content: `Added role ${role.name}!`,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error("Error handling role button:", error);
        await interaction.reply({
          content: "An error occurred while managing your role.",
          ephemeral: true
        });
      }
    }
  });
}

export { rolePanels };
