import { 
    Client, 
    ApplicationCommandType,
    ApplicationCommandData,
    Interaction,
    MessageContextMenuCommandInteraction,
    InteractionReplyOptions,
    MessagePayload,
    CommandInteraction,
    MessageFlags,
    BaseMessageOptions
} from 'discord.js';
import { userTokens, createGitHubIssue, getAuthUrl } from './github';

const GITHUB_OWNER = 'jacobdelott'; // Your GitHub username
const GITHUB_REPO = 'discordtriage'; // Your repository name

export async function registerCommands(client: Client) {
    if (!client.application) return;

    try {
        // First, remove all existing commands
        await client.application.commands.set([]);

        // Create the context menu command
        const command: ApplicationCommandData = {
            name: 'Create GitHub Issue',
            type: ApplicationCommandType.Message,
            defaultMemberPermissions: null
        };

        // Register the command globally
        const registeredCommand = await client.application.commands.create(command);
        console.log('Command registered with ID:', registeredCommand.id);
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

export async function handleCommand(interaction: Interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;
    if (interaction.commandName !== 'Create GitHub Issue') return;

    const userId = interaction.user.id;
    const token = userTokens.get(userId);

    if (!token) {
        const authUrl = getAuthUrl(userId);
        await interaction.reply({
            content: `Please authenticate with GitHub first: ${authUrl}`,
            flags: MessageFlags.Ephemeral
        } as BaseMessageOptions);
        return;
    }

    try {
        const message = interaction.targetMessage;
        await interaction.reply({
            content: 'Creating GitHub issue...',
            flags: MessageFlags.Ephemeral
        } as BaseMessageOptions);
        
        const issueUrl = await createGitHubIssue(
            token,
            GITHUB_OWNER,  // Using the constant
            GITHUB_REPO,   // Using the constant
            `Discord Thread: ${message.thread?.name || 'Message'}`,
            `${message.content}\n\nCreated from Discord by ${interaction.user.tag}\nOriginal Message Link: ${message.url}`
        );

        await interaction.editReply({
            content: `✅ GitHub issue created successfully! View it here: ${issueUrl}`,
            flags: MessageFlags.Ephemeral
        } as BaseMessageOptions);
    } catch (error) {
        console.error('Error creating issue:', error);
        await interaction.editReply({
            content: 'Failed to create GitHub issue. Please try again.',
            flags: MessageFlags.Ephemeral
        } as BaseMessageOptions);
    }
}
