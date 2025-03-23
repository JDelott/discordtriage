import fs from 'fs';
import path from 'path';

interface UserConfig {
    githubToken: string;
    githubRepo: string;
}

class UserConfigStore {
    public configs: { [key: string]: UserConfig } = {};
    private static instance: UserConfigStore;
    private configPath: string;

    private constructor() {
        this.configPath = '/var/www/discordtriage/user-configs.json';
        console.log('Initializing UserConfigStore');
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
            if (fs.existsSync(this.configPath)) {
                const parsed = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                this.configs = parsed;
                // Only log user IDs, never tokens
                console.log('Config loaded for users:', Object.keys(this.configs));
            } else {
                console.log('No config file found, creating empty one');
                this.configs = {};
                this.saveConfigs();
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            this.configs = {};
        }
    }

    getConfig(userId: string): UserConfig | null {
        this.loadConfigs();
        const config = this.configs[userId];
        // Safe logging
        console.log('Getting config for user:', userId, 'exists:', !!config);
        return config || null;
    }

    setConfig(userId: string, config: UserConfig) {
        // Safe logging
        console.log('Setting config for user:', userId);
        this.configs[userId] = config;
        this.saveConfigs();
    }

    private saveConfigs() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
            console.log('Configs saved for users:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error saving configs:', error);
        }
    }
}

export const userConfigStore = UserConfigStore.getInstance();
