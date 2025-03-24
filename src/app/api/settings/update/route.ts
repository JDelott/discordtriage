import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '@/storage/userConfig';

export async function POST(request: Request) {
    try {
        const { repo } = await request.json();
        const cookieStore = cookies();
        const githubToken = cookieStore.get('github_token')?.value;
        const discordId = cookieStore.get('discord_id')?.value;
        
        console.log('Settings Update:', { 
            hasGithubToken: !!githubToken,
            discordId,
            repo
        });

        if (!githubToken || !discordId) {
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

        // Update config using actual Discord ID from cookie
        userConfigStore.setConfig(discordId, {
            githubToken,
            githubRepo: repo
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
