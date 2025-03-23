require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});

const { Client, GatewayIntentBits } = require("discord.js");

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

  await interaction.reply({ content: "Creating issue...", ephemeral: true });
  // ... rest of your command logic
});

// Login
client.login(process.env.DISCORD_TOKEN);
