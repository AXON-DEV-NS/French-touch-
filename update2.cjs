const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

c = c.replace(/function readDb\(\): DbSchema \{/g, 'async function readDb(): Promise<DbSchema> {');
c = c.replace(/function writeDb\(data: DbSchema\) \{/g, 'async function writeDb(data: DbSchema) {');

// Add @vercel/kv import
if (!c.includes('@vercel/kv')) {
  c = c.replace('import fs from "fs";', 'import fs from "fs";\nimport { kv } from "@vercel/kv";');
}

// Rewrite readDb body
const readDbStart = c.indexOf('async function readDb()');
const writeDbStart = c.indexOf('async function writeDb(');
const writeDbEnd = c.indexOf('// --- Authentication & Access Control ---');

const newReadDb = `async function readDb(): Promise<DbSchema> {
  const initialDb: DbSchema = {
    managers: [],
    visitors: [],
    pageViews: 0,
    categories: DEFAULT_CATEGORIES,
    subscribers: [],
    registeredCustomers: [],
    emailLogs: [],
    blockedCustomers: [],
    orderCounter: 0,
    reviews: []
  };
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const data = await kv.get<DbSchema>("frenchtouch_db");
      if (data) {
        // ensure missing properties
        if (data.orderCounter === undefined) data.orderCounter = 0;
        if (data.pageViews === undefined) data.pageViews = 0;
        if (data.blockedCustomers === undefined) data.blockedCustomers = [];
        if (data.reviews === undefined) data.reviews = [];
        return data;
      }
      return initialDb;
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    
    if (parsed.orderCounter === undefined) parsed.orderCounter = 0;
    if (parsed.pageViews === undefined) parsed.pageViews = 0;
    if (parsed.blockedCustomers === undefined) parsed.blockedCustomers = [];
    if (parsed.reviews === undefined) parsed.reviews = [];
    
    return parsed;
  } catch (error) {
    console.error("Error reading database:", error);
    return initialDb;
  }
}

async function writeDb(data: DbSchema) {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set("frenchtouch_db", data);
      return;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}
`;

c = c.substring(0, readDbStart) + newReadDb + c.substring(writeDbEnd);

fs.writeFileSync('server.ts', c);
