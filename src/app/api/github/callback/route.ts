import { NextResponse } from 'next/server';
import { userConfigStore } from '@/storage/userConfig';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the Discord user ID

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const data = await tokenResponse.json();
        
        if (data.access_token) {
            // Get existing config first
            const existingConfig = userConfigStore.getConfig(state);
            console.log('Existing config before token update:', existingConfig);

            // Update token while preserving repo
            userConfigStore.setConfig(state, {
                githubToken: data.access_token,
                githubRepo: existingConfig?.githubRepo || ''
            });

            const updatedConfig = userConfigStore.getConfig(state);
            console.log('Config after token update:', updatedConfig);

            return NextResponse.redirect(new URL('/auth-success', request.url));
        }

        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
