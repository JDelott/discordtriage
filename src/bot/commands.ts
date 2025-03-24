import { 
    Client, 
    ApplicationCommandType,
    Interaction,
    MessageApplicationCommandData,
    REST,
    Routes,
    InteractionReplyOptions
} from 'discord.js';
import { createGitHubIssue } from './github';
import { userConfigStore } from '../storage/userConfig';
import { processIssueContent } from './utils/anthropicProcessor';

// Define commands
const commands = [
    {
        name: 'Create GitHub Issue',
        type: ApplicationCommandType.Message,
    }
];

export async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID!),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

export async function handleCommand(interaction: Interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;
    if (interaction.commandName !== 'Create GitHub Issue') return;
    
    try {
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        console.log('Processing command for:', { userId, guildId });

        if (!guildId) {
            await interaction.reply({
                content: 'This command can only be used in a server',
                ephemeral: true
            } as InteractionReplyOptions);
            return;
        }

        await interaction.deferReply({ ephemeral: true } as InteractionReplyOptions);

        // Get installation config for this specific guild
        const installation = userConfigStore.getInstallation(userId, guildId);
        console.log('Installation config:', installation);

        if (!installation?.githubToken || !installation?.githubRepo) {
            const settingsUrl = process.env.NODE_ENV === 'production'
                ? `https://discordtriage.com/settings?guild=${guildId}`
                : `http://localhost:3000/settings?guild=${guildId}`;

            await interaction.editReply({
                content: `Please configure GitHub for this server: ${settingsUrl}`,
                ephemeral: true
            } as InteractionReplyOptions);
            return;
        }

        const message = interaction.targetMessage;
        if (!message?.content) {
            await interaction.editReply({
                content: 'No message content found',
                ephemeral: true
            } as InteractionReplyOptions);
            return;
        }

        const processedContent = await processIssueContent(message.content);
        console.log('Processed content:', processedContent);

        const [owner, repo] = installation.githubRepo.split('/');
        const issueUrl = await createGitHubIssue(
            installation.githubToken,
            owner,
            repo,
            processedContent.title,
            `${processedContent.body}\n\n---\nCreated from Discord by ${interaction.user.tag}\nOriginal Message: ${message.url}`
        );

        await interaction.editReply({
            content: `✅ Issue created! View it here: ${issueUrl}`,
            ephemeral: true
        } as InteractionReplyOptions);

    } catch (error) {
        console.error('Command error:', error);
        await interaction.editReply({
            content: 'Failed to create issue. Please check your GitHub settings.',
            ephemeral: true
        } as InteractionReplyOptions);
    }
}
