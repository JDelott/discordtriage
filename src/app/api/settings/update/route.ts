import { NextResponse } from 'next/server';
import { userConfigStore } from '@/storage/userConfig';

export async function POST(request: Request) {
    try {
        const { discordId, repo } = await request.json();

        // Validate inputs
        if (!discordId || !repo) {
            console.error('Missing required fields:', { discordId, repo });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate repo format (username/repo)
        if (!repo.match(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+$/)) {
            console.error('Invalid repository format:', repo);
            return NextResponse.json(
                { error: 'Invalid repository format' },
                { status: 400 }
            );
        }

        // Get existing config first
        const existingConfig = userConfigStore.getConfig(discordId);
        console.log('Existing config before update:', existingConfig);

        // Only update the repo, keep the existing token
        userConfigStore.setConfig(discordId, {
            githubToken: existingConfig?.githubToken || '', // Keep existing token
            githubRepo: repo
        });

        const updatedConfig = userConfigStore.getConfig(discordId);
        console.log('Config after update:', updatedConfig);

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
