require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});
require("./register-aliases");

// Set production environment
process.env.NODE_ENV = "production";

// Validate Discord tokens
const requiredEnvVars = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
  DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("Missing required environment variables:", missingVars);
  process.exit(1);
}

// Debug: Print environment variables (safely)
console.log("Environment variables:", {
  token: process.env.DISCORD_TOKEN
    ? `${process.env.DISCORD_TOKEN.slice(0, 8)}...`
    : "missing",
  appId: process.env.DISCORD_APPLICATION_ID,
  publicKey: process.env.DISCORD_PUBLIC_KEY
    ? `${process.env.DISCORD_PUBLIC_KEY.slice(0, 8)}...`
    : "missing",
  env: process.env.NODE_ENV,
  path: "/var/www/discordtriage/.env",
});

// Set working directory
process.chdir("/var/www/discordtriage");

const fs = require("fs");
const path = require("path");
const configPath = "/var/www/discordtriage/user-configs.json";

// Read and validate config file
try {
  // Check file exists
  if (!fs.existsSync(configPath)) {
    console.error(`Config file does not exist at ${configPath}`);
    process.exit(1);
  }

  // Check file permissions
  const stats = fs.statSync(configPath);
  console.log("Config file permissions:", {
    mode: stats.mode.toString(8),
    uid: stats.uid,
    gid: stats.gid,
  });

  // Read file contents
  const rawConfig = fs.readFileSync(configPath, "utf8");
  console.log("Raw config file contents:", rawConfig);

  // Parse config
  const parsedConfig = JSON.parse(rawConfig);
  console.log("Parsed config keys:", Object.keys(parsedConfig));

  // Initialize store and bot
  const { userConfigStore } = require("./dist/storage/userConfig.js");

  // Force set the configs
  userConfigStore["configs"] = parsedConfig;
  console.log(
    "UserConfigStore configs after direct set:",
    Object.keys(userConfigStore["configs"])
  );

  const { startBot } = require("./dist/bot/index.js");

  // Start the bot
  startBot().catch((error) => {
    console.error("Failed to start bot:", error);
    process.exit(1);
  });
} catch (error) {
  console.error("Error during bot initialization:", error);
  process.exit(1);
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("Bot shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Bot shutting down...");
  process.exit(0);
});
