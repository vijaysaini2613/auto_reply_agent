# Requirements for WhatsApp Auto-Reply Agent

## System Requirements
- Node.js v18 or higher (v20+ recommended)
- npm (Node Package Manager)
- WhatsApp account (personal or business)
- Internet connection

## Software Dependencies
- express
- @whiskeysockets/baileys
- lowdb
- qrcode-terminal
- pino

## Setup Requirements
- WhatsApp device pairing via QR code (Linked Devices > Link a Device)
- Persistent storage: `db.json` and `auth` folder in project directory
- Optional: pm2 for process management and auto-restart

## Usage Requirements
- REST API access for status control (`/status`, `/set/busy`, `/set/free`)
- WhatsApp multi-device support for status change via WhatsApp messages
