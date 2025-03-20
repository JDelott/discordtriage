import { Octokit } from '@octokit/rest';
import { BOT_CONFIG } from './config';
import { store } from './store';

// Use the store's userTokens map
export const userTokens = store.userTokens;

export async function createGitHubIssue(token: string, owner: string, repo: string, title: string, body: string) {
    console.log('Creating issue with token:', token ? 'Token exists' : 'No token');
    const octokit = new Octokit({ auth: token });
    
    try {
        const response = await octokit.issues.create({
            owner,
            repo,
            title,
            body,
        });
        console.log('Issue created successfully:', response.data.html_url);
        return response.data.html_url;
    } catch (error) {
        console.error('Error creating issue:', error);
        throw error;
    }
}

export function getAuthUrl(discordUserId: string): string {
    console.log('Getting auth URL for Discord user:', discordUserId);
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.clientId!,
        redirect_uri: BOT_CONFIG.oauthCallbackUrl,
        scope: 'repo',
        state: discordUserId,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
