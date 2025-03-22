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

// Force reload configs on bot start with absolute paths
const path = require("path");
const { userConfigStore } = require("./dist/storage/userConfig.js");

// Set absolute path for config file
const configPath = path.join("/var/www/discordtriage", "user-configs.json");
console.log("Loading configs from:", configPath);

// Read config file directly to verify contents
const fs = require("fs");
try {
  const rawConfig = fs.readFileSync(configPath, "utf8");
  console.log("Raw config file contents:", rawConfig);
} catch (error) {
  console.error("Error reading config file:", error);
}

userConfigStore.loadConfigs();

console.log(
  "Available configs after load:",
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
