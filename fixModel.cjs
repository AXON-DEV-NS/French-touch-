const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');
c = c.replace(/gemini-3.5-flash/g, 'gemini-1.5-flash');
fs.writeFileSync('server.ts', c);
