import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '../../../../storage/userConfig';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            console.error('Missing code or state');
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Parse state data
        let stateData;
        try {
            stateData = JSON.parse(state);
        } catch (e) {
            console.error('Invalid state data:', state);
            return NextResponse.json({ error: 'Invalid state data' }, { status: 400 });
        }

        const { discordId, guildId } = stateData;

        if (!discordId) {
            console.error('No Discord ID in state:', state);
            return NextResponse.json({ error: 'No Discord ID found' }, { status: 400 });
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

        // Store the token with the Discord ID and guild ID
        userConfigStore.setInstallation(discordId, guildId || 'default', {
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

        const redirectUrl = new URL('/settings', 'https://discordtriage.com');
        if (guildId) {
            redirectUrl.searchParams.set('guild', guildId);
        }
        redirectUrl.searchParams.set('success', 'true');

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('GitHub callback error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
