import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function POST(request: Request) {
    try {
        const { repo } = await request.json();
        const cookieStore = cookies();
        const githubToken = cookieStore.get('github_token')?.value;
        const discordId = '1153799587178496063'; // Force the correct Discord ID
        
        console.log('Settings Update:', { 
            hasGithubToken: !!githubToken,
            discordId,
            repo 
        });

        if (!githubToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        if (!repo) {
            return NextResponse.json(
                { error: 'Repository is required' },
                { status: 400 }
            );
        }

        // Validate repo format
        if (!repo.match(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+$/)) {
            return NextResponse.json(
                { error: 'Invalid repository format' },
                { status: 400 }
            );
        }

        // Get existing config to preserve any existing data
        const existingConfig = userConfigStore.getConfig(discordId);
        
        // Update config using Discord ID
        userConfigStore.setConfig(discordId, {
            githubToken, // Use the current token
            githubRepo: repo
        });

        console.log('Updated config for Discord ID:', {
            discordId,
            repo,
            availableConfigs: Object.keys(userConfigStore['configs'])
        });

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
