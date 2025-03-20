import { NextResponse } from 'next/server';
import { startBot } from '@/bot';

export async function GET() {
    try {
        await startBot();
        return NextResponse.json({ status: 'Bot is online!' });
    } catch (error) {
        console.error('Failed to start bot:', error);
        return NextResponse.json({ error: 'Failed to start bot' }, { status: 500 });
    }
}
