import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const discordId = searchParams.get('state');

    console.log('Auth Callback:', {
        discordId,
        hasCode: !!code
    });

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
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
            // Get GitHub user info
            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            const githubUser = await userResponse.json();
            
            // Set cookies
            const cookieStore = cookies();
            cookieStore.set('github_token', data.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });
            
            // IMPORTANT: Always use Discord ID if available
            const userId = discordId || githubUser.id.toString();
            
            // If we have a Discord ID but are using GitHub ID, migrate the config
            if (discordId && userConfigStore.getConfig(githubUser.id.toString())) {
                const oldConfig = userConfigStore.getConfig(githubUser.id.toString());
                if (oldConfig) {
                    userConfigStore.setConfig(discordId, oldConfig);
                }
            }

            cookieStore.set('discord_id', userId, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            // Store config with the correct ID
            userConfigStore.setConfig(userId, {
                githubToken: data.access_token,
                githubRepo: userConfigStore.getConfig(userId)?.githubRepo || ''
            });

            console.log('Auth callback - Storing config for user:', {
                userId,
                isDiscordAuth: !!discordId,
                githubId: githubUser.id
            });

            return NextResponse.redirect(new URL('/auth-success', request.url));
        }

        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
