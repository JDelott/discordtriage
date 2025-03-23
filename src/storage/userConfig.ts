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
            const data = fs.readFileSync(this.configPath, 'utf8');
            console.log('Raw config data:', data);
            
            const parsed = JSON.parse(data);
            this.configs = parsed;
            
            console.log('Loaded configs:', {
                userIds: Object.keys(this.configs),
                configData: this.configs
            });
        } catch (error) {
            console.error('Error loading configs:', error);
        }
    }

    getConfig(userId: string): UserConfig | null {
        // Debug logging
        console.log('Getting config for userId:', userId);
        console.log('Current configs:', this.configs);
        console.log('Config keys:', Object.keys(this.configs));
        
        const config = this.configs[userId];
        console.log('Found config:', config);
        
        return config || null;
    }

    setConfig(userId: string, updates: Partial<UserConfig>) {
        const current = this.configs[userId] || { githubToken: '', githubRepo: '' };
        
        this.configs[userId] = {
            githubToken: updates.githubToken ?? current.githubToken,
            githubRepo: updates.githubRepo ?? current.githubRepo
        };
        
        console.log('Updated config for:', userId, 'New config:', this.configs[userId]);
        this.saveConfigs();
    }

    private saveConfigs() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
            console.log('Saved configs:', this.configs);
        } catch (error) {
            console.error('Error saving configs:', error);
        }
    }
}

export const userConfigStore = UserConfigStore.getInstance();
