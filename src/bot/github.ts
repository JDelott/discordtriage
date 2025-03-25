import { Octokit } from '@octokit/rest';
import { BOT_CONFIG } from './config';

export async function createGitHubIssue(token: string, owner: string, repo: string, title: string, body: string) {
    console.log('Creating issue in:', `${owner}/${repo}`);
    
    // Verify token is still valid
    try {
        const octokit = new Octokit({ auth: token });
        
        // Test the token first with a simple API call
        console.log('Validating GitHub token...');
        const { data: user } = await octokit.users.getAuthenticated();
        console.log('GitHub token is valid for user:', user.login);
        
        // Now try to access the repository
        console.log('Checking repository access...');
        await octokit.repos.get({
            owner,
            repo
        });
        
        // If we got here, we have access to create issues
        const response = await octokit.issues.create({
            owner,
            repo,
            title,
            body,
            labels: ['discord']
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
        
        if (error.status === 401) {
            throw new Error('GitHub token has expired - please re-authenticate');
        }
        if (error.status === 404) {
            throw new Error(`Cannot access repository ${owner}/${repo} - please check repository permissions`);
        }
        throw new Error(`GitHub API error: ${error.message}`);
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
