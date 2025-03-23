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
    // Add detailed logging
    console.log('Received interaction:', {
        type: interaction.type,
        commandName: interaction.isCommand() ? interaction.commandName : 'not a command',
        userId: interaction.user?.id,
        guildId: interaction.guildId
    });

    if (!interaction.isMessageContextMenuCommand()) {
        console.log('Interaction is not a message context menu command');
        return;
    }

    if (interaction.commandName !== 'Create GitHub Issue') {
        console.log('Command name does not match:', interaction.commandName);
        return;
    }

    try {
        const userId = interaction.user.id;
        console.log('Processing command for user:', userId);
        
        // Check if commands are registered
        const commands = await interaction.client.application?.commands.fetch();
        console.log('Available commands:', commands?.map(c => c.name));
        
        // Load and verify config
        userConfigStore.loadConfigs();
        const config = userConfigStore.getConfig(userId);
        
        console.log('User config status:', {
            userId,
            hasConfig: !!config,
            hasToken: !!config?.githubToken,
            hasRepo: !!config?.githubRepo,
            repo: config?.githubRepo
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
        console.error('Detailed command error:', error);
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
