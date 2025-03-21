import { NextResponse } from 'next/server';
import { startBot } from '../../../bot';

// Track bot status globally using Node's global object
declare global {
    var botStarted: boolean;
}

if (typeof global.botStarted === 'undefined') {
    global.botStarted = false;
}

export async function GET() {
    try {
        // Only start the bot once
        if (!global.botStarted) {
            await startBot();
            global.botStarted = true;
            console.log('Bot started successfully');
        }
        
        return NextResponse.json({ status: 'Bot is online!' });
    } catch (error) {
        console.error('Failed to start bot:', error);
        global.botStarted = false;
        return NextResponse.json({ error: 'Failed to start bot' }, { status: 500 });
    }
}
