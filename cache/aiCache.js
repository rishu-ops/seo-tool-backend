import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = process.env.AI_CACHE_DIR || path.join(process.cwd(), 'cache', 'ai');
const TTL_SECONDS = Number(process.env.AI_CACHE_TTL_SECONDS || '86400'); // default 24 hours

async function ensureDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export function makeKey(...parts) {
  const h = crypto.createHash('sha256');
  h.update(parts.join('||'));
  return h.digest('hex');
}

export async function getCache(key) {
  try {
    await ensureDir();
    const p = path.join(CACHE_DIR, `${key}.json`);
    const raw = await fs.readFile(p, 'utf8');
    const obj = JSON.parse(raw);
    if (TTL_SECONDS > 0) {
      const age = (Date.now() - (obj.createdAt || 0)) / 1000;
      if (age > TTL_SECONDS) {
        // expired
        try { await fs.unlink(p); } catch {};
        return null;
      }
    }
    return obj.value;
  } catch (e) {
    return null;
  }
}

export async function setCache(key, value) {
  try {
    await ensureDir();
    const p = path.join(CACHE_DIR, `${key}.json`);
    const obj = { createdAt: Date.now(), value };
    await fs.writeFile(p, JSON.stringify(obj), 'utf8');
  } catch (e) {
    // ignore write errors
  }
}

export async function invalidateCache(key) {
  try {
    const p = path.join(CACHE_DIR, `${key}.json`);
    await fs.unlink(p);
  } catch (e) {
    // ignore
  }
}
