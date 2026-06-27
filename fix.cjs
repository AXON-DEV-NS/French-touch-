const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const newDbPart = lines.slice(0, 212); // Lines 0 to 211
const restPart = lines.slice(457);     // Lines 457 to end

const fixed = newDbPart.join('\n') + '\n' + restPart.join('\n');
fs.writeFileSync('server.ts', fixed);
