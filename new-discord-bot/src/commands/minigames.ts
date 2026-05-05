import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

// Word lists for games
const WORDLE_WORDS = ["REACT", "CODES", "GAMES", "WORDS", "HOUSE", "PLANT", "OCEAN", "MUSIC", "PIZZA", "DANCE", "BEACH", "CLOUD", "DREAM", "FLAME", "GHOST", "HEART", "NIGHT", "PEACE", "QUIET", "SMILE"];
const HANGMAN_WORDS = ["discord", "javascript", "programming", "developer", "software", "database", "network", "security", "algorithm", "function", "variable", "constant", "parameter", "library", "framework"];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

// Game sessions storage
const gamesSessions = new Map<string, any>();

export const data = new SlashCommandBuilder()
  .setName("minigames")
  .setDescription("Play fun minigames")
  .addSubcommand((sub) =>
    sub
      .setName("wordle")
      .setDescription("Play Wordle - Guess the 5-letter word in 6 tries")
  )
  .addSubcommand((sub) =>
    sub
      .setName("minesweeper")
      .setDescription("Play Minesweeper - Clear the board without hitting mines")
  )
  .addSubcommand((sub) =>
    sub
      .setName("hangman")
      .setDescription("Play Hangman - Guess the word letter by letter")
  );

export async function execute(interaction: any) {
  const subcommand = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  if (subcommand === "wordle") {
    startWordle(interaction, userId);
  } else if (subcommand === "minesweeper") {
    startMinesweeper(interaction, userId);
  } else if (subcommand === "hangman") {
    startHangman(interaction, userId);
  }
}

// ============= WORDLE GAME =============
async function startWordle(interaction: any, userId: string) {
  const word = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
  const sessionId = `wordle-${userId}-${Date.now()}`;

  const session = {
    type: "wordle",
    word: word,
    attempts: 0,
    maxAttempts: 6,
    guesses: [],
    userId: userId,
    createdAt: Date.now()
  };

  gamesSessions.set(sessionId, session);

  const embed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle("🎮 Wordle Game Started!")
    .setDescription("Guess the 5-letter word in 6 tries!\n\nType `/wordle-guess` with your guess.")
    .addFields(
      { name: "Attempts left", value: `${session.maxAttempts}`, inline: true },
      { name: "Guesses", value: "None yet", inline: true }
    )
    .setFooter({ text: `Session ID: ${sessionId}` });

  await interaction.reply({ embeds: [embed] });
}

// ============= MINESWEEPER GAME =============
async function startMinesweeper(interaction: any, userId: string) {
  const sessionId = `minesweeper-${userId}-${Date.now()}`;
  const gridSize = 5;
  const mineCount = 5;

  // Create grid
  const grid: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
  
  // Place mines randomly
  let placed = 0;
  while (placed < mineCount) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    if (!grid[y][x]) {
      grid[y][x] = true;
      placed++;
    }
  }

  const session = {
    type: "minesweeper",
    grid: grid,
    revealed: Array(gridSize).fill(null).map(() => Array(gridSize).fill(false)),
    gameOver: false,
    won: false,
    userId: userId,
    createdAt: Date.now()
  };

  gamesSessions.set(sessionId, session);

  const embed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle("💣 Minesweeper Game Started!")
    .setDescription("Clear all safe squares without hitting any mines!\n\nClick buttons to reveal squares. 💣 = Mine, 🚩 = Flagged")
    .addFields(
      { name: "Grid Size", value: `${gridSize}x${gridSize}`, inline: true },
      { name: "Mines", value: `${mineCount}`, inline: true }
    );

  // Create game board buttons
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let y = 0; y < gridSize; y++) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let x = 0; x < gridSize; x++) {
      const button = new ButtonBuilder()
        .setCustomId(`minesweeper_${sessionId}_${x}_${y}`)
        .setLabel("❓")
        .setStyle(ButtonStyle.Secondary);
      row.addComponents(button);
    }
    rows.push(row);
  }

  await interaction.reply({ embeds: [embed], components: rows });
}

// ============= HANGMAN GAME =============
async function startHangman(interaction: any, userId: string) {
  const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)].toUpperCase();
  const sessionId = `hangman-${userId}-${Date.now()}`;

  const session = {
    type: "hangman",
    word: word,
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: 6,
    userId: userId,
    createdAt: Date.now()
  };

  gamesSessions.set(sessionId, session);

  const display = word.split("").map(char => session.guessedLetters.includes(char) ? char : "_").join(" ");
  const hangmanStages = [
    "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
  ];

  const embed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle("🎮 Hangman Game Started!")
    .setDescription(`Guess the word letter by letter!\n\n${display}\n\n${hangmanStages[session.wrongGuesses]}`)
    .addFields(
      { name: "Wrong guesses", value: `${session.wrongGuesses}/${session.maxWrongGuesses}`, inline: true },
      { name: "Guessed letters", value: session.guessedLetters.length > 0 ? session.guessedLetters.join(", ") : "None", inline: true }
    )
    .setFooter({ text: `Session ID: ${sessionId}` });

  await interaction.reply({ embeds: [embed] });
}

// Handle modal submissions (for Wordle guesses)
export async function handleWordleGuess(interaction: any, word: string, sessionId: string) {
  const session = gamesSessions.get(sessionId);
  
  if (!session || session.type !== "wordle") {
    await interaction.reply({ content: "Invalid session!", ephemeral: true });
    return;
  }

  if (session.userId !== interaction.user.id) {
    await interaction.reply({ content: "This is not your game!", ephemeral: true });
    return;
  }

  word = word.toUpperCase();

  if (word.length !== 5) {
    await interaction.reply({ content: "Word must be exactly 5 letters!", ephemeral: true });
    return;
  }

  session.attempts++;
  session.guesses.push(word);

  // Check each letter
  let result = "";
  let correct = true;

  for (let i = 0; i < 5; i++) {
    if (word[i] === session.word[i]) {
      result += `🟩 ${word[i]}`;
    } else if (session.word.includes(word[i])) {
      result += `🟨 ${word[i]}`;
    } else {
      result += `⬜ ${word[i]}`;
      correct = false;
    }
  }

  if (word === session.word) {
    const embed = new EmbedBuilder()
      .setColor("#51cf66")
      .setTitle("🎉 Wordle - YOU WIN!")
      .setDescription(`You guessed the word in ${session.attempts} attempts!\n\n${result}`)
      .addFields(
        { name: "Word", value: session.word, inline: true },
        { name: "Attempts", value: `${session.attempts}/${session.maxAttempts}`, inline: true }
      );

    gamesSessions.delete(sessionId);
    await interaction.reply({ embeds: [embed] });
  } else if (session.attempts >= session.maxAttempts) {
    const embed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("😞 Wordle - Game Over")
      .setDescription(`The word was: **${session.word}**\n\nYour last guess:\n${result}`)
      .addFields(
        { name: "Attempts used", value: `${session.maxAttempts}/${session.maxAttempts}` }
      );

    gamesSessions.delete(sessionId);
    await interaction.reply({ embeds: [embed] });
  } else {
    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("Wordle - Keep Going!")
      .setDescription(`Your guess:\n${result}`)
      .addFields(
        { name: "Attempts left", value: `${session.maxAttempts - session.attempts}` },
        { name: "Guesses", value: session.guesses.join(", ") }
      )
      .setFooter({ text: `Session ID: ${sessionId}` });

    await interaction.reply({ embeds: [embed] });
  }
}

// Handle Hangman letter guesses
export async function handleHangmanGuess(interaction: any, letter: string, sessionId: string) {
  const session = gamesSessions.get(sessionId);

  if (!session || session.type !== "hangman") {
    await interaction.reply({ content: "Invalid session!", ephemeral: true });
    return;
  }

  if (session.userId !== interaction.user.id) {
    await interaction.reply({ content: "This is not your game!", ephemeral: true });
    return;
  }

  letter = letter.toUpperCase();

  if (letter.length !== 1 || !ALPHABET.includes(letter.toLowerCase())) {
    await interaction.reply({ content: "Please guess a single letter!", ephemeral: true });
    return;
  }

  if (session.guessedLetters.includes(letter)) {
    await interaction.reply({ content: "You already guessed that letter!", ephemeral: true });
    return;
  }

  session.guessedLetters.push(letter);

  if (!session.word.includes(letter)) {
    session.wrongGuesses++;
  }

  const display = session.word.split("").map((char: string) => session.guessedLetters.includes(char) ? char : "_").join(" ");
  const hangmanStages = [
    "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
    "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
  ];

  if (session.word === display.replaceAll(" ", "")) {
    const embed = new EmbedBuilder()
      .setColor("#51cf66")
      .setTitle("🎉 Hangman - YOU WIN!")
      .setDescription(`You guessed the word!\n\n${display}\n\n${hangmanStages[session.wrongGuesses]}`)
      .addFields(
        { name: "Word", value: session.word },
        { name: "Wrong guesses", value: `${session.wrongGuesses}/${session.maxWrongGuesses}` }
      );

    gamesSessions.delete(sessionId);
    await interaction.reply({ embeds: [embed] });
  } else if (session.wrongGuesses >= session.maxWrongGuesses) {
    const embed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("😞 Hangman - Game Over")
      .setDescription(`The word was: **${session.word}**\n\n${hangmanStages[session.wrongGuesses]}`)
      .addFields(
        { name: "Wrong guesses", value: `${session.maxWrongGuesses}/${session.maxWrongGuesses}` }
      );

    gamesSessions.delete(sessionId);
    await interaction.reply({ embeds: [embed] });
  } else {
    const embed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle("Hangman - Keep Going!")
      .setDescription(`${display}\n\n${hangmanStages[session.wrongGuesses]}`)
      .addFields(
        { name: "Wrong guesses", value: `${session.wrongGuesses}/${session.maxWrongGuesses}`, inline: true },
        { name: "Guessed letters", value: session.guessedLetters.join(", "), inline: true }
      )
      .setFooter({ text: `Session ID: ${sessionId}` });

    await interaction.reply({ embeds: [embed] });
  }
}

// Handle Minesweeper button clicks
export async function handleMinesweeperClick(interaction: any, x: number, y: number, sessionId: string) {
  const session = gamesSessions.get(sessionId);

  if (!session || session.type !== "minesweeper") {
    await interaction.reply({ content: "Game session expired!", ephemeral: true });
    return;
  }

  if (session.userId !== interaction.user.id) {
    await interaction.reply({ content: "This is not your game!", ephemeral: true });
    return;
  }

  if (session.revealed[y][x]) {
    await interaction.reply({ content: "Already revealed!", ephemeral: true });
    return;
  }

  session.revealed[y][x] = true;

  if (session.grid[y][x]) {
    // Hit a mine - game over
    session.gameOver = true;
    const embed = new EmbedBuilder()
      .setColor("#ff6b6b")
      .setTitle("💣 Minesweeper - Game Over")
      .setDescription("You hit a mine! Game over.");

    gamesSessions.delete(sessionId);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    // Check if won
    let allSafeRevealed = true;
    for (let i = 0; i < session.grid.length; i++) {
      for (let j = 0; j < session.grid[i].length; j++) {
        if (!session.grid[i][j] && !session.revealed[i][j]) {
          allSafeRevealed = false;
        }
      }
    }

    if (allSafeRevealed) {
      session.won = true;
      const embed = new EmbedBuilder()
        .setColor("#51cf66")
        .setTitle("🎉 Minesweeper - YOU WIN!")
        .setDescription("All safe squares revealed!");

      gamesSessions.delete(sessionId);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setColor("#51cf66")
        .setDescription("✅ Safe!");

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  // Update board display
  const gridSize = session.grid.length;
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < gridSize; i++) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let j = 0; j < gridSize; j++) {
      const revealed = session.revealed[i][j];
      const isMine = session.grid[i][j];
      
      let label = "❓";
      let style = ButtonStyle.Secondary;

      if (revealed) {
        if (isMine) {
          label = "💣";
          style = ButtonStyle.Danger;
        } else {
          label = "✅";
          style = ButtonStyle.Success;
        }
      }

      const button = new ButtonBuilder()
        .setCustomId(`minesweeper_${sessionId}_${j}_${i}`)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(revealed || session.gameOver || session.won);

      row.addComponents(button);
    }
    rows.push(row);
  }

  await interaction.message.edit({ components: rows });
}