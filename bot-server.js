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

// Read config file directly to verify contents
const fs = require("fs");
const configPath = "/var/www/discordtriage/user-configs.json";

let initialConfigs = {};

try {
  const rawConfig = fs.readFileSync(configPath, "utf8");
  console.log("Raw config file contents:", rawConfig);

  // Parse and validate config
  initialConfigs = JSON.parse(rawConfig);
  console.log(
    "Available configs before bot start:",
    Object.keys(initialConfigs)
  );

  // Write back validated config with proper permissions
  fs.writeFileSync(configPath, JSON.stringify(initialConfigs, null, 2), {
    mode: 0o666, // Read/write for all users
  });

  // Important: Set file ownership to match web app
  require("child_process").execSync(`chown www-data:www-data ${configPath}`);
} catch (error) {
  console.error("Error with config file:", error);
  process.exit(1);
}

// Now initialize the store with initial configs
const { userConfigStore } = require("./dist/storage/userConfig.js");

// Force set the initial configs
userConfigStore["configs"] = initialConfigs;
console.log(
  "Manually set initial configs:",
  Object.keys(userConfigStore["configs"])
);

const { startBot } = require("./dist/bot/index.js");

// Verify configs are set
const loadedConfigs = Object.keys(userConfigStore["configs"]);
console.log("Available configs in bot:", loadedConfigs);

if (loadedConfigs.length === 0) {
  console.error("Failed to load configs - exiting bot");
  process.exit(1);
}

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
