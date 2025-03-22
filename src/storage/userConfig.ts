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
        console.log('Bot UserConfigStore initializing...');
        // Try to load existing configs first
        try {
            const rawConfig = fs.readFileSync(this.configPath, 'utf8');
            this.configs = JSON.parse(rawConfig);
            console.log('Loaded initial configs:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error loading initial configs:', error);
            this.configs = {};
        }
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
                const newConfigs = JSON.parse(data);
                // Only update if we got valid data
                if (Object.keys(newConfigs).length > 0) {
                    this.configs = newConfigs;
                    console.log('Bot loaded configs:', Object.keys(this.configs));
                } else {
                    console.log('No configs found in file, keeping existing:', Object.keys(this.configs));
                }
            } else {
                console.log('Config file does not exist at:', this.configPath);
            }
        } catch (error) {
            console.error('Bot error loading configs:', error);
            // Don't clear existing configs on error
            console.log('Keeping existing configs:', Object.keys(this.configs));
        }
    }

    getConfig(userId: string): UserConfig | null {
        console.log('Getting config for userId:', userId, 'Available:', Object.keys(this.configs));
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
