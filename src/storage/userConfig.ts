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
        // Use absolute path for both bot and web server
        this.configPath = '/var/www/discordtriage/user-configs.json';
        console.log('Initializing UserConfigStore with path:', this.configPath);
        
        // Create directory if it doesn't exist
        const dir = '/var/www/discordtriage';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        this.configs = {};
        this.loadConfigs(); // Initial load
    }

    public loadConfigs() {
        try {
            console.log('Loading configs from:', this.configPath);
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.configs = JSON.parse(data);
                console.log('Loaded configs for users:', Object.keys(this.configs));
            } else {
                console.log('No config file exists yet, starting fresh');
                this.configs = {};
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            this.configs = {};
        }
    }

    public getConfig(discordId: string): UserConfig | null {
        // Force reload configs before each get
        this.loadConfigs();
        console.log('Getting config for user:', discordId);
        console.log('Available configs:', Object.keys(this.configs));
        return this.configs[discordId] || null;
    }

    public setConfig(discordId: string, updates: Partial<UserConfig>) {
        // Force reload before updating
        this.loadConfigs();
        
        const current = this.configs[discordId] || { githubToken: '', githubRepo: '' };
        this.configs[discordId] = {
            githubToken: updates.githubToken ?? current.githubToken,
            githubRepo: updates.githubRepo ?? current.githubRepo
        };
        
        this.saveConfigs();
        console.log('Updated config for:', discordId, 'New repo:', this.configs[discordId].githubRepo);
    }

    private saveConfigs() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
            console.log('Saved configs successfully');
        } catch (error) {
            console.error('Error saving configs:', error);
        }
    }

    public static getInstance(): UserConfigStore {
        if (!UserConfigStore.instance) {
            UserConfigStore.instance = new UserConfigStore();
        }
        return UserConfigStore.instance;
    }
}

export const userConfigStore = UserConfigStore.getInstance();
