require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});
require("./register-aliases");

// Set production environment
process.env.NODE_ENV = "production";

// Validate Discord token
if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN");
  process.exit(1);
}

console.log(
  "Starting bot with token:",
  process.env.DISCORD_TOKEN.slice(0, 10) + "..."
);

// Initialize store and bot
const { userConfigStore } = require("./dist/storage/userConfig.js");
const { startBot } = require("./dist/bot/index.js");

// Start the bot
startBot().catch((error) => {
  console.error("Failed to start bot:", error);
  process.exit(1);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("Bot shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Bot shutting down...");
  process.exit(0);
});
