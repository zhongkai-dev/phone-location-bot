# Phone Locator Telegram Bot

A Telegram bot that identifies the location of phone numbers in various formats.

## Features

- Supports multiple phone number formats:
  - 14153771873
  - 4153771873
  - 1 415 377 1873
  - +1 415 377 1873
  - +14153771873
  - 415 377 1873
- Provides information about:
  - Country with flag emoji
  - City (approximate)
  - Region (approximate)
  - Country code

## Technologies Used

- Node.js
- Google's libphonenumber library
- Telegram Bot API
- Express.js (for Railway deployment)
- Next.js (for landing page)

## Setup and Deployment

### Prerequisites

- Node.js 18 or higher
- A Telegram bot token (get from BotFather)

### Local Development

1. Clone the repository
2. Create a `.env` file based on `.env.example` and add your Telegram bot token
3. Install dependencies:

