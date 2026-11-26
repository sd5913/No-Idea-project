import { mkdir, readFile, writeFile } from 'node:fs/promises';

const config = process.env.PLAYTEST_API_URL?.trim();
let api = '';
if (config) {
  const url = new URL(config);
  const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((!local && url.protocol !== 'https:') || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PLAYTEST_API_URL must be an HTTPS origin (HTTP is accepted for localhost)');
  }
  api = url.origin;
}

const root = new URL('../', import.meta.url);
const output = new URL('_site/', root);
const marker = '<meta name="playtest-api" content="">';
await mkdir(output, { recursive: true });
for (const [source, destination] of [
  ['Elemental_Journey_Integrated.html', 'index.html'],
  ['analytics/stats.html', 'stats.html'],
]) {
  const html = await readFile(new URL(source, root), 'utf8');
  if (!html.includes(marker)) throw new Error(`Missing playtest configuration in ${source}`);
  await writeFile(new URL(destination, output), html.replace(marker, () => `<meta name="playtest-api" content="${api}">`));
}
