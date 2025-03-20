import { 
    Client, 
    ApplicationCommandType,
    Interaction,
    MessageApplicationCommandData
} from 'discord.js';
import { createGitHubIssue, getAuthUrl } from './github';
import { userConfigStore } from '@/storage/userConfig';

export async function handleCommand(interaction: Interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;
    if (interaction.commandName !== 'Create GitHub Issue') return;

    try {
        const userId = interaction.user.id;
        // Force reload config each time
        const userConfig = userConfigStore.getConfig(userId);
        
        console.log('Processing command with config:', {
            userId,
            config: userConfig
        });

        if (!userConfig?.githubToken) {
            const authUrl = getAuthUrl(userId);
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
        
        const issueUrl = await createGitHubIssue(
            userConfig.githubToken,
            owner,
            repo,
            `Discord Thread: ${message.thread?.name || 'Message'}`,
            `${message.content}\n\nCreated from Discord by ${interaction.user.tag}\nOriginal Message Link: ${message.url}`
        );

        await interaction.editReply({
            content: `✅ GitHub issue created successfully! View it here: ${issueUrl}`
        });
    } catch (error) {
        console.error('Error handling command:', error);
        try {
            const errorMessage = 'Failed to create GitHub issue. Please try again.';
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.editReply({ content: errorMessage });
            }
        } catch (replyError) {
            console.error('Error sending error reply:', replyError);
        }
    }
}

export async function registerCommands(client: Client) {
    if (!client.application) return;

    try {
        const command: MessageApplicationCommandData = {
            name: 'Create GitHub Issue',
            type: ApplicationCommandType.Message
        };

        await client.application.commands.create(command);
        console.log('Command registered successfully');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}
