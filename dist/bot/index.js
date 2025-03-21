"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBot = startBot;
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const commands_1 = require("./commands");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages,
    ]
});
let isReady = false;
client.once(discord_js_1.Events.ClientReady, async () => {
    console.log('Bot is ready!');
    try {
        await (0, commands_1.registerCommands)(client);
        console.log('Commands registered successfully');
        isReady = true;
    }
    catch (error) {
        console.error('Error registering commands:', error);
    }
});
client.on(discord_js_1.Events.InteractionCreate, commands_1.handleCommand);
async function startBot() {
    if (isReady) {
        console.log('Bot is already running');
        return;
    }
    try {
        await client.login(config_1.BOT_CONFIG.token);
        console.log('Bot started successfully');
    }
    catch (error) {
        console.error('Failed to start bot:', error);
        throw error;
    }
}
