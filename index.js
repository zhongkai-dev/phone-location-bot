const TelegramBot = require('node-telegram-bot-api');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const axios = require('axios');
require('dotenv').config(); // Load environment variables

// Use environment variables for security
const TELEGRAM_BOT_TOKEN = '7669568107:AAHUEKKyvbuIdSzXOGpxHqlyFbXKnf_9ql8';
const VERIPHONE_API_KEY = '4C9FBDA3C44247929DBC907666F638BC';

if (!TELEGRAM_BOT_TOKEN || !VERIPHONE_API_KEY) {
    console.error("❌ Missing Telegram Bot Token or Veriphone API Key!");
    process.exit(1);
}

// Create the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Function to parse and format phone number details
async function getPhoneDetails(phoneNumberString) {
    try {
        console.log("Received phone number:", phoneNumberString);

        // Parse phone number
        let phoneNumber;
        if (phoneNumberString.startsWith('+')) {
            phoneNumber = phoneUtil.parse(phoneNumberString);
        } else {
            phoneNumber = phoneUtil.parse(phoneNumberString, 'US');
        }

        if (!phoneUtil.isValidNumber(phoneNumber)) {
            console.log("Invalid phone number:", phoneNumberString);
            return `📞⚫<b>Phone Number:</b> ${phoneNumberString}\n❌ Invalid phone number.`;
        }

        // Fetch details from Veriphone API
        try {
            const veriphoneResponse = await axios.get(
                `https://api.veriphone.io/v2/verify?phone=${encodeURIComponent(phoneNumberString)}&key=${VERIPHONE_API_KEY}`
            );

            const data = veriphoneResponse.data;

            if (data.status === "success" && data.phone_valid) {
                const country = data.country || "Unknown";
                const countryCode = data.country_code || "Unknown";
                const flagEmoji = String.fromCodePoint(...[...countryCode].map(c => 0x1F1E6 + c.toUpperCase().charCodeAt(0) - 65));

                return `
📞<b>Phone Number:</b> ${data.e164 || "N/A"}
✅<b>Status:</b> Success
🌍<b>Country:</b> ${country} ${flagEmoji}
📍<b>Region:</b> ${data.phone_region || "N/A"}`;
            } else {
                return `📞⚫<b>Phone Number:</b> ${phoneNumberString}\n❌ Phone number validation failed.`;
            }
        } catch (apiError) {
            if (apiError.response && apiError.response.status === 401) {
                console.error("Unauthorized access to Veriphone API. Check your API key.");
                return `📞⚫<b>Phone Number:</b> ${phoneNumberString}\n⚠️ Unauthorized access to Veriphone API. Please contact the bot administrator.`;
            } else {
                console.error("Error fetching details from Veriphone API:", apiError.message);
                return `📞⚫<b>Phone Number:</b> ${phoneNumberString}\n⚠️ Error fetching additional details. Please try again later.`;
            }
        }
    } catch (error) {
        console.error("Error parsing phone number:", error.message);
        return `📞⚫<b>Phone Number:</b> ${phoneNumberString}\n❌ Error parsing phone number. Please check the format.`;
    }
}

// Handle incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const inputText = msg.text.trim();

    console.log("Processing message:", inputText);

    if (inputText.startsWith('/')) {
        bot.sendMessage(chatId, "👋 Welcome! Please send one or more phone numbers (separated by line breaks) to locate.", { parse_mode: 'HTML' });
        return;
    }

    // Split the input text by line breaks to handle multiple phone numbers
    const phoneNumbers = inputText.split('\n').map(num => num.trim()).filter(num => num.length > 0);

    if (phoneNumbers.length === 0) {
        bot.sendMessage(chatId, "⚠️ No valid phone numbers found. Please send one or more phone numbers separated by line breaks.", { parse_mode: 'HTML' });
        return;
    }

    let responses = [];

    for (const phoneNumber of phoneNumbers) {
        const result = await getPhoneDetails(phoneNumber);
        responses.push(result);
    }

    // Combine all responses into a single message
    const fullResponse = responses.join("\n\n") + "\n<blockquote>🤖<b>Bot by <a href=\"https://t.me/ZhongKai_KL\">中凯</a></b></blockquote>";

    // Send the aggregated response back to the user
    bot.sendMessage(chatId, fullResponse, { parse_mode: 'HTML', disable_web_page_preview: true });
});

console.log("✅ Telegram bot is running...");
