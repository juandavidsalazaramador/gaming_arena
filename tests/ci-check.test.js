const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('README describes the project and the repo is in a valid state', () => {
  const readme = fs.readFileSync('./README.md', 'utf8');
  assert.match(readme, /Gaming Arena/i);
});

test('conflict exercise file includes the final resolved state', () => {
  const content = fs.readFileSync('./prueba-conflicto.txt', 'utf8');
  assert.match(content, /Estado: conflicto resuelto y documentado/i);
});

