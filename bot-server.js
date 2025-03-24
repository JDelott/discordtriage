require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});

const { Client, GatewayIntentBits } = require("discord.js");
const { handleCommand, registerCommands } = require("./dist/bot/commands");
const { Anthropic } = require("@anthropic-ai/sdk");

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

// Use the command handler from src/bot/commands.ts
client.on("interactionCreate", handleCommand);

client.login(process.env.DISCORD_TOKEN);
