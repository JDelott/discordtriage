"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommand = handleCommand;
exports.registerCommands = registerCommands;
const discord_js_1 = require("discord.js");
const github_1 = require("./github");
const userConfig_1 = require("@/storage/userConfig");
async function handleCommand(interaction) {
    var _a;
    if (!interaction.isMessageContextMenuCommand())
        return;
    if (interaction.commandName !== 'Create GitHub Issue')
        return;
    try {
        const userId = interaction.user.id;
        // Force reload config each time
        const userConfig = userConfig_1.userConfigStore.getConfig(userId);
        console.log('Processing command with config:', {
            userId,
            config: userConfig
        });
        if (!(userConfig === null || userConfig === void 0 ? void 0 : userConfig.githubToken)) {
            const authUrl = (0, github_1.getAuthUrl)(userId);
            await interaction.reply({
                content: `Please authenticate with GitHub first: ${authUrl}`,
                ephemeral: true
            });
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        const message = interaction.targetMessage;
        // Log the repository being used
        console.log('Using repository:', userConfig.githubRepo);
        const [owner, repo] = userConfig.githubRepo.split('/');
        const issueUrl = await (0, github_1.createGitHubIssue)(userConfig.githubToken, owner, repo, `Discord Thread: ${((_a = message.thread) === null || _a === void 0 ? void 0 : _a.name) || 'Message'}`, `${message.content}\n\nCreated from Discord by ${interaction.user.tag}\nOriginal Message Link: ${message.url}`);
        await interaction.editReply({
            content: `✅ GitHub issue created successfully! View it here: ${issueUrl}`
        });
    }
    catch (error) {
        console.error('Error handling command:', error);
        try {
            const errorMessage = 'Failed to create GitHub issue. Please try again.';
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
            else {
                await interaction.editReply({ content: errorMessage });
            }
        }
        catch (replyError) {
            console.error('Error sending error reply:', replyError);
        }
    }
}
async function registerCommands(client) {
    if (!client.application)
        return;
    try {
        const command = {
            name: 'Create GitHub Issue',
            type: discord_js_1.ApplicationCommandType.Message
        };
        await client.application.commands.create(command);
        console.log('Command registered successfully');
    }
    catch (error) {
        console.error('Error registering commands:', error);
    }
}
