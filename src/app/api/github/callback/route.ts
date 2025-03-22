import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const discordId = searchParams.get('state');
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 30 // 30 days
    };

    console.log('Auth Callback:', { 
        hasCode: !!code,
        hasDiscordId: !!discordId,
        isProduction: process.env.NODE_ENV === 'production'
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
            cookieStore.set('github_token', data.access_token, cookieOptions);
            
            // IMPORTANT: Always use Discord ID if available
            const userId = discordId || githubUser.id.toString();
            
            // If we have a Discord ID but are using GitHub ID, migrate the config
            if (discordId && userConfigStore.getConfig(githubUser.id.toString())) {
                const oldConfig = userConfigStore.getConfig(githubUser.id.toString());
                if (oldConfig) {
                    userConfigStore.setConfig(discordId, oldConfig);
                }
            }

            cookieStore.set('discord_id', userId, cookieOptions);

            // Store config with the correct ID
            userConfigStore.setConfig(userId, {
                githubToken: data.access_token,
                githubRepo: ''
            });

            console.log('Auth callback - Storing config for user:', {
                userId,
                isDiscordAuth: !!discordId,
                githubId: githubUser.id
            });

            const redirectUrl = isProduction 
                ? 'https://discordtriage.com/auth-success'
                : 'http://localhost:3000/auth-success';

            return NextResponse.redirect(new URL(redirectUrl));
        }

        return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
