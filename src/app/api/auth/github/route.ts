import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BOT_CONFIG } from '@/bot/config';

export async function GET(request: Request) {
    // Build GitHub OAuth URL without requiring Discord ID
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.clientId!,
        redirect_uri: BOT_CONFIG.oauthCallbackUrl,
        scope: 'repo'
    });

    return NextResponse.redirect(
        new URL(`https://github.com/login/oauth/authorize?${params.toString()}`)
    );
}
