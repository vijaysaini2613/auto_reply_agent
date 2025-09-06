# WhatsApp Auto-Reply Agent

A robust, 24/7 WhatsApp agent that manages your presence and automatically replies to personal messages and calls when you are busy. Built with Node.js, Express, Baileys, and LowDB, this agent is designed for reliability, scalability, and ease of use.

## Features

1. **24/7 Operation**: Runs continuously with automatic error recovery and self-restart for uninterrupted service.
2. **Simultaneous Auto-Replies**: Handles auto-replies for up to 100+ contacts at once, ensuring prompt responses.
3. **Status Management**: Change your status (busy/free) via REST API or WhatsApp commands (multi-device supported).
4. **Human-like Rate-Limited Replies**: Sends professional, rate-limited auto-responses to avoid spamming contacts.
5. **Persistent Storage**: Uses LowDB for storing status, context, and rate-limit data.
6. **QR Code Authentication**: Easy WhatsApp pairing via QR code in terminal and web browser.
7. **Express API**: Endpoints for status monitoring and remote control.
8. **Group Safety**: Only replies to personal chats, never to groups.

## How It Works

- Set your status to busy or free using the API or by messaging your own WhatsApp account from a secondary device.
- When busy, the agent auto-replies to incoming personal messages and calls with a customizable template.
- Replies are rate-limited to once per contact every 30 minutes.
- Status and context are stored persistently for reliability.

## API Endpoints

- `GET /status` — View current status and context.
- `POST /set/free` — Set status to free (no auto-replies).
- `POST /set/busy` — Set status to busy. Pass `{ "context": "in meeting" }` in JSON body.
- `GET /qr` — View QR code for WhatsApp authentication.

## Setup & Deployment

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the agent:
   ```bash
   node agent.js
   # or use pm2 for persistent operation
   pm2 start agent.js --name whatsapp-agent
   ```
3. Scan the QR code with WhatsApp (Linked Devices > Link a Device).
4. Use the API or WhatsApp commands to control your status.

## Technologies Used

- Node.js
- Express
- Baileys (WhatsApp Web automation)
- LowDB
- pino (logging)

## Example Usage

- Set busy status:
  ```bash
  curl -X POST http://localhost:3000/set/busy -H "Content-Type: application/json" -d '{"context":"in meeting"}'
  ```
- Set free status:
  ```bash
  curl -X POST http://localhost:3000/set/free
  ```
- Check status:
  ```bash
  curl http://localhost:3000/status
  ```

## License

MIT
