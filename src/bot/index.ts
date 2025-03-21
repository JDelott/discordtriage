import { Client, GatewayIntentBits, Events } from 'discord.js';
import { BOT_CONFIG } from './config';
import { registerCommands, handleCommand } from './commands';

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
