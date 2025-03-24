require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});

const { Client, GatewayIntentBits } = require("discord.js");
const { Octokit } = require("@octokit/rest");
const { Anthropic } = require("@anthropic-ai/sdk");
const { userConfigStore } = require("./storage/userConfig");
const { processIssueContent } = require("./bot/utils/anthropicProcessor");
const { createGitHubIssue } = require("./bot/github");

// Create anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function processIssueContent(message) {
  const prompt = `
    You are a helpful assistant that converts Discord messages into well-formatted GitHub issues.
    Format the following Discord message into a clear GitHub issue with:
    - A concise title
    - A detailed description
    - Any code blocks properly formatted
    - Steps to reproduce if applicable
    - Expected vs actual behavior if it's a bug
    
    Discord message: ${message}
    
    Respond with only valid JSON in this format:
    {
        "title": "Brief issue title",
        "body": "Formatted issue description"
    }`;

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.content[0].text);
}

// Simple error handling
client.on("error", console.error);

// Simple ready handler
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Simple command handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;
  if (interaction.commandName !== "Create GitHub Issue") return;

  try {
    await interaction.reply({ content: "Creating issue...", ephemeral: true });

    // Get the message content and use the interaction user's ID
    const message = interaction.targetMessage;
    const userId = interaction.user.id; // Use the ID of the person who clicked the command

    console.log("Command triggered by user:", userId);
    console.log("Message content:", message.content);

    // Read config file directly
    const fs = require("fs");
    const configPath = "/var/www/discordtriage/user-configs.json";
    const configs = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const userConfig = configs[userId];

    if (!userConfig?.githubToken || !userConfig?.githubRepo) {
      await interaction.editReply({
        content:
          "Please authenticate with GitHub first: https://discordtriage.com/settings",
        ephemeral: true,
      });
      return;
    }

    // Process message with Anthropic
    console.log("Processing message with Anthropic...");
    const processedContent = await processIssueContent(message.content);

    // Create GitHub issue
    const [owner, repo] = userConfig.githubRepo.split("/");
    const octokit = new Octokit({ auth: userConfig.githubToken });

    const response = await octokit.issues.create({
      owner,
      repo,
      title: processedContent.title,
      body: `${processedContent.body}\n\n---\n## Original Discord Message\n\`\`\`\n${message.content}\n\`\`\`\n\n---\nCreated from Discord by ${interaction.user.tag}\nOriginal Message Link: ${message.url}`,
      labels: ["discord"],
    });

    await interaction.editReply({
      content: `✅ GitHub issue created! View it here: ${response.data.html_url}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Command error:", error);
    await interaction.editReply({
      content: "Failed to create issue. Please check your GitHub settings.",
      ephemeral: true,
    });
  }
});
