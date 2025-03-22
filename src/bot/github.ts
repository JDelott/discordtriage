import { Octokit } from '@octokit/rest';
import { BOT_CONFIG } from './config';

export async function createGitHubIssue(token: string, owner: string, repo: string, title: string, body: string) {
    console.log('Creating issue in:', `${owner}/${repo}`);
    
    // Verify token is still valid
    try {
        const octokit = new Octokit({ auth: token });
        
        // Test the token first
        await octokit.users.getAuthenticated();
        console.log('GitHub token is valid');
        
        const response = await octokit.issues.create({
            owner,
            repo,
            title,
            body,
        });
        
        console.log('Issue created successfully:', response.data.html_url);
        return response.data.html_url;
    } catch (error: any) {
        console.error('GitHub API error:', {
            status: error.status,
            message: error.message,
            owner,
            repo
        });
        
        // If token is invalid, force a re-auth
        if (error.status === 401) {
            console.log('Token is invalid, forcing re-auth');
            throw new Error('GitHub token is invalid');
        }
        throw error;
    }
}

export function getAuthUrl(userId: string): string {
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const params = new URLSearchParams({
        client_id: BOT_CONFIG.clientId!,
        redirect_uri: BOT_CONFIG.oauthCallbackUrl,
        scope: 'repo',
        state: userId
    });
    
    return `${baseUrl}?${params.toString()}`;
}
