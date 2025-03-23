import { 
    Client, 
    ApplicationCommandType,
    Interaction,
    MessageApplicationCommandData,
    REST,
    Routes
} from 'discord.js';
import { createGitHubIssue } from './github';
import { userConfigStore } from '../storage/userConfig';

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
        console.log('Handling command for user:', userId);
        
        // Force reload configs before getting the latest
        userConfigStore.loadConfigs();
        const config = userConfigStore.getConfig(userId);
        
        console.log('Processing command with config:', {
            userId,
            hasConfig: !!config,
            repo: config?.githubRepo,
            availableConfigs: Object.keys(userConfigStore['configs'])
        });

        if (!config?.githubToken || !config?.githubRepo) {
            const settingsUrl = process.env.NODE_ENV === 'production' 
                ? `https://discordtriage.com/api/auth/github?state=${userId}`
                : `http://localhost:3000/api/auth/github?state=${userId}`;

            await interaction.reply({
                content: `Please authenticate with GitHub first: ${settingsUrl}`,
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        
        const message = interaction.targetMessage;
        const [owner, repo] = config.githubRepo.split('/');
        
        console.log('Creating issue in repository:', config.githubRepo);

        try {
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
            console.error('Failed to create issue:', error);
            await interaction.editReply({
                content: `❌ Failed to create issue in ${config.githubRepo}. Please check your repository settings and try again.`
            });
        }
    } catch (error) {
        console.error('Error handling command:', error);
        if (interaction.deferred) {
            await interaction.editReply({
                content: '❌ Failed to create GitHub issue. Please check your settings and try again.'
            });
        } else {
            await interaction.reply({
                content: '❌ Failed to create GitHub issue. Please check your settings and try again.',
                ephemeral: true
            });
        }
    }
}
