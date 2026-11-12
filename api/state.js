import { redis, PRED, DAYS, nowET } from '../lib/store.js';

export default async function handler(req, res) {
  try {
    const [p, d] = await Promise.all([redis.hgetall(PRED), redis.hgetall(DAYS)]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      now: nowET(),
      predictions: Object.values(p || {}),
      days: d || {},
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not reach the database.' });
  }
}
