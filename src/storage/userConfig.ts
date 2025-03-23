import fs from 'fs';
import path from 'path';

interface UserConfig {
    githubToken: string;
    githubRepo: string;
}

class UserConfigStore {
    public configs: { [key: string]: UserConfig };
    private static instance: UserConfigStore;
    private configPath: string;

    private constructor() {
        // Explicitly set the path
        this.configPath = '/var/www/discordtriage/user-configs.json';
        this.configs = {};
        
        console.log('Bot UserConfigStore initializing with path:', this.configPath);
        
        // Check if file exists and is readable
        if (fs.existsSync(this.configPath)) {
            const stats = fs.statSync(this.configPath);
            console.log('Config file exists:', {
                size: stats.size,
                permissions: stats.mode.toString(8)
            });
            this.loadConfigs();
        } else {
            console.error('Config file does not exist at:', this.configPath);
            // Create empty config file
            fs.writeFileSync(this.configPath, '{}', 'utf8');
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
            const data = fs.readFileSync(this.configPath, 'utf8');
            console.log('Loading configs from:', this.configPath);
            
            const parsed = JSON.parse(data);
            this.configs = parsed;
            
            console.log('Loaded configs for users:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error loading configs:', error);
            // Don't reset configs on error
            if (Object.keys(this.configs).length === 0) {
                this.configs = {};
            }
        }
    }

    getConfig(userId: string): UserConfig | null {
        // Always reload before getting
        this.loadConfigs();
        
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
            const data = JSON.stringify(this.configs, null, 2);
            fs.writeFileSync(this.configPath, data, 'utf8');
            console.log('Saved configs for users:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error saving configs:', error);
        }
    }
}

export const userConfigStore = UserConfigStore.getInstance();
