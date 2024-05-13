const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const express = require('express');

// Telegram bot token - Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = '7124287824:AAGcZUblRJ9-YWCWwPXnJhwGrv7a6kwObDo';

// Bitly access token - Replace 'YOUR_BITLY_ACCESS_TOKEN' with your actual access token
const bitlyAccessToken = '67d495bfca8072ac65dfb98b52592ce431f27e22';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Create an Express app
const app = express();

// Set the port for the Express app
const PORT = process.env.PORT || 3000; // Use process.env.PORT if available, otherwise use port 3000

// Middleware to parse JSON bodies
app.use(express.json());

// Route for /webhook endpoint
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Function to add watermark to the message
function addWatermark(message) {
  return `${message}\n\nMADE BY @GAJARBOTOL`;
}

// Function to shorten URL
function shortenUrl(urlToShorten, bitlyAccessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: 'api-ssl.bitly.com',
      path: '/v4/shorten',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bitlyAccessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.link) {
          resolve(response.link);
        } else {
          reject('Error shortening URL');
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error shortening URL:', error);
      reject('Error shortening URL');
    });

    req.write(JSON.stringify({ long_url: urlToShorten }));
    req.end();
  });
}

// Listen for /shorten command
bot.onText(/\/shorten (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const urlToShorten = match[1];

  try {
    // Shorten the URL
    const shortenedUrl = await shortenUrl(urlToShorten, bitlyAccessToken);

    // Add watermark and send the shortened URL back to the user
    bot.sendMessage(chatId, addWatermark(shortenedUrl));
  } catch (error) {
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
