import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { BOT_CONFIG } from './config';
import { registerCommands, handleCommand } from './commands';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

client.once('ready', async () => {
  console.log('Bot is ready!');
  await registerCommands(client);
});

client.on('interactionCreate', handleCommand);

export function startBot() {
  console.log('Starting bot...');
  return client.login(BOT_CONFIG.token).catch(error => {
    console.error('Failed to start bot:', error);
  });
}
