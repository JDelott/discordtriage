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
        // Use absolute path
        this.configPath = '/var/www/discordtriage/user-configs.json';
        this.configs = {};
        
        console.log('Bot UserConfigStore initializing with path:', this.configPath);
        console.log('Current working directory:', process.cwd());
        
        // Check if file exists
        if (fs.existsSync(this.configPath)) {
            console.log('Config file exists');
            const stats = fs.statSync(this.configPath);
            console.log('File permissions:', stats.mode.toString(8));
        } else {
            console.log('Config file does not exist!');
        }
        
        this.loadConfigs();
    }

    static getInstance(): UserConfigStore {
        if (!UserConfigStore.instance) {
            UserConfigStore.instance = new UserConfigStore();
        }
        return UserConfigStore.instance;
    }

    private forceLoadConfigs() {
        try {
            // Read file synchronously
            const data = fs.readFileSync(this.configPath, 'utf8');
            console.log('Raw config data:', data);
            
            // Parse JSON
            const parsed = JSON.parse(data);
            
            // Validate structure
            if (typeof parsed === 'object' && parsed !== null) {
                this.configs = parsed;
                // Safe logging that doesn't expose tokens
                console.log('Loaded configs for users:', {
                    userIds: Object.keys(this.configs),
                    configsWithTokens: Object.entries(this.configs).map(([id, config]) => ({
                        userId: id,
                        hasToken: !!config.githubToken,
                        repo: config.githubRepo
                    }))
                });
            } else {
                throw new Error('Invalid config structure');
            }
        } catch (error) {
            console.error('Error in forceLoadConfigs:', error);
            // Don't clear existing configs on error
            if (Object.keys(this.configs).length === 0) {
                this.configs = {};
            }
        }
    }

    public loadConfigs() {
        this.forceLoadConfigs();
    }

    getConfig(userId: string): UserConfig | null {
        // Always force reload before getting config
        this.forceLoadConfigs();
        
        console.log('Getting config for userId:', userId, {
            hasConfig: !!this.configs[userId],
            hasToken: !!this.configs[userId]?.githubToken,
            repo: this.configs[userId]?.githubRepo
        });
        
        return this.configs[userId] || null;
    }

    setConfig(userId: string, config: UserConfig) {
        // Always force reload before setting
        this.forceLoadConfigs();
        
        console.log('Setting config for userId:', userId, {
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
            console.log('Configs saved. Available users:', Object.keys(this.configs));
        } catch (error) {
            console.error('Error saving configs:', error);
        }
    }
}

export const userConfigStore = UserConfigStore.getInstance();
