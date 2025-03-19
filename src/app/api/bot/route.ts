import { NextResponse } from 'next/server';
import { startBot } from '@/bot';

let botInitialized = false;

export async function GET() {
  if (!botInitialized) {
    startBot();
    botInitialized = true;
    return NextResponse.json({ status: 'Bot started' });
  }
  return NextResponse.json({ status: 'Bot already running' });
}
