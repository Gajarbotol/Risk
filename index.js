const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Telegram bot token
const token = '7124287824:AAGcZUblRJ9-YWCWwPXnJhwGrv7a6kwObDo';

// Bitly access token
const bitlyAccessToken = '67d495bfca8072ac65dfb98b52592ce431f27e22';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Create an Express app
const app = express();

// Set a port for the Express app
const port = 3000; // You can change this to any port number you want

// Function to add watermark to the message
function addWatermark(message) {
  return `${message}\n\nMADE BY @GAJARBOTOL`;
}

// Listen for /shorten command
bot.onText(/\/shorten (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const urlToShorten = match[1];

  try {
    // Shorten the URL using Bitly
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bitlyAccessToken}`
      },
      body: JSON.stringify({ long_url: urlToShorten })
    });

    const data = await response.json();
    const shortenedUrl = data.link;

    // Add watermark and send the shortened URL back to the user
    bot.sendMessage(chatId, addWatermark(shortenedUrl));
  } catch (error) {
    console.error('Error shortening URL:', error);
    bot.sendMessage(chatId, addWatermark('Sorry, something went wrong while shortening the URL.'));
  }
});

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, addWatermark('Welcome to URL Shortener Bot! Send me a URL and I will shorten it for you.'));
});

// Handle unknown commands
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, addWatermark('Sorry, I don\'t understand that command.'));
});

// Start the Express server
app.listen(port, () => {
  console.log(`Telegram bot is listening on port ${port}`);
});
