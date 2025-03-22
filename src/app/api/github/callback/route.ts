import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
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
            // Set GitHub token cookie
            const cookieStore = cookies();
            cookieStore.set('github_token', data.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            // If we have a Discord ID, update the user config
            const discordId = searchParams.get('state');
            if (discordId) {
                const existingConfig = userConfigStore.getConfig(discordId);
                userConfigStore.setConfig(discordId, {
                    githubToken: data.access_token,
                    githubRepo: existingConfig?.githubRepo || ''
                });
            }

            return NextResponse.redirect(new URL('/auth-success', request.url));
        }

        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
