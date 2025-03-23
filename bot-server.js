require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});
require("./register-aliases");

// Set production environment
process.env.NODE_ENV = "production";

// Validate Discord token
if (!process.env.DISCORD_TOKEN) {
  console.error("CRITICAL ERROR: No Discord token found in environment");
  process.exit(1);
}

// Print the full token for verification (we'll remove this after debugging)
console.log("Full Discord Token:", process.env.DISCORD_TOKEN);

// Read the .env file directly to verify
const fs = require("fs");
const envFile = fs.readFileSync("/var/www/discordtriage/.env", "utf8");
console.log("Raw .env file contents:", envFile);

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
