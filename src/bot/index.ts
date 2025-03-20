import { Client, GatewayIntentBits, Events } from 'discord.js';
import { BOT_CONFIG } from './config';
import { registerCommands, handleCommand } from './commands';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
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

client.on(Events.InteractionCreate, async (interaction) => {
    if (!isReady) {
        console.log('Bot not ready yet, ignoring interaction');
        return;
    }
    try {
        await handleCommand(interaction);
    } catch (error) {
        console.error('Error handling interaction:', error);
    }
});

export function startBot() {
    if (isReady) {
        console.log('Bot already running');
        return Promise.resolve();
    }
    console.log('Starting bot...');
    return client.login(BOT_CONFIG.token);
}
