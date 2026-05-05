import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType
} from "discord.js";

// In-memory storage for reviews (in production, use database)
const reviews = new Map<string, any[]>();

export const data = new SlashCommandBuilder()
  .setName("review")
  .setDescription("Create and view reviews")
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("Create a new review")
      .addStringOption((opt) =>
        opt
          .setName("type")
          .setDescription("Type of review")
          .addChoices(
            { name: "📚 Book", value: "book" },
            { name: "🍽️ Recipe", value: "recipe" },
            { name: "☕ Drink", value: "drink" }
          )
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("view")
      .setDescription("View reviews")
      .addStringOption((opt) =>
        opt
          .setName("type")
          .setDescription("Type of reviews to view")
          .addChoices(
            { name: "📚 Books", value: "book" },
            { name: "🍽️ Recipes", value: "recipe" },
            { name: "☕ Drinks", value: "drink" }
          )
          .setRequired(true)
      )
  );

export async function execute(interaction: any) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "create") {
    const type = interaction.options.getString("type");

    if (type === "book") {
      const modal = new ModalBuilder()
        .setCustomId("review_book_modal")
        .setTitle("📚 Book Review");

      const titleInput = new TextInputBuilder()
        .setCustomId("book_title")
        .setLabel("Book Title")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const authorInput = new TextInputBuilder()
        .setCustomId("book_author")
        .setLabel("Author")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const ratingInput = new TextInputBuilder()
        .setCustomId("book_rating")
        .setLabel("Rating (1-5 stars)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g., 4")
        .setRequired(true);

      const reviewInput = new TextInputBuilder()
        .setCustomId("book_review")
        .setLabel("Your Review (optional)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
      const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(authorInput);
      const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput);
      const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reviewInput);

      modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

      await interaction.showModal(modal);

    } else if (type === "recipe") {
      const modal = new ModalBuilder()
        .setCustomId("review_recipe_modal")
        .setTitle("🍽️ Recipe Review");

      const titleInput = new TextInputBuilder()
        .setCustomId("recipe_title")
        .setLabel("Recipe Title")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const linkInput = new TextInputBuilder()
        .setCustomId("recipe_link")
        .setLabel("Recipe Link (optional)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const ratingInput = new TextInputBuilder()
        .setCustomId("recipe_rating")
        .setLabel("Rating (1-5 stars)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g., 4")
        .setRequired(true);

      const categoryInput = new TextInputBuilder()
        .setCustomId("recipe_category")
        .setLabel("Category (dinner, lunch, breakfast, pasta, meat, vegetarian)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g., dinner, pasta")
        .setRequired(true);

      const reviewInput = new TextInputBuilder()
        .setCustomId("recipe_review")
        .setLabel("Your Review (optional)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
      const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(linkInput);
      const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput);
      const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput);
      const fifthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reviewInput);

      modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

      await interaction.showModal(modal);

    } else if (type === "drink") {
      const modal = new ModalBuilder()
        .setCustomId("review_drink_modal")
        .setTitle("☕ Drink Review");

      const titleInput = new TextInputBuilder()
        .setCustomId("drink_title")
        .setLabel("Drink Title")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const linkInput = new TextInputBuilder()
        .setCustomId("drink_link")
        .setLabel("Recipe Link (optional)")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const ratingInput = new TextInputBuilder()
        .setCustomId("drink_rating")
        .setLabel("Rating (1-5 stars)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g., 4")
        .setRequired(true);

      const categoryInput = new TextInputBuilder()
        .setCustomId("drink_category")
        .setLabel("Category (tea, coffee, cocktail)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g., coffee, cocktail")
        .setRequired(true);

      const reviewInput = new TextInputBuilder()
        .setCustomId("drink_review")
        .setLabel("Your Review (optional)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
      const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(linkInput);
      const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput);
      const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput);
      const fifthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reviewInput);

      modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

      await interaction.showModal(modal);
    }

  } else if (subcommand === "view") {
    const type = interaction.options.getString("type");
    const guildReviews = reviews.get(interaction.guild.id) || [];
    const filteredReviews = guildReviews.filter(review => review.type === type);

    if (filteredReviews.length === 0) {
      const embed = new EmbedBuilder()
        .setColor("#ff6b6b")
        .setTitle("❌ No Reviews Found")
        .setDescription(`There are no ${type} reviews yet. Create one with \`/review create\`!`);

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Create a summary embed with all reviews
    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle(`${type === "book" ? "📚" : type === "recipe" ? "🍽️" : "☕"} ${type.charAt(0).toUpperCase() + type.slice(1)} Reviews`)
      .setDescription(`Found ${filteredReviews.length} review(s)`);

    let description = "";
    filteredReviews.forEach((review, index) => {
      const stars = "⭐".repeat(review.rating);
      if (type === "book") {
        description += `**${index + 1}. ${review.title}**\nBy ${review.author}\n${stars}\n`;
        if (review.review) description += `*${review.review}*\n`;
      } else {
        description += `**${index + 1}. ${review.title}**\n${stars}`;
        if (review.link) description += ` • [Link](${review.link})`;
        description += `\n*${review.category}*`;
        if (review.review) description += `\n${review.review}`;
        description += "\n\n";
      }
    });

    embed.setDescription(description);

    await interaction.reply({ embeds: [embed] });
  }
}

// Handle modal submissions
export async function handleModal(interaction: any) {
  if (interaction.customId === "review_book_modal") {
    const title = interaction.fields.getTextInputValue("book_title");
    const author = interaction.fields.getTextInputValue("book_author");
    const rating = parseInt(interaction.fields.getTextInputValue("book_rating"));
    const review = interaction.fields.getTextInputValue("book_review");

    if (rating < 1 || rating > 5) {
      await interaction.reply({
        content: "❌ Rating must be between 1 and 5 stars!",
        ephemeral: true
      });
      return;
    }

    const reviewData = {
      type: "book",
      title,
      author,
      rating,
      review: review || null,
      userId: interaction.user.id,
      username: interaction.user.username,
      timestamp: new Date()
    };

    const guildReviews = reviews.get(interaction.guild.id) || [];
    guildReviews.push(reviewData);
    reviews.set(interaction.guild.id, guildReviews);

    const stars = "⭐".repeat(rating);
    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("📚 Book Review Added!")
      .addFields(
        { name: "Title", value: title, inline: true },
        { name: "Author", value: author, inline: true },
        { name: "Rating", value: stars, inline: true }
      )
      .setFooter({ text: `Reviewed by ${interaction.user.username}` });

    if (review) {
      embed.setDescription(review);
    }

    await interaction.reply({ embeds: [embed] });

  } else if (interaction.customId === "review_recipe_modal") {
    const title = interaction.fields.getTextInputValue("recipe_title");
    const link = interaction.fields.getTextInputValue("recipe_link");
    const rating = parseInt(interaction.fields.getTextInputValue("recipe_rating"));
    const category = interaction.fields.getTextInputValue("recipe_category");
    const review = interaction.fields.getTextInputValue("recipe_review");

    if (rating < 1 || rating > 5) {
      await interaction.reply({
        content: "❌ Rating must be between 1 and 5 stars!",
        ephemeral: true
      });
      return;
    }

    const reviewData = {
      type: "recipe",
      title,
      link: link || null,
      rating,
      category,
      review: review || null,
      userId: interaction.user.id,
      username: interaction.user.username,
      timestamp: new Date()
    };

    const guildReviews = reviews.get(interaction.guild.id) || [];
    guildReviews.push(reviewData);
    reviews.set(interaction.guild.id, guildReviews);

    const stars = "⭐".repeat(rating);
    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("🍽️ Recipe Review Added!")
      .addFields(
        { name: "Title", value: title, inline: true },
        { name: "Rating", value: stars, inline: true },
        { name: "Category", value: category, inline: true }
      )
      .setFooter({ text: `Reviewed by ${interaction.user.username}` });

    if (link) embed.addFields({ name: "Link", value: `[View Recipe](${link})`, inline: false });
    if (review) embed.setDescription(review);

    await interaction.reply({ embeds: [embed] });

  } else if (interaction.customId === "review_drink_modal") {
    const title = interaction.fields.getTextInputValue("drink_title");
    const link = interaction.fields.getTextInputValue("drink_link");
    const rating = parseInt(interaction.fields.getTextInputValue("drink_rating"));
    const category = interaction.fields.getTextInputValue("drink_category");
    const review = interaction.fields.getTextInputValue("drink_review");

    if (rating < 1 || rating > 5) {
      await interaction.reply({
        content: "❌ Rating must be between 1 and 5 stars!",
        ephemeral: true
      });
      return;
    }

    const reviewData = {
      type: "drink",
      title,
      link: link || null,
      rating,
      category,
      review: review || null,
      userId: interaction.user.id,
      username: interaction.user.username,
      timestamp: new Date()
    };

    const guildReviews = reviews.get(interaction.guild.id) || [];
    guildReviews.push(reviewData);
    reviews.set(interaction.guild.id, guildReviews);

    const stars = "⭐".repeat(rating);
    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("☕ Drink Review Added!")
      .addFields(
        { name: "Title", value: title, inline: true },
        { name: "Rating", value: stars, inline: true },
        { name: "Category", value: category, inline: true }
      )
      .setFooter({ text: `Reviewed by ${interaction.user.username}` });

    if (link) embed.addFields({ name: "Link", value: `[View Recipe](${link})`, inline: false });
    if (review) embed.setDescription(review);

    await interaction.reply({ embeds: [embed] });
  }
}
