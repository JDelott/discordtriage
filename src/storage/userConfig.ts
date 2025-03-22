import fs from 'fs';
import path from 'path';

interface UserConfig {
    githubToken: string;
    githubRepo: string;
}

class UserConfigStore {
    private configs: { [key: string]: UserConfig } = {};
    private static instance: UserConfigStore;
    private configPath: string = '/var/www/discordtriage/user-configs.json';

    private constructor() {
        console.log('Bot UserConfigStore initializing with path:', this.configPath);
        this.loadConfigs();
    }

    static getInstance(): UserConfigStore {
        if (!UserConfigStore.instance) {
            UserConfigStore.instance = new UserConfigStore();
        }
        return UserConfigStore.instance;
    }

    public loadConfigs() {
        try {
            console.log('Bot loading configs from:', this.configPath);
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.configs = JSON.parse(data);
                console.log('Bot loaded configs:', Object.keys(this.configs));
            } else {
                console.log('Bot config file does not exist at:', this.configPath);
            }
        } catch (error) {
            console.error('Bot error loading configs:', error);
            this.configs = {};
        }
    }

    getConfig(userId: string): UserConfig | null {
        this.loadConfigs();
        return this.configs[userId] || null;
    }

    setConfig(userId: string, config: UserConfig) {
        this.loadConfigs();
        this.configs[userId] = config;
        this.saveConfigs();
    }

    private saveConfigs() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
            console.log('Bot configs saved successfully');
            console.log('Bot updated configs. Available IDs:', Object.keys(this.configs));
        } catch (error) {
            console.error('Bot error saving configs:', error);
        }
    }

    // Helper method to safely log config without exposing tokens
    private logSafeConfig(config: UserConfig | null): any {
        if (!config) return null;
        return {
            githubRepo: config.githubRepo,
            githubToken: config.githubToken ? '[REDACTED]' : null
        };
    }
}

export const userConfigStore = UserConfigStore.getInstance();
