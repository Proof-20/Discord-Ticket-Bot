# Discord Ticket Bot

A Discord ticket bot built with **Node.js** and **discord.js v14**.

The bot is structured around command and event handlers, with slash commands loaded from the `src/commands` folder and client events loaded from the `src/events` folder.

## Features

- Discord slash command support
- Modular command handler
- Modular event handler
- Ticket transcript support using `discord-html-transcripts`
- Environment-based configuration with `.env`
- Development mode with `nodemon`

## Tech Stack

- Node.js
- discord.js v14
- @discordjs/rest
- discord-api-types
- dotenv
- chalk
- discord-html-transcripts
- nodemon

## Requirements

Before running the bot, make sure you have:

- Node.js installed
- A Discord bot application created in the Discord Developer Portal
- The bot invited to your server with the required permissions
- A `.env` file configured with your bot credentials

## Installation

Clone the repository:

```bash
git clone https://github.com/Proof-20/Discord-Ticket-Bot.git
cd Discord-Ticket-Bot
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root folder:

```env
token=YOUR_DISCORD_BOT_TOKEN
clientId=YOUR_DISCORD_CLIENT_ID
guildId=YOUR_DISCORD_SERVER_ID
```

## Running the Bot

Start the bot in development mode:

```bash
npm run dev
```

You can also run the main file directly:

```bash
node src/main.js
```

## How It Works

The bot starts from:

```txt
src/main.js
```

On startup, it:

1. Loads environment variables with `dotenv`.
2. Creates a Discord client using `Guilds` and `GuildMembers` intents.
3. Loads handler files from `src/functions`.
4. Registers slash commands using the command handler.
5. Registers client events using the event handler.
6. Logs in using the bot token from `.env`.

## Slash Commands

Slash commands are loaded from:

```txt
src/commands/
```

Each command should export a command object containing:

- `data`
- `execute`

Example structure:

```js
module.exports = {
  data: /* SlashCommandBuilder data */,
  async execute(interaction, client) {
    // command logic here
  }
};
```

## Events

Client events are loaded from:

```txt
src/events/client/
```

Each event should export:

```js
module.exports = {
  name: "eventName",
  once: false,
  async execute(...args) {
    // event logic here
  }
};
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the bot using nodemon |
| `node src/main.js` | Starts the bot directly |

## License

This project is licensed under the ISC License.

## Author

Created by **Proof**.
