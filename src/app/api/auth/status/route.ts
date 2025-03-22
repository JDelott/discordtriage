import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = cookies();
    const githubToken = cookieStore.get('github_token')?.value;
    const discordId = cookieStore.get('discord_id')?.value;
    
    console.log('Auth Status Check:', { 
        hasGithubToken: !!githubToken,
        hasDiscordId: !!discordId,
        discordId 
    });

    // Verify GitHub token is still valid
    if (githubToken) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                // Token is invalid, clear it
                cookieStore.delete('github_token');
                return NextResponse.json({
                    authenticated: false,
                    discordId
                });
            }
        } catch (error) {
            console.error('Error verifying GitHub token:', error);
            return NextResponse.json({
                authenticated: false,
                discordId
            });
        }
    }
    
    return NextResponse.json({
        authenticated: !!githubToken,
        discordId
    });
}
