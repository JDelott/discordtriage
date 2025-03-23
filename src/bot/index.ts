import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import path from 'path';
import { handleCommand, registerCommands } from './commands';
import { userConfigStore } from '../storage/userConfig';
import fs from 'fs';

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

// Create client with explicit intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Export the startBot function for the API route
export async function startBot(): Promise<boolean> {
    // Debug: Check file access
    try {
        const configPath = '/var/www/discordtriage/user-configs.json';
        const envPath = '/var/www/discordtriage/.env';
        
        console.log('Checking file access...');
        
        // Check user-configs.json
        if (fs.existsSync(configPath)) {
            const configStats = fs.statSync(configPath);
            console.log('Config file exists:', {
                path: configPath,
                size: configStats.size,
                permissions: configStats.mode.toString(8),
                owner: configStats.uid,
                group: configStats.gid
            });
            
            // Try to read it
            const configData = fs.readFileSync(configPath, 'utf8');
            console.log('Config file is readable, users:', Object.keys(JSON.parse(configData)));
        } else {
            console.error('Config file does not exist:', configPath);
        }
        
        // Check .env
        if (fs.existsSync(envPath)) {
            const envStats = fs.statSync(envPath);
            console.log('Env file exists:', {
                path: envPath,
                size: envStats.size,
                permissions: envStats.mode.toString(8),
                owner: envStats.uid,
                group: envStats.gid
            });
        } else {
            console.error('Env file does not exist:', envPath);
        }
        
        console.log('Current DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'exists' : 'missing');
        
    } catch (error) {
        console.error('File access error:', error);
    }

    // Force load configs before starting bot
    userConfigStore.loadConfigs();
    console.log('Bot starting with configs:', Object.keys(userConfigStore['configs']));

    try {
        console.log('Starting bot with intents:', client.options.intents);
        await client.login(process.env.DISCORD_TOKEN);
        console.log('Bot logged in successfully');
        
        client.on('ready', () => {
            console.log(`Logged in as ${client.user?.tag}`);
        });
        
        client.on('error', (error) => {
            console.error('Discord client error:', error);
        });
        
        client.on('interactionCreate', async (interaction) => {
            // Force reload configs before each interaction
            userConfigStore.loadConfigs();
            await handleCommand(interaction);
        });

        client.on('disconnect', () => {
            console.log('Bot disconnected, attempting to reconnect...');
            reconnect();
        });

        await registerCommands();
        return true;
    } catch (error) {
        console.error('Failed to start bot:', error);
        throw error;
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
