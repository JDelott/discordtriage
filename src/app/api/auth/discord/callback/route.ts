import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // Parse the state JSON
        const stateData = JSON.parse(state || '{}');
        const guildId = stateData.guildId;
        const returnUrl = stateData.returnUrl;

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_APPLICATION_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: 'https://discordtriage.com/api/auth/discord/callback'  // Match exactly
            })
        });

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Get user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        const user = await userResponse.json();

        // Set Discord ID cookie
        cookies().set('discord_id', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        // If we have a returnUrl, use it, otherwise go to GitHub auth
        if (returnUrl) {
            return NextResponse.redirect(new URL(returnUrl, 'https://discordtriage.com'));
        } else {
            const githubAuthUrl = new URL('/api/auth/github', 'https://discordtriage.com');
            if (guildId) {
                githubAuthUrl.searchParams.set('guild', guildId);
            }
            return NextResponse.redirect(githubAuthUrl);
        }
    } catch (error) {
        console.error('Error in Discord callback:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
