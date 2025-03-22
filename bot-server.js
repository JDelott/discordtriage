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

// Force reload configs on bot start with correct path
const { userConfigStore } = require("./dist/storage/userConfig.js");

// Set the correct working directory for config file
process.chdir("/var/www/discordtriage");
userConfigStore.loadConfigs();

console.log(
  "Available configs on bot start:",
  Object.keys(userConfigStore["configs"]),
  "from path:",
  process.cwd()
);

// Don't validate tokens here - let the command handler handle auth state
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
