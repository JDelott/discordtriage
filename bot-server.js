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

// Initialize store and bot
const { userConfigStore } = require("./dist/storage/userConfig.js");
const { startBot } = require("./dist/bot/index.js");

// Function to load configs with retry
async function loadConfigsWithRetry(maxRetries = 5, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`Attempt ${i + 1} to load configs...`);

    userConfigStore.loadConfigs();
    const loadedConfigs = Object.keys(userConfigStore["configs"]);
    console.log("Available configs in bot:", loadedConfigs);

    if (loadedConfigs.length > 0) {
      console.log("Successfully loaded configs!");
      return true;
    }

    console.log(`No configs loaded, retrying in ${delayMs}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.error("Failed to load configs after retries");
  return false;
}

// Start the bot with retries
async function startBotWithRetry() {
  try {
    const configsLoaded = await loadConfigsWithRetry();
    if (!configsLoaded) {
      console.error("Could not load configs, but starting bot anyway");
    }

    await startBot();
    console.log("Bot started successfully");
  } catch (error) {
    console.error("Error starting bot:", error);
    process.exit(1);
  }
}

// Start the bot
startBotWithRetry();

// Handle process termination
process.on("SIGINT", () => {
  console.log("Bot shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Bot shutting down...");
  process.exit(0);
});
