import fs from 'fs';
import path from 'path';

interface UserConfig {
    githubToken: string;
    githubRepo: string;
}

class UserConfigStore {
    private static instance: UserConfigStore;
    private configPath: string;
    private configs: Record<string, UserConfig>;

    private constructor() {
        this.configPath = path.join(process.cwd(), '.data', 'user-configs.json');
        this.configs = {};
        this.ensureConfigDirectory();
        this.loadConfigs();
        console.log('UserConfigStore initialized with:', this.configs);
    }

    private ensureConfigDirectory() {
        const dir = path.dirname(this.configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    public static getInstance(): UserConfigStore {
        if (!UserConfigStore.instance) {
            UserConfigStore.instance = new UserConfigStore();
        }
        return UserConfigStore.instance;
    }

    private loadConfigs() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.configs = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            this.configs = {};
        }
    }

    private saveConfigs() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
            console.log('Saved configs:', this.configs);
        } catch (error) {
            console.error('Error saving configs:', error);
        }
    }

    public getConfig(discordId: string): UserConfig | undefined {
        this.loadConfigs(); // Always load fresh
        return this.configs[discordId];
    }

    public setConfig(discordId: string, updates: Partial<UserConfig>) {
        this.loadConfigs(); // Always load fresh
        const current = this.configs[discordId] || {};
        
        // Merge updates with current config
        this.configs[discordId] = {
            githubToken: updates.githubToken ?? current.githubToken ?? '',
            githubRepo: updates.githubRepo ?? current.githubRepo ?? ''
        };
        
        this.saveConfigs();
        console.log('Updated config for:', discordId, 'New config:', this.configs[discordId]);
    }

    public updateToken(discordId: string, token: string) {
        const current = this.getConfig(discordId) || { githubRepo: '' };
        this.setConfig(discordId, { ...current, githubToken: token });
    }
}

export const userConfigStore = UserConfigStore.getInstance();
