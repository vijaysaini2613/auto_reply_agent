import express from "express";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import qrcode from "qrcode-terminal";
import pino from "pino";

// --- Initialize DB ---
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { status: "free", context: "", lastNotified: {} });

await db.read();
if (!db.data) {
  db.data = { status: "free", context: "", lastNotified: {} };
  await db.write();
}

// --- WhatsApp Socket ---
async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
  });

  // Save creds
  sock.ev.on("creds.update", saveCreds);

  // --- Show QR in terminal + serve via /qr ---
  let currentQR = null;
  sock.ev.on("connection.update", (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr) {
      currentQR = qr;
      qrcode.generate(qr, { small: true });
      console.log("📲 Scan the QR above with WhatsApp > Linked Devices");
    }

    if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("❌ Connection closed. Reason:", reason);
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnecting...");
        startSock(); // auto-reconnect
      } else {
        console.log("⚠️ Logged out. Delete auth folder and restart.");
      }
    }
  });

  // --- State management ---
  function setBusy(text) {
    db.data.status = "busy";
    db.data.context = text.trim();
    db.data.updatedAt = Date.now();
    db.write();
  }

  function setFree() {
    db.data.status = "free";
    db.data.context = "";
    db.write();
  }

  function shouldNotify(jid) {
    const now = Date.now();
    const last = db.data.lastNotified[jid] || 0;
    if (now - last > 30 * 60 * 1000) {
      db.data.lastNotified[jid] = now;
      db.write();
      return true;
    }
    return false;
  }

  async function autoReply(jid) {
    if (db.data.status !== "busy") return;
    if (!shouldNotify(jid)) return;
    const ctx = db.data.context || "right now";
    const msg = `Sir is busy ${ctx}, he’ll call you back soon.`;
    await sock.sendMessage(jid, { text: msg });
  }

  // --- Listen to messages ---
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const m of messages) {
      const msg =
        m.message?.conversation || m.message?.extendedTextMessage?.text || "";
      const jid = m.key.remoteJid;

      // Only reply to personal chats (not groups)
      const isGroup = jid.endsWith("@g.us");
      const isMe = m.key.fromMe;

      if (isMe) {
        const lower = msg.toLowerCase();
        if (
          lower.startsWith("i'm ") ||
          lower.startsWith("im ") ||
          lower.startsWith("i am ") ||
          lower.startsWith("set ")
        ) {
          setBusy(msg.replace(/^i(\s*am|'?m)?\s*|^set\s*/i, ""));
          await sock.sendMessage(jid, {
            text: "Okay 👍 I'll auto-reply that you’re busy " + db.data.context,
          });
        } else if (lower.includes("free now") || lower.includes("available")) {
          setFree();
          await sock.sendMessage(jid, {
            text: "Got it ✅ You’re marked free. No auto-replies.",
          });
        }
      } else if (!isGroup) {
        // Only auto-reply to personal chats
        if (db.data.status === "busy") await autoReply(jid);
      }
      // Never auto-reply to groups
    }
  });

  // --- Listen to calls ---
  sock.ev.on("call", async (calls) => {
    for (const call of calls) {
      if (call.isVideo || call.status === "offer") {
        await autoReply(call.from);
      }
    }
  });

  // Return QR getter for API
  return { getQR: () => currentQR };
}

// --- Start WhatsApp Agent and Express API ---
const { getQR } = await startSock();

const app = express();
app.use(express.json());

app.get("/status", (_, res) => res.json(db.data));

app.post("/set/free", (_, res) => {
  db.data.status = "free";
  db.data.context = "";
  db.write();
  res.json({ ok: true });
});

app.post("/set/busy", (req, res) => {
  db.data.status = "busy";
  db.data.context = req.body.context || "right now";
  db.write();
  res.json({ ok: true });
});

// Serve QR as PNG
app.get("/qr", async (_, res) => {
  const qr = getQR();
  if (!qr) return res.status(404).send("No QR available");
  const QRCode = await import("qrcode");
  const png = await QRCode.default.toDataURL(qr);
  res.send(
    `<html><body><h2>📲 Scan QR with WhatsApp</h2><img src='${png}' /></body></html>`
  );
});

// --- Safe Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Agent running on :${PORT}`));
