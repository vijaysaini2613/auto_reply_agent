# WhatsApp Agent Deployment Guide

This guide will help you deploy your WhatsApp agent on a server and connect it to your WhatsApp account.

## 1. Prerequisites

- Node.js (v18+ recommended)
- A server (VPS, cloud VM, or local machine)
- WhatsApp account (personal or business)

## 2. Install Dependencies

```
npm install
```

## 3. Start the Agent

```
npm start
```

- On first run, you will see a QR code in the terminal.
- Open WhatsApp on your phone > Linked Devices > Link a Device > Scan the QR code.
- The agent will connect and start auto-replying as per your status.

## 4. API Endpoints

- `GET /status` — View current status/context.
- `POST /set/free` — Set status to free (no auto-replies).
- `POST /set/busy` — Set status to busy. Pass `{ "context": "in meeting" }` in JSON body.

## 5. Persistent Data

- State is stored in `db.json` (status, context, lastNotified).
- WhatsApp auth is stored in `auth/` folder.

## 6. Deployment Tips

- Run with a process manager (e.g., pm2) for reliability:
  ```
  npm install -g pm2
  pm2 start agent.js --name whatsapp-agent
  ```
- Open port 3000 on your server firewall if you want to access the API remotely.
- For production, use HTTPS and secure your API endpoints.

## 7. Troubleshooting

- If QR code expires, delete the `auth/` folder and restart the agent.
- Check logs for errors.

## 8. Customization

- Edit message templates in `agent.js` as needed.
- Add blocklist/allowlist logic for contacts if desired.

---

**Your agent is ready for deployment!**
