import { 
    Client, 
    ApplicationCommandType,
    Interaction,
    MessageApplicationCommandData,
    REST,
    Routes,
    InteractionReplyOptions,
    MessagePayload,
    InteractionEditReplyOptions
} from 'discord.js';
import { createGitHubIssue } from './github';
import { userConfigStore } from '../storage/userConfig';
import { processIssueContent } from './utils/anthropicProcessor';
import { BOT_CONFIG } from './config';

// Define commands
const commands = [
    {
        name: 'Create GitHub Issue',
        type: ApplicationCommandType.Message,
        defaultPermission: true
    }
];

export async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        
        console.log('Registering commands for app:', process.env.DISCORD_APPLICATION_ID);
        
        const response = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID!),
            { body: commands }
        );
        
        console.log('Successfully registered commands:', response);
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
            });
            return;
        }

        // Get installation config for this specific guild
        const installation = userConfigStore.getInstallation(userId, guildId);
        console.log('Installation config:', installation);

        if (!installation?.githubToken || !installation?.githubRepo) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://discordtriage.com';
            const authUrl = `${baseUrl}/api/auth/discord?guild=${guildId}`;
            
            await interaction.reply({
                content: `Please authenticate and configure GitHub for this server: ${authUrl}`,
                ephemeral: true
            });
            return;
        }

        // Defer the reply BEFORE creating the issue
        await interaction.deferReply({ ephemeral: true });

        const message = interaction.targetMessage;
        if (!message?.content) {
            await interaction.editReply({
                content: 'No message content found'
            });
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
            processedContent.body
        );

        await interaction.editReply({
            content: `✅ GitHub issue created successfully! View it here: ${issueUrl}\n\nTo change repository settings, visit: https://discordtriage.com/settings?guild=${guildId}`
        });

    } catch (error) {
        console.error('Command error:', error);
        // Try to send an error message if we haven't replied yet
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while processing your command',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'An error occurred while processing your command'
                });
            }
        } catch (e) {
            console.error('Error sending error message:', e);
        }
    }
}
