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
        this.configs = {};
        this.loadConfigs();
    }

    public loadConfigs() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.configs = JSON.parse(data);
                console.log('Loaded configs for users:', Object.keys(this.configs));
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            // Don't override existing configs if read fails
        }
    }

    public getConfig(discordId: string): UserConfig | null {
        try {
            this.loadConfigs();
            return this.configs[discordId] || null;
        } catch (error) {
            console.error('Error getting config for user:', discordId, error);
            return null;
        }
    }

    public setConfig(discordId: string, updates: Partial<UserConfig>) {
        try {
            this.loadConfigs();
            const current = this.configs[discordId] || { githubToken: '', githubRepo: '' };
            this.configs[discordId] = {
                githubToken: updates.githubToken ?? current.githubToken,
                githubRepo: updates.githubRepo ?? current.githubRepo
            };
            this.saveConfigs();
            console.log('Updated config for:', discordId, 'New repo:', this.configs[discordId].githubRepo);
        } catch (error) {
            console.error('Error setting config for user:', discordId, error);
            throw error;
        }
    }

    private saveConfigs() {
        try {
            const dir = '/var/www/discordtriage';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
        } catch (error) {
            console.error('Error saving configs:', error);
            throw error;
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
