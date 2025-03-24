export const BOT_CONFIG = {
  token: process.env.DISCORD_TOKEN,
  applicationId: process.env.DISCORD_APPLICATION_ID,
  publicKey: process.env.DISCORD_PUBLIC_KEY,
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  oauthCallbackUrl: 'https://discordtriage.com/api/github/callback'
};
