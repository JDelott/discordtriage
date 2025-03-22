import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function GET() {
    const cookieStore = cookies();
    const githubToken = cookieStore.get('github_token')?.value;
    const discordId = cookieStore.get('discord_id')?.value;
    
    console.log('Settings Get:', { 
        hasGithubToken: !!githubToken,
        hasDiscordId: !!discordId,
        environment: process.env.NODE_ENV
    });

    if (!githubToken || !discordId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify GitHub token
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const config = userConfigStore.getConfig(discordId);
        return NextResponse.json({
            repo: config?.githubRepo || ''
        });
    } catch (error) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
}
