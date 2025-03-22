require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});
require("./register-aliases");

// Debug: Print environment variables (safely)
console.log("Environment variables:", {
  token: process.env.DISCORD_TOKEN ? "exists" : "missing",
  appId: process.env.DISCORD_APPLICATION_ID ? "exists" : "missing",
  env: process.env.NODE_ENV,
  path: "/var/www/discordtriage/.env",
});

// Set production environment
process.env.NODE_ENV = "production";

// Force reload configs on bot start
const { userConfigStore } = require("./dist/storage/userConfig.js");

// Verify configs are loaded
console.log("Bot server loading configs...");
userConfigStore.loadConfigs();
console.log(
  "Available configs in bot:",
  Object.keys(userConfigStore["configs"])
);

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
