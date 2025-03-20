import { NextResponse } from 'next/server';
import { BOT_CONFIG } from '@/bot/config';
import { store } from '@/bot/store';

export async function GET(request: Request) {
    console.log('GitHub OAuth callback received');
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Discord user ID

    console.log('Received params:', { 
        hasCode: !!code, 
        state: state 
    });

    if (!code || !state) {
        console.error('Missing parameters');
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        console.log('Requesting GitHub token...');
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
        console.log('Token response received:', { hasToken: !!data.access_token });
        
        if (data.access_token) {
            store.userTokens.set(state, data.access_token);
            console.log('Token stored for user:', state);
            
            const storedToken = store.userTokens.get(state);
            console.log('Token verification:', { 
                userId: state,
                wasStored: !!storedToken
            });
            
            return NextResponse.redirect(new URL('/auth-success', request.url));
        }

        console.error('Failed to get token:', data);
        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
