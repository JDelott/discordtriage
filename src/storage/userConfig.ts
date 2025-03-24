import fs from 'fs';
import { UserConfig, InstallationBinding } from '../types/auth';

class UserConfigStore {
    private configs: { [discordUserId: string]: UserConfig } = {};
    private static instance: UserConfigStore;
    private configPath: string;

    private constructor() {
        this.configPath = '/var/www/discordtriage/user-configs.json';
        this.configs = {};
        this.loadConfigs();
    }

    public loadConfigs() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.configs = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading configs:', error);
        }
    }

    public getInstallation(discordUserId: string, guildId: string): InstallationBinding | null {
        this.loadConfigs();
        return this.configs[discordUserId]?.installations[guildId] || null;
    }

    public setInstallation(discordUserId: string, guildId: string, installation: Partial<InstallationBinding>) {
        this.loadConfigs();
        
        if (!this.configs[discordUserId]) {
            this.configs[discordUserId] = {
                installations: {},
                githubToken: installation.githubToken || ''
            };
        }

        const current = this.configs[discordUserId].installations[guildId] || {
            discordUserId,
            guildId,
            githubToken: '',
            githubRepo: '',
            installedAt: new Date()
        };

        this.configs[discordUserId].installations[guildId] = {
            ...current,
            ...installation,
            discordUserId,
            guildId
        };

        this.saveConfigs();
    }

    private saveConfigs() {
        try {
            const dir = '/var/www/discordtriage';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
        } catch (error) {
            console.error('Error saving configs:', error);
            throw error;
        }
    }

    public static getInstance(): UserConfigStore {
        if (!UserConfigStore.instance) {
            UserConfigStore.instance = new UserConfigStore();
        }
        return UserConfigStore.instance;
    }
}

export const userConfigStore = UserConfigStore.getInstance();
