import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import path from 'path';
import { handleCommand, registerCommands } from './commands';
import { userConfigStore } from '../storage/userConfig';

// Load environment variables from the correct path
const envPath = path.resolve(process.cwd(), '.env');
config({ path: envPath });

// Verify environment variables are loaded
const requiredEnvVars = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID
};

// Check for missing variables
const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

// Export the client so it can be used in other files
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Export the startBot function for the API route
export async function startBot(): Promise<boolean> {
    // Force load configs before starting bot
    userConfigStore.loadConfigs();
    console.log('Bot starting with configs:', Object.keys(userConfigStore['configs']));

    try {
        client.on('ready', async () => {
            console.log(`Bot is ready as ${client.user?.tag}!`);
            await registerCommands();
        });

        client.on('interactionCreate', async (interaction) => {
            // Force reload configs before each interaction
            userConfigStore.loadConfigs();
            await handleCommand(interaction);
        });

        client.on('error', (error) => {
            console.error('Discord client error:', error);
        });

        client.on('disconnect', () => {
            console.log('Bot disconnected, attempting to reconnect...');
            reconnect();
        });

        await client.login(process.env.DISCORD_TOKEN);
        console.log('Bot logged in successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize bot:', error);
        return false;
    }
}

// Reconnection logic
const reconnect = () => {
    setTimeout(async () => {
        try {
            await client.login(process.env.DISCORD_TOKEN);
            console.log('Bot reconnected successfully');
        } catch (error) {
            console.error('Reconnection failed:', error);
            reconnect(); // Try again
        }
    }, 5000);
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('Received SIGINT. Cleaning up...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Cleaning up...');
    client.destroy();
    process.exit(0);
});

// Start the bot if this file is run directly
if (require.main === module) {
    startBot().catch(console.error);
}
