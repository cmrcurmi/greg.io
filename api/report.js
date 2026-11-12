import { redis, DAYS, nowET, cleanName, readBody, validMins } from '../lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { name: rawName, mins } = readBody(req);
  const name = cleanName(rawName);
  if (!name) return res.status(400).json({ error: 'Sign in with a name first.' });
  if (!validMins(mins)) return res.status(400).json({ error: 'Pick a valid time.' });

  const n = nowET();
  if (mins > n.mins) return res.status(400).json({ error: "That's in the future. He can't have woken up yet." });

  // hsetnx: only the first report of the day counts, even if two people press at once.
  const set = await redis.hsetnx(DAYS, n.date, { wakeMins: mins, reportedBy: name, reportedAt: Date.now() });
  res.status(200).json({ ok: true, first: !!set });
}
