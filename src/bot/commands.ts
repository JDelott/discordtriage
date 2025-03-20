import { 
    Client, 
    ApplicationCommandType,
    Interaction,
    MessageApplicationCommandData
} from 'discord.js';
import { createGitHubIssue, getAuthUrl } from './github';
import { store } from './store';

const GITHUB_OWNER = 'JDelott';
const GITHUB_REPO = 'discordtriage';

export async function registerCommands(client: Client) {
    if (!client.application) return;

    try {
        console.log('Registering commands...');
        await client.application.commands.set([]);
        
        const command: MessageApplicationCommandData = {
            name: 'Create GitHub Issue',
            type: ApplicationCommandType.Message
        };

        const registeredCommand = await client.application.commands.create(command);
        console.log('Command registered successfully:', {
            id: registeredCommand.id,
            name: registeredCommand.name,
            type: registeredCommand.type
        });
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

export async function handleCommand(interaction: Interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;
    if (interaction.commandName !== 'Create GitHub Issue') return;

    try {
        const userId = interaction.user.id;
        const token = store.userTokens.get(userId);

        if (!token) {
            const authUrl = getAuthUrl(userId);
            await interaction.reply({
                content: `Please authenticate with GitHub first: ${authUrl}`,
                ephemeral: true
            });
            return;
        }

        // Defer the reply first
        await interaction.deferReply({ ephemeral: true });
        
        const message = interaction.targetMessage;
        const issueUrl = await createGitHubIssue(
            token,
            GITHUB_OWNER,
            GITHUB_REPO,
            `Discord Thread: ${message.thread?.name || 'Message'}`,
            `${message.content}\n\nCreated from Discord by ${interaction.user.tag}\nOriginal Message Link: ${message.url}`
        );

        await interaction.editReply({
            content: `✅ GitHub issue created successfully! View it here: ${issueUrl}`
        });
    } catch (error) {
        console.error('Error handling command:', error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Failed to create GitHub issue. Please try again.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'Failed to create GitHub issue. Please try again.'
                });
            }
        } catch (replyError) {
            console.error('Error sending error reply:', replyError);
        }
    }
}
