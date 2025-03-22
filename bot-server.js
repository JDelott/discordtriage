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

// Force reload configs on bot start and verify token
const { userConfigStore } = require("./dist/storage/userConfig.js");
userConfigStore.loadConfigs();

// Verify GitHub tokens are valid
const configs = userConfigStore["configs"];
Object.entries(configs).forEach(async ([userId, config]) => {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${config.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      console.log(`Invalid token found for user ${userId}, removing config`);
      delete configs[userId];
      userConfigStore.saveConfigs();
    }
  } catch (error) {
    console.error(`Error verifying token for user ${userId}:`, error);
  }
});

console.log(
  "Available configs after validation:",
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
