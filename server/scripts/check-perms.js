// scripts/check-perms.js
import fs from 'fs';
import path from 'path';
import { PERMISSIONS } from '../server/config/permissions.js';

const routesDir = path.resolve('server/routes');
const roles = Object.keys(PERMISSIONS);
const known = new Set(roles.flatMap(r => PERMISSIONS[r]));

const requires = new Set();
for (const file of fs.readdirSync(routesDir)) {
  if (!file.endsWith('.js')) continue;
  const text = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const rx = /requirePermission\\(([^)]+)\\)/g;
  for (const m of text.matchAll(rx)) {
    const raw = m[1];
    const items = raw.includes('[') ? JSON.parse(raw.replace(/(['"])?([a-zA-Z0-9:*.-]+)(['"])?/g, '"$2"')) : [raw.replace(/['"`]/g, '')];
    items.forEach(p => requires.add(p));
  }
}

const missing = [...requires].filter(p => ![...known].some(k => k === p || k === '*' || (k.endsWith(':*') && p.startsWith(k.split(':')[0] + ':'))));
if (missing.length) {
  console.error('Permisos faltantes en PERMISSIONS:', missing);
  process.exit(1);
} else {
  console.log('✓ Permissions match routes');
}
