import { NextResponse } from 'next/server';
import { startBot, client } from '../../../bot';
import { Client } from 'discord.js';

// Track bot status globally using Node's global object
declare global {
    var botStarted: boolean;
}

if (typeof global.botStarted === 'undefined') {
    global.botStarted = false;
}

export async function GET() {
    try {
        // Check if bot is already online
        if ((client as Client).isReady()) {
            return NextResponse.json({ status: 'online' });
        }

        // Start bot if not already started
        if (!global.botStarted) {
            const success = await startBot();
            global.botStarted = success;
        }

        return NextResponse.json({
            status: (client as Client).isReady() ? 'online' : 'offline'
        });
    } catch (error) {
        console.error('Error checking bot status:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
