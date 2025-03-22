import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BOT_CONFIG } from '@/bot/config';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get('state');

    // Build GitHub OAuth URL with Discord ID in state
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.clientId!,
        redirect_uri: BOT_CONFIG.oauthCallbackUrl,
        scope: 'repo',
        state: discordId || '' // Pass through the Discord ID
    });

    console.log('Starting GitHub auth with state:', discordId);

    return NextResponse.redirect(
        new URL(`https://github.com/login/oauth/authorize?${params.toString()}`)
    );
}
