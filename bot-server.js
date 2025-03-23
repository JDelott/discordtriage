require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});
require("./register-aliases");

// Set production environment
process.env.NODE_ENV = "production";

// Safely log environment status
console.log("Environment variables status:", {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN ? "present" : "missing",
  DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID
    ? "present"
    : "missing",
  DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY ? "present" : "missing",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "present" : "missing",
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
    ? "present"
    : "missing",
  NODE_ENV: process.env.NODE_ENV,
});

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
