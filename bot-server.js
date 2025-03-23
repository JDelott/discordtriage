require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});

const { Client, GatewayIntentBits } = require("./node_modules/discord.js");

// Create a single client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Simple error handling
client.on("error", console.error);

// Simple ready handler
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Simple command handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;
  if (interaction.commandName !== "Create GitHub Issue") return;

  try {
    await interaction.reply({ content: "Creating issue...", ephemeral: true });

    // Get the message content
    const message = interaction.targetMessage;
    console.log("Message content:", message.content);

    await interaction.editReply({
      content: "Issue created! (test response)",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Command error:", error);
    await interaction.editReply({
      content: "Failed to create issue",
      ephemeral: true,
    });
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
