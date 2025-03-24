import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const discordId = cookies().get('discord_id')?.value;
        const guildId = searchParams.get('guild') || 'default';

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Get GitHub user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: 'application/json',
            },
        });

        const githubUser = await userResponse.json();

        if (discordId) {
            // Store the token with the Discord ID
            userConfigStore.setInstallation(discordId, guildId, {
                githubToken: tokenData.access_token,
                githubRepo: '',
                installedAt: new Date()
            });

            // Set cookie and redirect
            cookies().set('github_token', tokenData.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });

            return NextResponse.redirect(new URL('/settings?success=true', request.url));
        }

        return NextResponse.json({ error: 'No Discord ID found' }, { status: 400 });
    } catch (error) {
        console.error('GitHub callback error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
