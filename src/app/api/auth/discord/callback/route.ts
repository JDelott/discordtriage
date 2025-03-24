import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const guildId = searchParams.get('state');

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        // Use the exact same redirect URI as in the initial request
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/discord/callback`;
        
        console.log('Callback received with code:', code);
        console.log('Using redirect URI:', redirectUri);

        // Exchange code for token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_APPLICATION_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri  // Must match exactly
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

        // Redirect to GitHub auth with guild ID
        const githubAuthUrl = new URL('/api/auth/github', request.url);
        if (guildId) {
            githubAuthUrl.searchParams.set('guild', guildId);
        }

        console.log('Discord auth successful, redirecting to GitHub auth');
        return NextResponse.redirect(githubAuthUrl);

    } catch (error) {
        console.error('Discord callback error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
