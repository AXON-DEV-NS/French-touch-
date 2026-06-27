const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

c = c.replace('startServer();', 'if (!process.env.VERCEL) {\n  startServer();\n}\n\nexport default app;');

fs.writeFileSync('server.ts', c);
