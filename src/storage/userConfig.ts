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
            if (!fs.existsSync(this.configPath)) {
                console.log('Creating new config file');
                fs.writeFileSync(this.configPath, '{}', 'utf8');
            }
            
            const data = fs.readFileSync(this.configPath, 'utf8');
            console.log('Raw config data:', data);
            
            this.configs = JSON.parse(data);
            console.log('Loaded configs for users:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error loading configs:', error);
            this.configs = {};
        }
    }

    getConfig(userId: string): UserConfig | null {
        // Always reload configs before getting
        this.loadConfigs();
        
        console.log(`Getting config for user ${userId}`);
        console.log('Available configs:', this.configs);
        
        const config = this.configs[userId];
        if (!config) {
            console.log(`No config found for user ${userId}`);
            return null;
        }
        
        console.log(`Found config for user ${userId}:`, {
            hasToken: !!config.githubToken,
            repo: config.githubRepo
        });
        
        return config;
    }

    setConfig(userId: string, config: UserConfig) {
        console.log(`Setting config for user ${userId}:`, {
            hasToken: !!config.githubToken,
            repo: config.githubRepo
        });
        
        this.configs[userId] = config;
        this.saveConfigs();
    }

    private saveConfigs() {
        try {
            const data = JSON.stringify(this.configs, null, 2);
            fs.writeFileSync(this.configPath, data, 'utf8');
            console.log('Configs saved successfully');
            console.log('Available configs after save:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error saving configs:', error);
        }
    }
}

export const userConfigStore = UserConfigStore.getInstance();
