import { NextResponse } from 'next/server';
import { BOT_CONFIG } from '../../../../bot/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get('guild');

    // Build Discord OAuth URL
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.applicationId!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`,
        response_type: 'code',
        scope: 'identify',
        state: guildId || '',
        prompt: 'consent'
    });

    console.log('Starting Discord auth flow with params:', Object.fromEntries(params));

    return NextResponse.redirect(
        new URL(`https://discord.com/oauth2/authorize?${params.toString()}`)
    );
}
