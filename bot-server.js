require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});
require("./register-aliases");

// Set production environment BEFORE requiring any modules
process.env.NODE_ENV = "production";

// Debug: Print environment variables (safely)
console.log("Environment variables:", {
  token: process.env.DISCORD_TOKEN ? "exists" : "missing",
  appId: process.env.DISCORD_APPLICATION_ID ? "exists" : "missing",
  env: process.env.NODE_ENV,
  path: "/var/www/discordtriage/.env",
});

// Read config file directly first to verify it exists and has content
const fs = require("fs");
const configPath = "/var/www/discordtriage/user-configs.json";

try {
  const rawConfig = fs.readFileSync(configPath, "utf8");
  console.log("Raw config file contents:", rawConfig);
} catch (error) {
  console.error("Error reading config file:", error);
}

// Now initialize the store
const { userConfigStore } = require("./dist/storage/userConfig.js");

// Force reload configs
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
