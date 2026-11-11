import { redis, DAYS, nowET } from '../lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  await redis.hdel(DAYS, nowET().date);
  res.status(200).json({ ok: true });
}
