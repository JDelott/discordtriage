import { NextResponse } from 'next/server';
import { BOT_CONFIG } from '../../../../bot/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guild');

    // Use the production URL explicitly instead of env variable
    const redirectUri = 'https://discordtriage.com/api/auth/discord/callback';

    // Build the URL manually to ensure exact format
    const baseUrl = 'https://discord.com/oauth2/authorize';
    const params = [
        `client_id=${BOT_CONFIG.applicationId}`,
        'permissions=2048',
        'scope=bot+applications.commands',
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        'response_type=code',
        `state=${guildId || ''}`,
        'integration_type=1'
    ].join('&');

    const url = `${baseUrl}?${params}`;
    
    console.log('Generated URL:', url);

    return NextResponse.redirect(new URL(url));
}
