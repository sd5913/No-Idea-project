import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const schema = readFileSync(new URL('../../analytics/migrations/0001_playtest.sql', import.meta.url), 'utf8');

export function createPlaytestDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(schema);
  const db = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        bind(...args) {
          return {
            async run() { return statement.run(...args); },
            async all() { return { results: statement.all(...args) }; },
          };
        },
      };
    },
    async batch(statements) {
      const results = [];
      for (const statement of statements) results.push(await statement.all());
      return results;
    },
  };
  return { sqlite, db };
}
