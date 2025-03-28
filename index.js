const TelegramBot = require('node-telegram-bot-api');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// Replace with your Telegram Bot Token
const TELEGRAM_BOT_TOKEN = '8183902658:AAGaAqxYsm6N5PfQWhrgcyLA3gN1_MKrbjs';

// Initialize the Telegram Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Function to get flag emoji based on country code
function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// Function to parse phone number and return location details
function getLocation(phoneNumber) {
    try {
        // Check if the phone number starts with a '+' to determine the presence of a country code
        const defaultRegion = phoneNumber.startsWith('+') ? undefined : 'US';
        const parsedNumber = phoneUtil.parse(phoneNumber, defaultRegion);

        if (!phoneUtil.isValidNumber(parsedNumber)) {
            return 'Invalid phone number. Please ensure the number is valid and includes the country code (e.g., +1).';
        }

        const country = phoneUtil.getRegionCodeForNumber(parsedNumber);
        const countryCode = phoneUtil.getCountryCodeForRegion(country);
        const nationalNumber = phoneUtil.format(parsedNumber, phoneUtil.PhoneNumberFormat.NATIONAL);
        const internationalNumber = phoneUtil.format(parsedNumber, phoneUtil.PhoneNumberFormat.INTERNATIONAL);

        // Get flag emoji
        const flagEmoji = getFlagEmoji(country);

        // Return formatted response
        return `
${flagEmoji} Country: ${country}
📞 Country Code: +${countryCode}
📱 National Number: ${nationalNumber}
🌐 International Number: ${internationalNumber}
        `;
    } catch (error) {
        console.error('Error parsing phone number:', error.message);
        return 'An error occurred while processing the phone number. Please ensure the number is valid and includes the country code (e.g., +1 650 253 0000).';
    }
}

// Listen for messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const phoneNumber = msg.text;

    // Ignore commands like /start
    if (phoneNumber.startsWith('/')) {
        bot.sendMessage(chatId, 'Welcome to the Phone Locator Bot! Send a phone number to get its location details.');
        return;
    }

    // Get location details
    const response = getLocation(phoneNumber);

    // Send response back to user
    bot.sendMessage(chatId, response);
});

console.log('Bot is running...');