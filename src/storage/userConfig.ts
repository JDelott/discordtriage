import fs from 'fs';
import path from 'path';

interface UserConfig {
    githubToken: string;
    githubRepo: string;
}

class UserConfigStore {
    public configs: { [key: string]: UserConfig };
    private static instance: UserConfigStore;
    private configPath: string = '/var/www/discordtriage/user-configs.json';

    private constructor() {
        this.configs = {};
        console.log('Bot UserConfigStore initializing...');
        
        // Ensure config file exists and is readable
        if (!fs.existsSync(this.configPath)) {
            console.error(`Config file not found at ${this.configPath}`);
            fs.writeFileSync(this.configPath, '{}', 'utf8');
        }
        
        // Load configs immediately
        this.forceLoadConfigs();
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
                console.log('Loaded configs:', {
                    userIds: Object.keys(this.configs),
                    configCount: Object.keys(this.configs).length
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
        
        console.log('Getting config for userId:', userId);
        console.log('Available configs:', Object.keys(this.configs));
        
        const config = this.configs[userId];
        console.log('Found config:', config ? 'yes' : 'no');
        
        return config || null;
    }

    setConfig(userId: string, config: UserConfig) {
        // Always force reload before setting
        this.forceLoadConfigs();
        
        console.log('Setting config for userId:', userId);
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
