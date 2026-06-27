const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');
c = c.replace(/\(req, res\) => \{/g, 'async (req, res) => {');
c = c.replace(/const db = readDb\(\);/g, 'const db = await readDb();');
c = c.replace(/writeDb\(db\);/g, 'await writeDb(db);');
c = c.replace(/async async/g, 'async');
fs.writeFileSync('server.ts', c);
