const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_BOT_TOKEN' with your actual bot token from BotFather
const token = '7913707894:AAH_n-bzei2oTS7DH0ojPlg1gCLO4WwhOck';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Listen for any kind of message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Send the message "Je suis fatigué" to the chat
  bot.sendMessage(chatId, "Je suis fatigué");
});

console.log('Bot is running...');

