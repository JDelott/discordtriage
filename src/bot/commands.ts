import { 
    Client, 
    ApplicationCommandType,
    Interaction,
    MessageApplicationCommandData
} from 'discord.js';
import { createGitHubIssue, getAuthUrl } from './github';
import { getConfig, UserConfig } from '../storage/userConfig';

export async function handleCommand(interaction: Interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;
    if (interaction.commandName !== 'Create GitHub Issue') return;

    try {
        const userId = interaction.user.id;
        const config = await getConfig(userId);
        
        console.log('Processing command with config:', {
            userId,
            config: config
        });

        if (!config?.githubToken || !config?.githubRepo) {
            await interaction.reply({
                content: 'Please set up your GitHub token and repository first at http://142.93.1.19/settings',
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        
        const message = interaction.targetMessage;
        
        // Log the repository being used
        console.log('Using repository:', config.githubRepo);
        
        const [owner, repo] = config.githubRepo.split('/');
        
        const issueUrl = await createGitHubIssue(
            config.githubToken,
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
