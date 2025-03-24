import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userConfigStore } from '../../../../storage/userConfig';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const guildId = searchParams.get('guild');
        const discordId = cookies().get('discord_id')?.value;

        if (!discordId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        if (!guildId) {
            return NextResponse.json(
                { error: 'No guild ID provided' },
                { status: 400 }
            );
        }

        const installation = userConfigStore.getInstallation(discordId, guildId);
        return NextResponse.json({
            repo: installation?.githubRepo || ''
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        return NextResponse.json(
            { error: 'Failed to get settings' },
            { status: 500 }
        );
    }
}
