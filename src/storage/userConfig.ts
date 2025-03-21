import fs from 'fs';
import path from 'path';

export interface UserConfig {
    discordId: string;
    githubToken?: string;
    githubRepo?: string;
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

    private logSafeConfig(config: UserConfig | undefined) {
        if (!config) return undefined;
        return {
            githubRepo: config.githubRepo || '',
            githubToken: config.githubToken ? '[TOKEN HIDDEN]' : ''
        };
    }

    public getConfig(discordId: string): UserConfig | undefined {
        this.loadConfigs();
        const config = this.configs[discordId];
        console.log('Getting config for:', discordId, 'Config:', this.logSafeConfig(config));
        return config;
    }

    public setConfig(discordId: string, updates: Partial<UserConfig>) {
        this.loadConfigs();
        const current = this.configs[discordId] || { githubToken: '', githubRepo: '' };
        
        this.configs[discordId] = {
            discordId,
            githubToken: updates.githubToken ?? current.githubToken ?? '',
            githubRepo: updates.githubRepo ?? current.githubRepo ?? ''
        };
        
        this.saveConfigs();
        console.log('Updated config for:', discordId, 'New config:', this.logSafeConfig(this.configs[discordId]));
    }

    public updateToken(discordId: string, token: string) {
        const current = this.getConfig(discordId) || { githubRepo: '' };
        this.setConfig(discordId, { ...current, githubToken: token });
    }
}

export const userConfigStore = UserConfigStore.getInstance();

export const getConfig = async (discordId: string): Promise<UserConfig | null> => {
    try {
        // Your existing implementation
        return {
            discordId,
            // other fields from storage
        };
    } catch (error) {
        console.error('Error getting config:', error);
        return null;
    }
};

export const updateConfig = async (discordId: string, updates: Partial<Omit<UserConfig, 'discordId'>>): Promise<UserConfig> => {
    const config: UserConfig = {
        discordId,
        ...updates
    };
    
    // Save to storage
    const data = JSON.stringify({
        discordId,
        ...updates
    });
    
    // Return the updated config
    return config;
};
