# Telegram Bot

This is a simple Telegram bot built with Node.js using the [node-telegram-bot-api](https://github.com/neko01t/node-telegram-bot-api) library. The bot provides various fun features, including sending images, GIFs, and cat facts.

## Features

- **Start Command**: Welcomes users and provides information about the bot.
- **Photo Command**: Sends a random waifu image.
- **GIF Command**: Sends a predefined GIF.
- **Sticker Command**: Sends a specific sticker.
- **Cat Fact Command**: Provides random cat facts.
- **Email Check Command**: Checks Gmail username availability.

## Getting Started

### Prerequisites

- Node.js (version 12 or higher)
- npm (Node Package Manager)
- A Telegram bot token from [BotFather](https://core.telegram.org/bots#botfather)

### Installation

#### 1. Clone the repository:
```git clone https://github.com/neko01t/telegram-bot```

#### 2 Navigate to the project directory:
```
cd your-repo-name
```

#### 3 Install the dependencies:
```
npm install
```

#### 4 Create a .env file in the root directory and add your bot token:
```
TOKEN=your-telegram-bot-token
```

### Running the Bot
To start the bot, run:

```
node index.js
```

### Commands

 - `/start`: Welcome message and bot info.
 - `/photo`: Send a random waifu image.
 - `/gif`: Send a predefined GIF.
 - `/sticker`: Send a specific sticker.
 - `/catfact`: Get a random cat fact.
 - `/emailcheck`: Check the availability of a Gmail username.

### Contributing
If you would like to contribute to this project, feel free to open an issue or submit a pull request.

### License
This project is licensed under the MIT License.


