import fs from 'fs';

interface UserConfig {
    githubToken: string;
    githubRepo: string;
}

class UserConfigStore {
    private configs: { [key: string]: UserConfig } = {};
    private static instance: UserConfigStore;

    private constructor() {
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
            const data = fs.readFileSync('user-configs.json', 'utf8');
            this.configs = JSON.parse(data);
            console.log('Loaded configs:', Object.keys(this.configs));
        } catch (error) {
            console.log('No existing configs found or error loading:', error);
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
        this.configs[userId] = {
            githubToken: config.githubToken,
            githubRepo: config.githubRepo
        };
        this.saveConfigs();
        console.log('Updated configs. Available IDs:', Object.keys(this.configs));
    }

    private saveConfigs() {
        try {
            fs.writeFileSync('user-configs.json', JSON.stringify(this.configs, null, 2));
            console.log('Configs saved successfully');
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
