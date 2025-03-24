import fs from 'fs';

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
        console.log('Initializing UserConfigStore with path:', this.configPath);
        
        const dir = '/var/www/discordtriage';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        this.configs = {};
        this.loadConfigs();
    }

    public loadConfigs() {
        if (fs.existsSync(this.configPath)) {
            const data = fs.readFileSync(this.configPath, 'utf8');
            this.configs = JSON.parse(data);
        }
    }

    public getConfig(discordId: string): UserConfig | null {
        this.loadConfigs(); // Reload before getting
        return this.configs[discordId] || null;
    }

    public setConfig(discordId: string, updates: Partial<UserConfig>) {
        this.loadConfigs(); // Reload before setting
        const current = this.configs[discordId] || { githubToken: '', githubRepo: '' };
        this.configs[discordId] = {
            githubToken: updates.githubToken ?? current.githubToken,
            githubRepo: updates.githubRepo ?? current.githubRepo
        };
        this.saveConfigs();
    }

    private saveConfigs() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
    }

    public static getInstance(): UserConfigStore {
        if (!UserConfigStore.instance) {
            UserConfigStore.instance = new UserConfigStore();
        }
        return UserConfigStore.instance;
    }
}

export const userConfigStore = UserConfigStore.getInstance();
