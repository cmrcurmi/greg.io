import { timingSafeEqual } from 'node:crypto';
import { redis, PRED, DAYS, readBody, validMins } from '../lib/store.js';

function passwordOk(given) {
  const real = process.env.ADMIN_PASSWORD || '';
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(real);
  return real.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

const isDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set in Vercel yet.' });
  const body = readBody(req);
  if (!passwordOk(body.password)) return res.status(401).json({ error: 'Wrong admin password.' });

  try {
    switch (body.action) {
      case 'ping':
        return res.status(200).json({ ok: true });

      case 'deletePrediction': {
        const id = String(body.id || '');
        if (!/^\d{4}-\d{2}-\d{2}__[a-z0-9-]+$/.test(id)) return res.status(400).json({ error: 'Bad prediction id.' });
        await redis.hdel(PRED, id);
        return res.status(200).json({ ok: true });
      }

      case 'deleteDay': {
        if (!isDate(body.date)) return res.status(400).json({ error: 'Bad date.' });
        await redis.hdel(DAYS, body.date);
        return res.status(200).json({ ok: true });
      }

      case 'setDay': {
        if (!isDate(body.date) || !validMins(body.mins)) return res.status(400).json({ error: 'Bad date or time.' });
        const cur = (await redis.hget(DAYS, body.date)) || {};
        await redis.hset(DAYS, { [body.date]: { reportedBy: 'admin', ...cur, wakeMins: body.mins, editedAt: Date.now() } });
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action.' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Database error. Try again.' });
  }
}
