import { NextResponse } from 'next/server';
import { Client, GatewayIntentBits } from 'discord.js';
import { registerCommands } from '../../../bot/commands';

// Single bot instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

let isInitialized = false;

export async function GET() {
    if (isInitialized) {
        return NextResponse.json({ status: 'Bot already running' });
    }

    try {
        await client.login(process.env.DISCORD_TOKEN);
        console.log('Bot logged in successfully');
        
        client.on('ready', async () => {
            console.log(`Logged in as ${client.user?.tag}`);
            await registerCommands();
            isInitialized = true;
        });
        
        return NextResponse.json({ status: 'Bot started successfully' });
    } catch (error) {
        console.error('Failed to start bot:', error);
        return NextResponse.json({ error: 'Failed to start bot' }, { status: 500 });
    }
}
