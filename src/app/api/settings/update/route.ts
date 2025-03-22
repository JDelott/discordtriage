import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function POST(request: Request) {
    try {
        const { repo } = await request.json();
        const cookieStore = cookies();
        const githubToken = cookieStore.get('github_token')?.value;
        const discordId = '1153799587178496063'; // Your Discord ID
        
        console.log('Settings Update:', { 
            hasGithubToken: !!githubToken,
            discordId,
            repo,
            existingConfigs: Object.keys(userConfigStore['configs'])
        });

        if (!githubToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        if (!repo?.match(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+$/)) {
            return NextResponse.json(
                { error: 'Invalid repository format' },
                { status: 400 }
            );
        }

        // Update config using Discord ID
        userConfigStore.setConfig(discordId, {
            githubToken,
            githubRepo: repo
        });

        // Force reload configs to ensure changes are picked up
        userConfigStore.loadConfigs();

        return NextResponse.json({ 
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
