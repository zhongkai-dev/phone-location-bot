import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/placeholder.svg?height=80&width=80"
            alt="Phone Locator Bot Logo"
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>
        <h1 className="text-3xl font-bold text-center mb-4">Phone Locator Telegram Bot</h1>
        <p className="text-gray-600 text-center mb-6">
          A Telegram bot that identifies the location of phone numbers in various formats.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Supported Formats:</h2>
          <ul className="space-y-1 text-gray-700">
            <li>• 14153771873</li>
            <li>• 4153771873</li>
            <li>• 1 415 377 1873</li>
            <li>• +1 415 377 1873</li>
            <li>• +14153771873</li>
            <li>• 415 377 1873</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Bot Response:</h2>
          <p className="text-gray-700">
            The bot will respond with the country, city, region, country code, and related flag emoji.
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="https://t.me/your_bot_username"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
            target="_blank"
          >
            Try the Bot on Telegram
          </Link>
        </div>
      </div>
    </main>
  )
}

