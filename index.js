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

// Helper function to get flag emoji
function getFlagEmoji(regionCode) {
    if (!regionCode) return '';
    const codePoints = regionCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// Handle incoming messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const input = msg.text.trim(); // Trim whitespace

    try {
        // Parse the phone number
        const parsedNumber = phoneUtil.parseAndKeepRawInput(input);
        const isValid = phoneUtil.isValidNumber(parsedNumber);

        if (!isValid) {
            bot.sendMessage(chatId, "Invalid phone number. Please provide a valid phone number.");
            return;
        }

        // Get detailed information
        const regionCode = phoneUtil.getRegionCodeForNumber(parsedNumber);
        const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(regionCode);
        const countryCode = phoneUtil.getCountryCodeForRegion(regionCode);
        const flagEmoji = getFlagEmoji(regionCode);

        // Format the phone number for display
        const formattedNumber = phoneUtil.format(parsedNumber, phoneUtil.PhoneNumberFormat.INTERNATIONAL);

        // Build the response
        let response = `Phone number details:\n`;
        response += `${flagEmoji} Country: ${countryName}\n`;
        response += `📞 Region Code: ${regionCode}\n`;
        response += `🌐 Country Code: +${countryCode}\n`;
        response += `📱 Formatted Number: ${formattedNumber}`;

        // Send the result back to the user
        bot.sendMessage(chatId, response);
    } catch (error) {
        console.error("Error processing phone number:", error.message);
        bot.sendMessage(chatId, "An error occurred while processing the phone number. Please ensure the number is valid and includes the country code (e.g., +1 650 253 0000).");
    }
});
