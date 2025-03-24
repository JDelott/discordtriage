import { NextResponse } from 'next/server';
import { BOT_CONFIG } from '../../../../bot/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guild');

    // Build the URL manually to ensure exact format
    const baseUrl = 'https://discord.com/oauth2/authorize';
    const params = [
        `client_id=${BOT_CONFIG.applicationId}`,
        'permissions=2048',
        'scope=bot+applications.commands',
        `redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`)}`,
        'response_type=code',
        `state=${guildId || ''}`
    ].join('&');

    const url = `${baseUrl}?${params}`;
    
    console.log('Generated URL:', url);

    return NextResponse.redirect(new URL(url));
}
