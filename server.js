/**
 * Wedding Invitation — RSVP API Server
 * Run: npm install && npm start
 * Then open: http://localhost:3000
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json');

// EDIT: Change this secret before deploying (used to hash IPs)
const IP_SALT = process.env.RSVP_SALT || 'wedding-rsvp-change-me';

app.use(express.json());
app.use(express.static(__dirname));

/* ─── Helpers ─── */

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + IP_SALT).digest('hex');
}

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { confirmations: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return { confirmations: Array.isArray(data.confirmations) ? data.confirmations : [] };
  } catch {
    return { confirmations: [] };
  }
}

function writeData(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function buildResponse(req) {
  const data = readData();
  const ipHash = hashIp(getClientIp(req));
  const confirmed = data.confirmations.includes(ipHash);
  return {
    count: data.confirmations.length,
    confirmed,
  };
}

/* ─── RSVP API ─── */

// GET — fetch counter + whether this IP already confirmed
app.get('/api/rsvp', (req, res) => {
  res.json(buildResponse(req));
});

// POST — confirm attendance (once per IP)
app.post('/api/rsvp', (req, res) => {
  const data = readData();
  const ipHash = hashIp(getClientIp(req));

  if (data.confirmations.includes(ipHash)) {
    return res.status(409).json({
      error: 'already_confirmed',
      message: 'تم تأكيد حضورك مسبقاً',
      count: data.confirmations.length,
      confirmed: true,
    });
  }

  data.confirmations.push(ipHash);
  writeData(data);

  res.status(201).json({
    count: data.confirmations.length,
    confirmed: true,
    message: 'شكراً! تم تأكيد حضورك',
  });
});

/* ─── Start ─── */

const server = app.listen(PORT, () => {
  console.log(`\n  ✦ Wedding invitation running at http://localhost:${PORT}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n  ⚠ Port ${PORT} is already in use.`);
    console.log(`  → Open http://localhost:${PORT} (server may already be running)`);
    console.log(`  → Or stop it: lsof -ti :${PORT} | xargs kill -9\n`);
    process.exit(1);
  }
  throw err;
});
