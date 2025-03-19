import { Octokit } from '@octokit/rest';
import { BOT_CONFIG } from './config';

// Store user tokens (in production, use a database)
export const userTokens = new Map<string, string>();

export async function createGitHubIssue(token: string, owner: string, repo: string, title: string, body: string) {
    const octokit = new Octokit({ auth: token });
    
    try {
        const response = await octokit.issues.create({
            owner,
            repo,
            title,
            body,
        });
        return response.data.html_url;
    } catch (error) {
        console.error('Error creating issue:', error);
        throw error;
    }
}

export function getAuthUrl(discordUserId: string): string {
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.clientId!,
        redirect_uri: BOT_CONFIG.oauthCallbackUrl,
        scope: 'repo',
        state: discordUserId,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
