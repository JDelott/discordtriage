"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
// Initialize global storage if it doesn't exist
if (!global.tokenStorage) {
    global.tokenStorage = {};
}
// Persistent storage for tokens
class TokenStore {
    constructor() {
        console.log('TokenStore initialized with tokens:', Object.keys(global.tokenStorage));
    }
    static getInstance() {
        if (!TokenStore.instance) {
            TokenStore.instance = new TokenStore();
        }
        return TokenStore.instance;
    }
    get(key) {
        const token = global.tokenStorage[key];
        console.log('Getting token:', {
            key,
            exists: !!token,
            currentTokens: Object.keys(global.tokenStorage)
        });
        return token;
    }
    set(key, value) {
        console.log('Setting token:', {
            key,
            currentTokens: Object.keys(global.tokenStorage)
        });
        global.tokenStorage[key] = value;
        console.log('Token stored, updated tokens:', Object.keys(global.tokenStorage));
    }
    clear() {
        global.tokenStorage = {};
        console.log('Token store cleared');
    }
}
// Create a single instance that will be shared across imports
const tokenStore = TokenStore.getInstance();
exports.store = {
    userTokens: tokenStore
};
