export interface InstallationBinding {
    discordUserId: string;
    guildId: string;
    githubToken: string;
    githubRepo: string;
    installedAt: Date;
}

export interface UserConfig {
    installations: { [guildId: string]: InstallationBinding };
    githubToken: string;
    defaultRepo?: string;
}
