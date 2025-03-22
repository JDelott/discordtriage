import { Client, GatewayIntentBits, Events } from 'discord.js';
import { BOT_CONFIG } from './config';
import { registerCommands, handleCommand } from './commands';
import { config } from 'dotenv';
import path from 'path';

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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

let isReady = false;

client.once(Events.ClientReady, async () => {
    console.log('Bot is ready!');
    try {
        await registerCommands(client);
        console.log('Commands registered successfully');
        isReady = true;
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on(Events.InteractionCreate, handleCommand);

export async function startBot() {
    if (isReady) {
        console.log('Bot is already running');
        return;
    }

    try {
        await client.login(BOT_CONFIG.token);
        console.log('Bot started successfully');
    } catch (error) {
        console.error('Failed to start bot:', error);
        throw error;
    }
}
