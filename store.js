import { Redis } from '@upstash/redis';

// Reads UPSTASH_REDIS_REST_URL / _TOKEN (or the older KV_REST_API_URL / _TOKEN),
// which Vercel adds automatically when you connect an Upstash Redis database.
export const redis = Redis.fromEnv();

export const PRED = 'gregio:predictions'; // hash: "<date>__<namekey>" -> {date,name,key,mins,at}
export const DAYS = 'gregio:days';        // hash: "<date>" -> {wakeMins,reportedBy,reportedAt}

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
export function nowET() {
  const p = {};
  fmt.formatToParts(new Date()).forEach(x => (p[x.type] = x.value));
  return { date: `${p.year}-${p.month}-${p.day}`, mins: +p.hour * 60 + +p.minute };
}

export const cleanName = n => String(n || '').trim().replace(/\s+/g, ' ').slice(0, 24);
export const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'anon';

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

export function validMins(m) {
  return Number.isInteger(m) && m >= 0 && m < 1440;
}
