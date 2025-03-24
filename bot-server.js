require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});

const { Client, GatewayIntentBits } = require("discord.js");
const { handleCommand, registerCommands } = require("./src/bot/commands");
const { userConfigStore } = require("./src/storage/userConfig");
const { processIssueContent } = require("./src/bot/utils/anthropicProcessor");

// Create Discord client
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
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerCommands();
});

// Use the command handler from commands.ts
client.on("interactionCreate", handleCommand);

client.login(process.env.DISCORD_TOKEN);
