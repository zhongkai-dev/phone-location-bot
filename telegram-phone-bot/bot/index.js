import TelegramBot from "node-telegram-bot-api"
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber"
import dotenv from "dotenv"
import countryFlagEmoji from "country-flag-emoji"
import cities from "cities.json"

// Load environment variables
dotenv.config()

// Initialize the phone number utility
const phoneUtil = PhoneNumberUtil.getInstance()

// Create a new bot instance
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })

// Function to get flag emoji from country code
function getFlagEmoji(countryCode) {
  try {
    const country = countryFlagEmoji.get(countryCode)
    return country ? country.emoji : ""
  } catch (error) {
    console.error("Error getting flag emoji:", error)
    return ""
  }
}

// Function to get city and region information based on country code
function getCityRegionInfo(countryCode) {
  try {
    // This is a simplified approach - in a production app, you would use
    // a more comprehensive database or API for accurate city/region data
    const countryCities = cities.filter((city) => city.country === countryCode)

    if (countryCities.length > 0) {
      // Just returning the first major city for simplicity
      // In a real app, you'd need to match based on area code
      const majorCity = countryCities.sort((a, b) => b.population - a.population)[0]
      return {
        city: majorCity.name,
        region: majorCity.subcountry || "Unknown",
      }
    }

    return { city: "Unknown", region: "Unknown" }
  } catch (error) {
    console.error("Error getting city/region info:", error)
    return { city: "Unknown", region: "Unknown" }
  }
}

// Handle incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id
  const messageText = msg.text

  // Check if the message contains a potential phone number
  if (!messageText) return

  try {
    // Clean up the input to handle various formats
    const phoneNumberText = messageText.trim()

    // Try to parse the phone number
    let phoneNumber
    let countryCode = ""

    // Try different parsing strategies
    try {
      // First try with the text as is
      phoneNumber = phoneUtil.parse(phoneNumberText)
      countryCode = phoneUtil.getRegionCodeForNumber(phoneNumber)
    } catch (e) {
      // If that fails, try adding a + if it might be missing
      if (!phoneNumberText.startsWith("+")) {
        try {
          phoneNumber = phoneUtil.parse(`+${phoneNumberText}`)
          countryCode = phoneUtil.getRegionCodeForNumber(phoneNumber)
        } catch (e2) {
          // If that fails too, try assuming it's a US number if it's 10 digits
          if (phoneNumberText.replace(/\D/g, "").length === 10) {
            try {
              phoneNumber = phoneUtil.parse(`+1${phoneNumberText.replace(/\D/g, "")}`)
              countryCode = "US" // Assume US for 10-digit numbers
            } catch (e3) {
              throw new Error("Could not parse phone number")
            }
          } else {
            throw new Error("Could not parse phone number")
          }
        }
      } else {
        throw new Error("Could not parse phone number")
      }
    }

    // If we successfully parsed the phone number
    if (phoneNumber && phoneUtil.isValidNumber(phoneNumber)) {
      // Get the country code (e.g., US, GB, etc.)
      countryCode = phoneUtil.getRegionCodeForNumber(phoneNumber) || "Unknown"

      // Get the country calling code (e.g., +1, +44, etc.)
      const countryCallingCode = `+${phoneNumber.getCountryCode()}`

      // Get the flag emoji
      const flagEmoji = getFlagEmoji(countryCode)

      // Get city and region info
      const { city, region } = getCityRegionInfo(countryCode)

      // Format the phone number in international format
      const formattedNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.INTERNATIONAL)

      // Create the response message
      const response = `
📱 *Phone Number Information* 📱

Number: ${formattedNumber}
Country: ${flagEmoji} ${countryCode}
Country Code: ${countryCallingCode}
City: ${city}
Region: ${region}

*Note*: City and region information is approximate and based on the country code.
      `

      // Send the response
      bot.sendMessage(chatId, response, { parse_mode: "Markdown" })
    } else {
      bot.sendMessage(
        chatId,
        "Sorry, I couldn't recognize a valid phone number in your message. Please try again with a different format.",
      )
    }
  } catch (error) {
    console.error("Error processing message:", error)
    bot.sendMessage(
      chatId,
      "Sorry, I couldn't recognize a valid phone number in your message. Please try again with a different format.",
    )
  }
})

console.log("Phone Locator Bot is running...")

// For Railway deployment - listen on the port provided by Railway
const PORT = process.env.PORT || 3000
import express from "express"
const app = express()

app.get("/", (req, res) => {
  res.send("Phone Locator Bot is running!")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

