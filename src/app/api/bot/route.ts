import { NextResponse } from 'next/server';
import { startBot } from '@/bot';

let botInitialized = false;

export async function GET() {
    try {
        if (!botInitialized) {
            await startBot();
            botInitialized = true;
            return NextResponse.json({ status: 'Bot started' });
        }
        return NextResponse.json({ status: 'Bot already running' });
    } catch (error) {
        console.error('Error starting bot:', error);
        botInitialized = false;
        if (error instanceof Error) {
            return NextResponse.json({ status: 'Bot failed to start', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ status: 'Bot failed to start', error: 'Unknown error' }, { status: 500 });
    }
}
