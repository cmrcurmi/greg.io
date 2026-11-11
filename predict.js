import { redis, PRED, DAYS, nowET, cleanName, slug, readBody, validMins } from '../lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { name: rawName, mins } = readBody(req);
  const name = cleanName(rawName);
  if (!name) return res.status(400).json({ error: 'Sign in with a name first.' });
  if (!validMins(mins)) return res.status(400).json({ error: 'Pick a valid time.' });

  const n = nowET();
  if (await redis.hexists(DAYS, n.date)) return res.status(409).json({ error: 'Too late. Greg is already up.' });
  if (mins <= n.mins) return res.status(400).json({ error: 'That time has already passed.' });

  const key = slug(name);
  await redis.hset(PRED, { [`${n.date}__${key}`]: { date: n.date, name, key, mins, at: Date.now() } });
  res.status(200).json({ ok: true });
}
