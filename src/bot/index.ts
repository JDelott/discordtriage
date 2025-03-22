import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import path from 'path';
import { handleCommand, registerCommands } from './commands';

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
        GatewayIntentBits.MessageContent
    ]
});

// Initialize bot
const initBot = async () => {
    try {
        client.on('ready', async () => {
            console.log(`Bot is online as ${client.user?.tag}`);
            await registerCommands(client).catch(console.error);
        });

        client.on('interactionCreate', handleCommand);

        client.on('error', (error) => {
            console.error('Discord client error:', error);
        });

        client.on('disconnect', () => {
            console.log('Bot disconnected, attempting to reconnect...');
            reconnect();
        });

        await client.login(process.env.DISCORD_TOKEN);
        console.log('Bot logged in successfully');
    } catch (error) {
        console.error('Failed to initialize bot:', error);
        process.exit(1);
    }
};

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

// Start the bot
initBot().catch(console.error);
