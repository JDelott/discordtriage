"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userConfigStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class UserConfigStore {
    constructor() {
        this.configPath = path_1.default.join(process.cwd(), '.data', 'user-configs.json');
        this.configs = {};
        this.ensureConfigDirectory();
        this.loadConfigs();
        console.log('UserConfigStore initialized with:', this.configs);
    }
    ensureConfigDirectory() {
        const dir = path_1.default.dirname(this.configPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    static getInstance() {
        if (!UserConfigStore.instance) {
            UserConfigStore.instance = new UserConfigStore();
        }
        return UserConfigStore.instance;
    }
    loadConfigs() {
        try {
            if (fs_1.default.existsSync(this.configPath)) {
                const data = fs_1.default.readFileSync(this.configPath, 'utf8');
                this.configs = JSON.parse(data);
            }
        }
        catch (error) {
            console.error('Error loading configs:', error);
            this.configs = {};
        }
    }
    saveConfigs() {
        try {
            fs_1.default.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
            console.log('Saved configs:', this.configs);
        }
        catch (error) {
            console.error('Error saving configs:', error);
        }
    }
    logSafeConfig(config) {
        if (!config)
            return undefined;
        return {
            githubRepo: config.githubRepo || '',
            githubToken: config.githubToken ? '[TOKEN HIDDEN]' : ''
        };
    }
    getConfig(discordId) {
        this.loadConfigs();
        const config = this.configs[discordId];
        console.log('Getting config for:', discordId, 'Config:', this.logSafeConfig(config));
        return config;
    }
    setConfig(discordId, updates) {
        var _a, _b, _c, _d;
        this.loadConfigs();
        const current = this.configs[discordId] || { githubToken: '', githubRepo: '' };
        this.configs[discordId] = {
            githubToken: (_b = (_a = updates.githubToken) !== null && _a !== void 0 ? _a : current.githubToken) !== null && _b !== void 0 ? _b : '',
            githubRepo: (_d = (_c = updates.githubRepo) !== null && _c !== void 0 ? _c : current.githubRepo) !== null && _d !== void 0 ? _d : ''
        };
        this.saveConfigs();
        console.log('Updated config for:', discordId, 'New config:', this.logSafeConfig(this.configs[discordId]));
    }
    updateToken(discordId, token) {
        const current = this.getConfig(discordId) || { githubRepo: '' };
        this.setConfig(discordId, Object.assign(Object.assign({}, current), { githubToken: token }));
    }
}
exports.userConfigStore = UserConfigStore.getInstance();
