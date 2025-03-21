"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTokens = void 0;
exports.createGitHubIssue = createGitHubIssue;
exports.getAuthUrl = getAuthUrl;
const rest_1 = require("@octokit/rest");
const config_1 = require("./config");
const store_1 = require("./store");
// Use the store's userTokens map
exports.userTokens = store_1.store.userTokens;
async function createGitHubIssue(token, owner, repo, title, body) {
    console.log('Creating issue with token:', token ? 'Token exists' : 'No token');
    const octokit = new rest_1.Octokit({ auth: token });
    try {
        const response = await octokit.issues.create({
            owner,
            repo,
            title,
            body,
        });
        console.log('Issue created successfully:', response.data.html_url);
        return response.data.html_url;
    }
    catch (error) {
        console.error('Error creating issue:', error);
        throw error;
    }
}
function getAuthUrl(discordUserId) {
    console.log('Getting auth URL for Discord user:', discordUserId);
    const params = new URLSearchParams({
        client_id: config_1.BOT_CONFIG.clientId,
        redirect_uri: config_1.BOT_CONFIG.oauthCallbackUrl,
        scope: 'repo',
        state: discordUserId,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
