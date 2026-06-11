/**
 * Wedding Invitation — RSVP API Server
 * Run: npm install && npm start
 * Then open: http://localhost:3000
 *
 * Production (Render): add Upstash Redis env vars so the counter survives deploys.
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.RSVP_DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json');
const RSVP_REDIS_KEY = 'wedding-rsvp:confirmations';

// EDIT: Change this secret before deploying (used to hash IPs)
const IP_SALT = process.env.RSVP_SALT || 'wedding-rsvp-change-me';

let redis = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const { Redis } = require('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

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

function readFileData() {
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

function writeFileData(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function getCount() {
  if (redis) {
    return await redis.scard(RSVP_REDIS_KEY);
  }
  return readFileData().confirmations.length;
}

async function isConfirmed(ipHash) {
  if (redis) {
    return Boolean(await redis.sismember(RSVP_REDIS_KEY, ipHash));
  }
  return readFileData().confirmations.includes(ipHash);
}

async function addConfirmation(ipHash) {
  if (redis) {
    const added = await redis.sadd(RSVP_REDIS_KEY, ipHash);
    return added === 1;
  }

  const data = readFileData();
  if (data.confirmations.includes(ipHash)) {
    return false;
  }
  data.confirmations.push(ipHash);
  writeFileData(data);
  return true;
}

async function buildResponse(req) {
  const ipHash = hashIp(getClientIp(req));
  const [count, confirmed] = await Promise.all([
    getCount(),
    isConfirmed(ipHash),
  ]);

  return { count, confirmed };
}

/* ─── RSVP API ─── */

app.get('/api/rsvp', async (req, res) => {
  try {
    res.json(await buildResponse(req));
  } catch (err) {
    console.error('RSVP GET error:', err);
    res.status(500).json({ error: 'server_error', message: 'تعذر تحميل العداد' });
  }
});

app.post('/api/rsvp', async (req, res) => {
  try {
    const ipHash = hashIp(getClientIp(req));
    const alreadyConfirmed = await isConfirmed(ipHash);

    if (alreadyConfirmed) {
      const count = await getCount();
      return res.status(409).json({
        error: 'already_confirmed',
        message: 'تم تأكيد حضورك مسبقاً',
        count,
        confirmed: true,
      });
    }

    const added = await addConfirmation(ipHash);
    const count = await getCount();

    if (!added) {
      return res.status(409).json({
        error: 'already_confirmed',
        message: 'تم تأكيد حضورك مسبقاً',
        count,
        confirmed: true,
      });
    }

    res.status(201).json({
      count,
      confirmed: true,
      message: 'شكراً! تم تأكيد حضورك',
    });
  } catch (err) {
    console.error('RSVP POST error:', err);
    res.status(500).json({ error: 'server_error', message: 'تعذر تأكيد الحضور' });
  }
});

/* ─── Start ─── */

const server = app.listen(PORT, () => {
  const storage = redis ? 'Upstash Redis (persistent)' : `local file (${DATA_FILE})`;
  console.log(`\n  ✦ Wedding invitation running at http://localhost:${PORT}`);
  console.log(`  ✦ RSVP storage: ${storage}\n`);
  if (!redis && process.env.RENDER) {
    console.warn('  ⚠ Render detected without Redis — RSVP count resets on every deploy.');
    console.warn('  → Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Render env.\n');
  }
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
