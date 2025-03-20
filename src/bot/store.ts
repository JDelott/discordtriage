// Declare global storage
declare global {
    var tokenStorage: { [key: string]: string };
}

// Initialize global storage if it doesn't exist
if (!global.tokenStorage) {
    global.tokenStorage = {};
}

// Persistent storage for tokens
class TokenStore {
    private static instance: TokenStore;

    private constructor() {
        console.log('TokenStore initialized with tokens:', Object.keys(global.tokenStorage));
    }

    public static getInstance(): TokenStore {
        if (!TokenStore.instance) {
            TokenStore.instance = new TokenStore();
        }
        return TokenStore.instance;
    }

    public get(key: string): string | undefined {
        const token = global.tokenStorage[key];
        console.log('Getting token:', { 
            key, 
            exists: !!token,
            currentTokens: Object.keys(global.tokenStorage)
        });
        return token;
    }

    public set(key: string, value: string): void {
        console.log('Setting token:', { 
            key,
            currentTokens: Object.keys(global.tokenStorage)
        });
        global.tokenStorage[key] = value;
        console.log('Token stored, updated tokens:', Object.keys(global.tokenStorage));
    }

    public clear(): void {
        global.tokenStorage = {};
        console.log('Token store cleared');
    }
}

// Create a single instance that will be shared across imports
const tokenStore = TokenStore.getInstance();

export const store = {
    userTokens: tokenStore
};
