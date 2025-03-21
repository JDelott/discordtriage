import { NextResponse } from 'next/server';
import { startBot } from '@/bot';

// Track bot status globally
let botStarted = false;

export async function GET() {
    try {
        // Only start the bot once
        if (!botStarted) {
            await startBot();
            botStarted = true;
            console.log('Bot started successfully');
        }
        
        return NextResponse.json({ status: 'Bot is online!' });
    } catch (error) {
        console.error('Failed to start bot:', error);
        botStarted = false;
        return NextResponse.json({ error: 'Failed to start bot' }, { status: 500 });
    }
}
