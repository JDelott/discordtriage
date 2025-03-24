import { NextResponse } from 'next/server';
import { BOT_CONFIG } from '../../../../bot/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guild');

    // Explicitly encode the redirect URI
    const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`);

    // Build Discord OAuth URL
    const params = new URLSearchParams();
    params.append('client_id', BOT_CONFIG.applicationId!);
    params.append('permissions', '2048');  // Send Messages
    params.append('scope', 'bot applications.commands');
    params.append('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`);
    params.append('response_type', 'code');
    params.append('state', guildId || '');

    console.log('Starting Discord auth flow with params:', Object.fromEntries(params));
    console.log('Redirect URI:', `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`);

    return NextResponse.redirect(
        new URL(`https://discord.com/oauth2/authorize?${params.toString()}`)
    );
}
