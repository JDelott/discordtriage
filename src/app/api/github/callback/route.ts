import { NextResponse } from 'next/server';
import { BOT_CONFIG } from '@/bot/config';
import { userTokens } from '@/bot/github';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Discord user ID

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: BOT_CONFIG.clientId,
                client_secret: BOT_CONFIG.clientSecret,
                code,
            }),
        });

        const data = await tokenResponse.json();
        if (data.access_token) {
            userTokens.set(state, data.access_token);
            return NextResponse.redirect(new URL('/auth-success', request.url));
        }

        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
