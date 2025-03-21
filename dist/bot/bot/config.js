"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_CONFIG = void 0;
exports.BOT_CONFIG = {
    token: process.env.DISCORD_TOKEN,
    applicationId: process.env.DISCORD_APPLICATION_ID,
    publicKey: process.env.DISCORD_PUBLIC_KEY,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    oauthCallbackUrl: process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/api/github/callback'
};
