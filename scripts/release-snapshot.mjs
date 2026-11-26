import { writeFile } from 'node:fs/promises';

const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GH_TOKEN;
if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? '') || !token) {
  throw new Error('GITHUB_REPOSITORY and GH_TOKEN are required');
}
const url = `https://api.github.com/repos/${repository}/releases/latest`;
const started = Date.now();
const response = await fetch(url, {
  headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
  signal: AbortSignal.timeout(10_000),
  redirect: 'error',
});
const release = response.ok ? await response.json() : null;
const snapshot = {
  checkedAt: new Date().toISOString(),
  elapsedMs: Date.now() - started,
  status: response.status,
  release: release && { tag: release.tag_name, publishedAt: release.published_at, url: release.html_url },
};
await writeFile('release-api.json', JSON.stringify(snapshot, null, 2) + '\n');
if (!response.ok && response.status !== 404) throw new Error(`Release API returned ${response.status}`);
