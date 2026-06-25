import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// Persistent JSON Database path
const DB_FILE = path.join(process.cwd(), "database.json");

interface Visitor {
  email: string;
  name: string;
  picture?: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  authType: "google" | "sandbox" | "firebase-google";
  role: "Developer" | "Manager" | "Customer";
}

interface ManagerObj {
  email: string;
  name: string;
  addedAt: string;
  password?: string;
  lang?: string;
}

interface DbSchema {
  managers: ManagerObj[];
  visitors: Visitor[];
  pageViews?: number;
  categories?: { id: string; name: { ar: string; en: string; fr: string; it: string }; icon?: string }[];
  subscribers?: string[];
}

const DEFAULT_CATEGORIES = [
  { id: "appetizers", name: { ar: "مقبلات شهية", en: "Gourmet Appetizers", fr: "Entrées", it: "Antipasti" }, icon: "Soup" },
  { id: "mains", name: { ar: "أطباق رئيسية فاخرة", en: "Signature Mains", fr: "Plats", it: "Piatti" }, icon: "Utensils" },
  { id: "desserts", name: { ar: "حلويات فرنسية وإيطالية", en: "French & Italian Pastries", fr: "Desserts", it: "Dolci" }, icon: "Cake" },
  { id: "drinks", name: { ar: "مشروبات منعشة", en: "Refreshing Drinks", fr: "Boissons", it: "Bevande" }, icon: "GlassWater" }
];

// Read database helper
function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DbSchema = {
        managers: [], // Developer will add managers dynamically
        visitors: [],
        pageViews: 0,
        categories: DEFAULT_CATEGORIES,
        subscribers: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    let changed = false;

    if (parsed.pageViews === undefined) {
      parsed.pageViews = 0;
      changed = true;
    }
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
      changed = true;
    }
    if (!parsed.subscribers) {
      parsed.subscribers = [];
      changed = true;
    }
    if (parsed.managers) {
      parsed.managers = parsed.managers.map((m: any) => {
        if (typeof m === "string") {
          return {
            email: m.toLowerCase(),
            name: m.split("@")[0],
            addedAt: new Date().toISOString(),
            password: "123" // default fallback password
          };
        }
        return m;
      });
    } else {
      parsed.managers = [];
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (error) {
    console.error("Error reading database:", error);
    return { managers: [], visitors: [], pageViews: 0, categories: DEFAULT_CATEGORIES, subscribers: [] };
  }
}

// Write database helper
function writeDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Google OAuth URL Request
app.get("/api/auth/google/url", (req, res) => {
  const redirectUri = req.query.redirect_uri as string;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.json({ url: "", missingConfig: true });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    prompt: "select_account"
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, missingConfig: false });
});

// 2. Google OAuth Callback Route
app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    // Reconstruct exact redirect URI for token exchange
    // Note: The callback endpoint must receive the same redirect_uri as passed to google authorization.
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const redirectUri = `${protocol}://${host}/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error("Token exchange failed:", tokens);
      return res.status(500).send(`Token exchange failed: ${JSON.stringify(tokens)}`);
    }

    // Fetch user profile from google userinfo API
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const profile = await profileResponse.json();

    if (!profile.email) {
      return res.status(400).send("Could not retrieve email from Google Profile");
    }

    const email = profile.email.toLowerCase();
    const name = profile.name || profile.given_name || email.split("@")[0];
    const picture = profile.picture || "";

    // Determine Role
    let role: "Developer" | "Manager" | "Customer" = "Customer";
    let managerLang: string | undefined = undefined;
    if (email === "oren.on.oren.25@gmail.com") {
      role = "Developer";
    } else {
      const db = readDb();
      const manager = db.managers.find(m => m.email.toLowerCase() === email);
      if (manager) {
        role = "Manager";
        managerLang = manager.lang || "ar";
      }
    }

    // Log the visitor
    const db = readDb();
    const newVisitor: Visitor = {
      email,
      name,
      picture,
      timestamp: new Date().toISOString(),
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Unknown",
      authType: "google",
      role
    };
    db.visitors.unshift(newVisitor);
    writeDb(db);

    // Send successful popup payload to close popup and postMessage back to parent window
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Authentication Success</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f8fafc;">
          <h2 style="color: #1e3a8a;">⚜️ Connexion réussie!</h2>
          <p style="color: #475569;">Authentification avec Google effectuée avec succès.</p>
          <p style="color: #94a3b8; font-size: 12px;">This window will close automatically...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: "GOOGLE_AUTH_SUCCESS",
                user: {
                  email: ${JSON.stringify(email)},
                  name: ${JSON.stringify(name)},
                  picture: ${JSON.stringify(picture)},
                  role: ${JSON.stringify(role)},
                  lang: ${JSON.stringify(managerLang)}
                },
                idToken: ${JSON.stringify(tokens.id_token || null)}
              }, "*");
              window.close();
            } else {
              window.location.href = "/";
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    res.status(500).send(`Authentication failed: ${error.message || error}`);
  }
});

// 3. Sandbox Login Route (For local development & instant testing)
app.post("/api/auth/sandbox", (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || cleanEmail.split("@")[0];

  // Determine Role
  let role: "Developer" | "Manager" | "Customer" = "Customer";
  let managerLang: string | undefined = undefined;
  if (cleanEmail === "oren.on.oren.25@gmail.com") {
    role = "Developer";
  } else {
    const db = readDb();
    const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
    if (manager) {
      role = "Manager";
      managerLang = manager.lang || "ar";
    }
  }

  // Log visitor
  const db = readDb();
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: cleanName,
    picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Sandbox Sandbox",
    authType: "sandbox",
    role
  };
  db.visitors.unshift(newVisitor);
  writeDb(db);

  res.json({
    email: cleanEmail,
    name: cleanName,
    picture: newVisitor.picture,
    role,
    lang: managerLang
  });
});

// 3.5 Firebase Auth Login Route
app.post("/api/auth/firebase-login", (req, res) => {
  const { email, name, picture } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || cleanEmail.split("@")[0];

  // Determine Role
  let role: "Developer" | "Manager" | "Customer" = "Customer";
  let managerLang: string | undefined = undefined;
  if (cleanEmail === "oren.on.oren.25@gmail.com") {
    role = "Developer";
  } else {
    const db = readDb();
    const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
    if (manager) {
      role = "Manager";
      managerLang = manager.lang || "ar";
    }
  }

  // Log visitor
  const db = readDb();
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: cleanName,
    picture: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Firebase-Google Auth Client",
    authType: "firebase-google",
    role
  };
  db.visitors.unshift(newVisitor);
  writeDb(db);

  res.json({
    email: cleanEmail,
    name: cleanName,
    picture: newVisitor.picture,
    role,
    lang: managerLang
  });
});

// 4. Managers Endpoints
app.get("/api/managers", (req, res) => {
  const db = readDb();
  res.json(db.managers);
});

app.post("/api/managers", (req, res) => {
  const { email, name, password, lang } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name?.trim() || cleanEmail.split("@")[0];
  const cleanPassword = password?.trim() || "123";
  const cleanLang = lang || "ar";
  const db = readDb();

  if (db.managers.some(m => m.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: "Email is already authorized as a manager" });
  }

  const newManager = {
    email: cleanEmail,
    name: cleanName,
    password: cleanPassword,
    lang: cleanLang,
    addedAt: new Date().toISOString()
  };

  db.managers.push(newManager);
  writeDb(db);
  res.json({ success: true, managers: db.managers });
});

app.delete("/api/managers/:email", (req, res) => {
  const emailToRemove = req.params.email.trim().toLowerCase();
  const db = readDb();

  db.managers = db.managers.filter(m => m.email.toLowerCase() !== emailToRemove);
  writeDb(db);
  res.json({ success: true, managers: db.managers });
});

// 4.5 Manager Password Login Gate
app.post("/api/auth/manager-login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const db = readDb();

  const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
  if (!manager) {
    return res.status(401).json({ error: "هذا البريد الإلكتروني غير مسجل كمدير في النظام." });
  }

  if (manager.password !== cleanPassword) {
    return res.status(401).json({ error: "كلمة المرور غير صحيحة، يرجى مراجعة المطور." });
  }

  // Log as visitor
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: manager.name,
    picture: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanEmail}`,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "French Touch Secure Gate",
    authType: "sandbox",
    role: "Manager"
  };
  db.visitors.unshift(newVisitor);
  writeDb(db);

  res.json({
    success: true,
    user: {
      email: cleanEmail,
      name: manager.name,
      role: "Manager",
      picture: newVisitor.picture,
      lang: manager.lang || "ar"
    }
  });
});

// 4.6 Newsletter & Gmail Subscribers API
app.post("/api/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();
  if (!db.subscribers) db.subscribers = [];
  if (!db.subscribers.includes(cleanEmail)) {
    db.subscribers.push(cleanEmail);
    writeDb(db);
  }
  res.json({ success: true, subscribers: db.subscribers });
});

app.get("/api/subscribers", (req, res) => {
  const db = readDb();
  res.json(db.subscribers || []);
});

app.post("/api/send-newsletter", (req, res) => {
  const { subject, body } = req.body;
  const db = readDb();
  const subs = db.subscribers || [];
  
  console.log(`[SIMULATION] Dispatching newsletter to ${subs.length} emails:`);
  subs.forEach(email => {
    console.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${subject}`);
  });
  
  res.json({ success: true, count: subs.length, subscribers: subs });
});

// 5. Visitors logs (accessible to Developer only)
app.get("/api/visitors", (req, res) => {
  const db = readDb();
  res.json(db.visitors);
});

app.delete("/api/visitors", (req, res) => {
  const db = readDb();
  db.visitors = [];
  writeDb(db);
  res.json({ success: true, visitors: [] });
});

// 6. Page Views Count API
app.get("/api/pageviews", (req, res) => {
  const db = readDb();
  res.json({ count: db.pageViews || 0 });
});

app.post("/api/pageviews/increment", (req, res) => {
  const db = readDb();
  db.pageViews = (db.pageViews || 0) + 1;
  writeDb(db);
  res.json({ count: db.pageViews });
});

// 7. Dynamic Sections/Categories API
app.get("/api/categories", (req, res) => {
  const db = readDb();
  res.json(db.categories || DEFAULT_CATEGORIES);
});

app.post("/api/categories", (req, res) => {
  const { id, name, icon } = req.body;
  if (!id || !name || !name.ar || !name.en || !name.fr || !name.it) {
    return res.status(400).json({ error: "id and names in all 4 languages are required." });
  }

  const db = readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  // Check duplicate
  if (db.categories.some(c => c.id.toLowerCase() === id.toLowerCase())) {
    return res.status(400).json({ error: "Section ID already exists" });
  }

  db.categories.push({ id, name, icon: icon || "Utensils" });
  writeDb(db);
  res.json({ success: true, categories: db.categories });
});

app.delete("/api/categories/:id", (req, res) => {
  const categoryId = req.params.id;
  const db = readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  db.categories = db.categories.filter(c => c.id !== categoryId);
  writeDb(db);
  res.json({ success: true, categories: db.categories });
});

// ----------------------------------------------------
// VITE AND ASSETS SERVING MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Load Vite in Middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK ENGINE] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
