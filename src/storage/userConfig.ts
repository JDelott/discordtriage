import fs from 'fs';
import path from 'path';

interface UserConfig {
    githubToken: string;
    githubRepo: string;
}

class UserConfigStore {
    private configs: { [key: string]: UserConfig } = {};
    private static instance: UserConfigStore;
    private configPath: string;

    private constructor() {
        // Always use absolute path
        this.configPath = '/var/www/discordtriage/user-configs.json';
        console.log('UserConfigStore initialized with path:', this.configPath);
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
            console.log('Loading configs from:', this.configPath);
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.configs = JSON.parse(data);
                console.log('Loaded configs:', Object.keys(this.configs));
            } else {
                console.log('Config file does not exist at:', this.configPath);
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            this.configs = {};
        }
    }

    getConfig(userId: string): UserConfig | null {
        console.log('Getting config for userId:', userId);
        console.log('Available configs:', Object.keys(this.configs));
        return this.configs[userId] || null;
    }

    setConfig(userId: string, config: UserConfig) {
        console.log('Setting config for userId:', userId);
        this.configs[userId] = config;
        this.saveConfigs();
    }

    private saveConfigs() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
            console.log('Configs saved successfully');
            console.log('Updated configs. Available IDs:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error saving configs:', error);
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
