import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function GET() {
    const cookieStore = cookies();
    const githubToken = cookieStore.get('github_token')?.value;
    const discordId = '1153799587178496063'; // Force the correct Discord ID
    
    console.log('Settings Get:', { 
        hasGithubToken: !!githubToken,
        discordId,
        existingConfig: userConfigStore.getConfig(discordId)
    });

    if (!githubToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get config using Discord ID
    const config = userConfigStore.getConfig(discordId);
    
    console.log('Returning config for Discord ID:', {
        discordId,
        repo: config?.githubRepo,
        hasToken: !!config?.githubToken
    });
    
    return NextResponse.json({
        repo: config?.githubRepo || ''
    });
}
