require("dotenv").config({
  path: "/var/www/discordtriage/.env",
});

const { Client, GatewayIntentBits } = require("./node_modules/discord.js");
const { Octokit } = require("@octokit/rest");

// Create a single client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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

    // Get the message content
    const message = interaction.targetMessage;
    console.log("Message content:", message.content);

    // Read config file directly
    const fs = require("fs");
    const configPath = "/var/www/discordtriage/user-configs.json";
    const configs = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const userConfig = configs[interaction.user.id];

    if (!userConfig?.githubToken || !userConfig?.githubRepo) {
      await interaction.editReply({
        content:
          "Please authenticate with GitHub first: https://discordtriage.com/settings",
        ephemeral: true,
      });
      return;
    }

    // Create GitHub issue
    const [owner, repo] = userConfig.githubRepo.split("/");
    const octokit = new Octokit({ auth: userConfig.githubToken });

    const response = await octokit.issues.create({
      owner,
      repo,
      title: `Discord Thread: ${message.thread?.name || "Message"}`,
      body: `${message.content}\n\nCreated from Discord by ${interaction.user.tag}\nOriginal Message Link: ${message.url}`,
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

// Login
client.login(process.env.DISCORD_TOKEN);
