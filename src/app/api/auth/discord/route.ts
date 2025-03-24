import { NextResponse } from 'next/server';
import { BOT_CONFIG } from '../../../../bot/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guild');

    // Build the URL with space-separated scopes
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.applicationId!,
        response_type: 'code',
        redirect_uri: 'https://discordtriage.com/api/auth/discord/callback',
        scope: 'bot applications.commands',  // Space-separated instead of plus
        state: guildId || '',
        integration_type: '1'
    });

    console.log('Generated URL:', `https://discord.com/oauth2/authorize?${params.toString()}`);

    return NextResponse.redirect(
        new URL(`https://discord.com/oauth2/authorize?${params.toString()}`)
    );
}
