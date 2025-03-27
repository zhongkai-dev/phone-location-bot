require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// Load environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
    console.error("Telegram bot token is missing. Please set TELEGRAM_BOT_TOKEN in .env file.");
    process.exit(1);
}

// Create a bot instance
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log("Bot is running...");

// Handle incoming messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const phoneNumber = msg.text;

    try {
        // Parse the phone number
        const parsedNumber = phoneUtil.parse(phoneNumber);
        const isValid = phoneUtil.isValidNumber(parsedNumber);

        if (!isValid) {
            bot.sendMessage(chatId, "Invalid phone number. Please provide a valid phone number.");
            return;
        }

        // Get the region code and country name
        const regionCode = phoneUtil.getRegionCodeForNumber(parsedNumber);
        const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(regionCode);

        // Send the result back to the user
        bot.sendMessage(chatId, `Phone number details:\nCountry: ${countryName}\nRegion Code: ${regionCode}`);
    } catch (error) {
        bot.sendMessage(chatId, "An error occurred while processing the phone number. Please try again.");
        console.error(error);
    }
});