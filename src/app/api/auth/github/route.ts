import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BOT_CONFIG } from '../../../../bot/config';

export async function GET(request: Request) {
    const cookieStore = cookies();
    const discordId = cookieStore.get('discord_id')?.value;
    const guildId = new URL(request.url).searchParams.get('guild');

    if (!discordId) {
        console.error('No Discord ID found in cookies');
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Build GitHub OAuth URL with Discord ID and guild ID in state
    const stateData = JSON.stringify({ discordId, guildId });
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.clientId!,
        redirect_uri: BOT_CONFIG.oauthCallbackUrl,
        scope: 'repo',
        state: stateData
    });

    console.log('Starting GitHub auth with state:', stateData);

    return NextResponse.redirect(
        new URL(`https://github.com/login/oauth/authorize?${params.toString()}`)
    );
}
