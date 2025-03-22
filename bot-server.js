require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});
require("./register-aliases");

// Set production environment
process.env.NODE_ENV = "production";

// Debug: Print environment variables (safely)
console.log("Environment variables:", {
  token: process.env.DISCORD_TOKEN ? "exists" : "missing",
  appId: process.env.DISCORD_APPLICATION_ID ? "exists" : "missing",
  env: process.env.NODE_ENV,
  path: "/var/www/discordtriage/.env",
});

// Set working directory explicitly
process.chdir("/var/www/discordtriage");

// Read and validate config file
const fs = require("fs");
const configPath = "/var/www/discordtriage/user-configs.json";

// Create config file if it doesn't exist
if (!fs.existsSync(configPath)) {
  console.log("Creating new config file at:", configPath);
  fs.writeFileSync(configPath, "{}", "utf8");
}

// Ensure file permissions are correct
fs.chmodSync(configPath, 0o666);

try {
  const rawConfig = fs.readFileSync(configPath, "utf8");
  console.log("Raw config file contents:", rawConfig);

  // Parse and validate config
  const configs = JSON.parse(rawConfig);
  console.log("Available configs before bot start:", Object.keys(configs));

  // Write back validated config with proper permissions
  fs.writeFileSync(configPath, JSON.stringify(configs, null, 2), {
    mode: 0o666, // Read/write for all users
  });
} catch (error) {
  console.error("Error with config file:", error);
  process.exit(1);
}

// Now initialize the store and bot
const { userConfigStore } = require("./dist/storage/userConfig.js");
const { startBot } = require("./dist/bot/index.js");

// Force reload configs
userConfigStore.loadConfigs();
console.log(
  "Available configs in bot after load:",
  Object.keys(userConfigStore["configs"])
);

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
