import express from "express";
import path from "path";
import fs from "fs";
import { kv } from "@vercel/kv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { sendEmailOtp, sendPhoneOtp } from "./server/sendOtpService";

const app = express();
const PORT = 3000;

// OTP memory storage
const pendingVerifications = new Map<string, {
  customerPayload: any;
  emailOtp: string;
  expiresAt: number;
}>();

// Lazy initialization of GoogleGenAI to prevent startup crashes when GEMINI_API_KEY is missing
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Body parsing middleware (increased limit to support base64 device image uploads)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

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

interface RegisteredCustomer {
  firstName: string;
  secondName: string;
  thirdName: string;
  phone: string;
  alternativePhone: string;
  email: string;
  picture: string; // base64 or URL
  registeredAt: string;
  blockReason?: string;
  warningMessage?: string;
  aiAnalysis?: {
    culinaryMood: string;
    personalityAnalysis: string;
    recommendedDish: string;
  };
}

interface EmailLogObj {
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "DELIVERED";
}

interface Product {
  id: string;
  name: { ar: string; en: string; fr: string; it: string };
  description: { ar: string; en: string; fr: string; it: string };
  price: number;
  category: string;
  image: string;
  canHaveAddons?: boolean;
  canHaveSauces?: boolean;
}

interface ExclusiveOffer {
  id: string;
  title: { ar: string; en: string; fr: string; it: string };
  description: { ar: string; en: string; fr: string; it: string };
  discount: string;
  endTime: string;
  image: string;
  active: boolean;
}

interface WeeklyOffer {
  dayOfWeek: number;
  title: { ar: string; en: string; fr: string; it: string };
  description: { ar: string; en: string; fr: string; it: string };
  discount: string;
  active: boolean;
}

interface ReviewReply {
  id: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  role: "Customer" | "Manager" | "Developer";
  text: string;
  createdAt: string;
}

interface RestaurantReview {
  id: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  role: "Customer" | "Manager" | "Developer";
  rating: number;
  comment: string;
  createdAt: string;
  replies: ReviewReply[];
}

interface DbSchema {
  managers: ManagerObj[];
  visitors: Visitor[];
  pageViews?: number;
  categories?: { id: string; name: { ar: string; en: string; fr: string; it: string }; icon?: string }[];
  subscribers?: string[];
  registeredCustomers?: RegisteredCustomer[];
  emailLogs?: EmailLogObj[];
  blockedCustomers?: RegisteredCustomer[];
  orderCounter?: number;
  products?: Product[];
  exclusiveOffer?: ExclusiveOffer;
  weeklyOffers?: WeeklyOffer[];
  reviews?: RestaurantReview[];
}

const DEFAULT_CATEGORIES = [
  { id: "sandwiches", name: { ar: "السندوتشات الفاخرة", en: "Gourmet Sandwiches", fr: "Sandwiches Fins", it: "Panini Gourmet" }, icon: "ChefHat" },
  { id: "fries", name: { ar: "بطاطس فرنش تاتش", en: "French Touch Fries", fr: "Frites Croustillantes", it: "Patatine Croccanti" }, icon: "Sparkles" },
  { id: "desserts", name: { ar: "الحلويات اللذيذة", en: "Delicious Desserts", fr: "Desserts Fins", it: "Dolci Deliziosi" }, icon: "Cake" },
  { id: "drinks", name: { ar: "المشروبات المنعشة", en: "Refreshing Drinks", fr: "Boissons", it: "Bevande" }, icon: "GlassWater" }
];

// Read database helper
async function readDb(): Promise<DbSchema> {
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
        return { ...initialDb, ...data };
      }
      return initialDb;
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    
    return { ...initialDb, ...parsed };
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
// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Security Middlewares for Role Separation with Camouflage (404 Not Found instead of 403)
function requireDeveloper(req: express.Request, res: express.Response, next: express.NextFunction) {
  const email = (req.headers["x-user-email"] as string || "").trim().toLowerCase();
  const role = (req.headers["x-user-role"] as string || "").trim();
  
  if (email === "oren.on.oren.25@gmail.com" || role === "Developer") {
    return next();
  }
  
  // Camouflage security: Return standard 404 to hide the endpoint's existence
  return res.status(404).send("Not Found");
}

function requireManagerOrDeveloper(req: express.Request, res: express.Response, next: express.NextFunction) {
  const email = (req.headers["x-user-email"] as string || "").trim().toLowerCase();
  const role = (req.headers["x-user-role"] as string || "").trim();
  
  if (email === "oren.on.oren.25@gmail.com" || role === "Developer" || role === "Manager") {
    return next();
  }
  
  // Camouflage security: Return standard 404 to hide the endpoint's existence
  return res.status(404).send("Not Found");
}

// Block and camouflage traditional /login and /admin pathways
app.use((req, res, next) => {
  const p = req.path.toLowerCase().replace(/\/$/, "");
  if (p === "/admin" || p === "/login") {
    return res.status(404).send("Not Found");
  }
  next();
});

// 1. Google OAuth URL Request
app.get("/api/auth/google/url", async (req, res) => {
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
      const db = await readDb();
      const manager = db.managers.find(m => m.email.toLowerCase() === email);
      if (manager) {
        role = "Manager";
        managerLang = manager.lang || "ar";
      }
    }

    // Log the visitor
    const db = await readDb();
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
    await writeDb(db);

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
app.post("/api/auth/sandbox", async (req, res) => {
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
    const db = await readDb();
    const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
    if (manager) {
      role = "Manager";
      managerLang = manager.lang || "ar";
    }
  }

  // Log visitor
  const db = await readDb();
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
  await writeDb(db);

  const registeredCustomer = db.registeredCustomers?.find(c => c.email.toLowerCase() === cleanEmail);

  res.json({
    email: cleanEmail,
    name: registeredCustomer ? `${registeredCustomer.firstName} ${registeredCustomer.secondName}` : cleanName,
    picture: registeredCustomer?.picture || newVisitor.picture,
    role,
    lang: managerLang,
    details: registeredCustomer || undefined
  });
});

// 3.5 Firebase Auth Login Route
app.post("/api/auth/firebase-login", async (req, res) => {
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
    const db = await readDb();
    const manager = db.managers.find(m => m.email.toLowerCase() === cleanEmail);
    if (manager) {
      role = "Manager";
      managerLang = manager.lang || "ar";
    }
  }

  // Log visitor
  const db = await readDb();
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
  await writeDb(db);

  const registeredCustomer = db.registeredCustomers?.find(c => c.email.toLowerCase() === cleanEmail);

  res.json({
    email: cleanEmail,
    name: registeredCustomer ? `${registeredCustomer.firstName} ${registeredCustomer.secondName}` : cleanName,
    picture: registeredCustomer?.picture || newVisitor.picture,
    role,
    lang: managerLang,
    details: registeredCustomer || undefined
  });
});

// 4. Managers Endpoints
app.get("/api/managers", requireDeveloper, async (req, res) => {
  const db = await readDb();
  res.json(db.managers || []);
});

app.post("/api/managers", requireDeveloper, async (req, res) => {
  try {
    const { email, name, password, lang } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split("@")[0];
    const cleanPassword = password?.trim() || "123";
    const cleanLang = lang || "ar";
    const db = await readDb();

    if (!db.managers) db.managers = [];
    
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
    await writeDb(db);
    res.json({ success: true, managers: db.managers });
  } catch (err: any) {
    console.error("Add manager error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.delete("/api/managers/:email", requireDeveloper, async (req, res) => {
  try {
    const emailToRemove = req.params.email.trim().toLowerCase();
    const db = await readDb();

    if (!db.managers) db.managers = [];
    db.managers = db.managers.filter(m => m.email.toLowerCase() !== emailToRemove);
    await writeDb(db);
    res.json({ success: true, managers: db.managers });
  } catch (err: any) {
    console.error("Delete manager error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// 4.5 Manager Password Login Gate
app.post("/api/auth/manager-login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const db = await readDb();

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
  await writeDb(db);

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

function normalizeArabic(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function isEgyptianPhone(phone: string): boolean {
  let cleaned = phone.replace(/\D/g, "");
  // Normalize Egypt international prefixes
  if (cleaned.startsWith("20") && cleaned.length === 12) {
    cleaned = "0" + cleaned.substring(2);
  } else if (cleaned.startsWith("0020") && cleaned.length === 14) {
    cleaned = "0" + cleaned.substring(4);
  } else if (cleaned.length === 10 && (cleaned.startsWith("10") || cleaned.startsWith("11") || cleaned.startsWith("12") || cleaned.startsWith("15"))) {
    cleaned = "0" + cleaned;
  }
  return /^01[0125]\d{8}$/.test(cleaned);
}

app.post("/api/auth/register-customer", async (req, res) => {
  const { firstName, secondName, thirdName, phone, alternativePhone, email, picture } = req.body;
  if (!firstName || !secondName || !thirdName || !phone || !alternativePhone || !email || !picture) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة إجبارياً، بما في ذلك الاسم الثلاثي، الهواتف، البريد وصورة الحساب." });
  }

  // Enforce Egyptian Mobile Number Verification
  if (!isEgyptianPhone(phone)) {
    return res.status(400).json({ 
      error: "رقم الهاتف الأساسي غير صحيح! يجب إدخال رقم هاتف محمول مصري حقيقي نشط (مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015)." 
    });
  }
  if (!isEgyptianPhone(alternativePhone)) {
    return res.status(400).json({ 
      error: "رقم الهاتف الاحتياطي غير صحيح! يجب إدخال رقم هاتف محمول مصري حقيقي احتياطي مختلف (مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015)." 
    });
  }
  if (phone.replace(/\D/g, "") === alternativePhone.replace(/\D/g, "")) {
    return res.status(400).json({ 
      error: "رقم الهاتف الاحتياطي يجب أن يكون مختلفاً تماماً عن رقم الهاتف الأساسي لتسهيل التواصل والتحقق الفوري." 
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = await readDb();

  // 1. Check strict programmatic blocking first
  const blocked = db.blockedCustomers || [];
  const cleanNewPhone = cleanPhone(phone);
  const cleanNewAltPhone = cleanPhone(alternativePhone);
  const normNewName = normalizeArabic(`${firstName} ${secondName} ${thirdName}`);

  for (const b of blocked) {
    const bEmail = b.email.trim().toLowerCase();
    const bPhone = cleanPhone(b.phone);
    const bAlt = cleanPhone(b.alternativePhone);
    const normBName = normalizeArabic(`${b.firstName} ${b.secondName} ${b.thirdName}`);

    if (cleanEmail === bEmail) {
      return res.status(400).json({ error: "تم حظر هذا البريد الإلكتروني نهائياً من قبل الإدارة لمخالفته القوانين." });
    }
    if (cleanNewPhone === bPhone || cleanNewPhone === bAlt || (cleanNewAltPhone && (cleanNewAltPhone === bPhone || cleanNewAltPhone === bAlt))) {
      return res.status(400).json({ error: "رقم الهاتف المدخل (أو الاحتياطي) مرتبط بحساب تم حظره نهائياً." });
    }
    if (normNewName === normBName) {
      return res.status(400).json({ error: "الاسم الثلاثي المدخل متطابق مع اسم مستخدم تم حظره نهائياً من النظام." });
    }
    if (picture === b.picture) {
      return res.status(400).json({ error: "الصورة المرفوعة مخصصة لحساب محظور مسبقاً." });
    }
  }

  // Check if already registered
  const exists = (db.registeredCustomers || []).some(c => c.email.toLowerCase() === cleanEmail);
  if (exists) {
    return res.status(400).json({ error: "هذا البريد الإلكتروني مسجل بالفعل." });
  }

  // Add customer directly to DB
  const newCustomer: RegisteredCustomer = {
    firstName: firstName.trim(),
    secondName: secondName.trim(),
    thirdName: thirdName.trim(),
    phone: phone.trim(),
    alternativePhone: alternativePhone.trim(),
    email: cleanEmail,
    picture: picture,
    registeredAt: new Date().toISOString()
  };

  if (!db.registeredCustomers) db.registeredCustomers = [];
  db.registeredCustomers.unshift(newCustomer);

  if (!db.subscribers) db.subscribers = [];
  if (!db.subscribers.includes(cleanEmail)) {
    db.subscribers.push(cleanEmail);
  }

  const fullName = `${newCustomer.firstName} ${newCustomer.secondName} ${newCustomer.thirdName}`;
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: fullName,
    picture: newCustomer.picture,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Customer Registration Flow",
    authType: "sandbox",
    role: "Customer"
  };
  db.visitors.unshift(newVisitor);

  const emailLog: EmailLogObj = {
    toEmail: cleanEmail,
    subject: "🎁 أهلاً بك في فرنش تاتش! عروضنا الحصرية والمنتجات الجديدة بانتظارك",
    body: `مرحباً ${newCustomer.firstName}،
تم تسجيل حسابك بنجاح في تطبيق مطعم فرنش تاتش (French Touch)!

إليك أحدث العروض والمنتجات الحصرية المتوفرة لدينا الآن:
1. بطاطس فرنش تاتش اللذيذة بالجبنة والأعشاب البرية.
2. السندوتشات الفاخرة مثل سندوتش كروك موسيو الكلاسيكي.
3. الحلويات الفرنسية الفاخرة المجهزة يومياً.

خصم ترحيبي خاص 20% على طلبك القادم! كود الخصم: WELCOME20

تم إرسال هذه النشرة تلقائياً وإجبارياً لبريدك الإلكتروني المسجل لدينا: ${cleanEmail}.
أهلاً بك في عائلتنا المميزة!`,
    sentAt: new Date().toISOString(),
    status: "DELIVERED"
  };

  if (!db.emailLogs) db.emailLogs = [];
  db.emailLogs.unshift(emailLog);

  await writeDb(db);

  res.json({
    success: true,
    user: {
      email: cleanEmail,
      name: `${newCustomer.firstName} ${newCustomer.secondName}`,
      role: "Customer",
      picture: newCustomer.picture,
      lang: "ar",
      details: newCustomer
    }
  });
});


// Endpoint for matching and fetching data of existing registered customers
app.post("/api/auth/login-existing-customer", async (req, res) => {
  const { email, name, phone } = req.body;
  if (!email || !name || !phone) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة للمطابقة: البريد الإلكتروني والاسم ورقم الهاتف." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanEnteredPhone = cleanPhone(phone);
  const normEnteredName = normalizeArabic(name);

  const db = await readDb();
  const customers = db.registeredCustomers || [];
  const blocked = db.blockedCustomers || [];

  // Check if they are blocked first
  const blockedCustomer = blocked.find(b => b.email.trim().toLowerCase() === cleanEmail);
  if (blockedCustomer) {
    const reasonMsg = blockedCustomer.blockReason ? `\nالسبب: ${blockedCustomer.blockReason}` : "";
    return res.status(403).json({ error: `تم حظر هذا الحساب نهائياً من قبل الإدارة لمخالفته القوانين والأنظمة.${reasonMsg}` });
  }

  // Find the customer by email
  const customer = customers.find(c => c.email.toLowerCase() === cleanEmail);
  if (!customer) {
    return res.status(404).json({ error: "لم يتم العثور على أي حساب مسجل بهذا البريد الإلكتروني. يرجى مراجعة البريد أو إنشاء حساب جديد." });
  }

  // Verify Phone match
  const dbPhoneClean = cleanPhone(customer.phone);
  const dbAltPhoneClean = cleanPhone(customer.alternativePhone);
  if (cleanEnteredPhone !== dbPhoneClean && cleanEnteredPhone !== dbAltPhoneClean) {
    return res.status(400).json({ error: "رقم الهاتف المدخل لا يتطابق مع الرقم الأساسي أو الاحتياطي المسجل لهذا الحساب." });
  }

  // Verify Name match (allow partial match for flexibility)
  const dbFullName = `${customer.firstName} ${customer.secondName} ${customer.thirdName}`;
  const normDbFullName = normalizeArabic(dbFullName);

  const nameParts = normEnteredName.split(" ").filter(Boolean);
  const isNameMatch = normDbFullName.includes(normEnteredName) || normEnteredName.includes(normalizeArabic(customer.firstName)) || nameParts.some(part => normDbFullName.includes(part));

  if (!isNameMatch) {
    return res.status(400).json({ error: "الاسم المدخل لا يتطابق مع الاسم المسجل للحساب." });
  }

  // Ensure they have an aiAnalysis
  if (!customer.aiAnalysis) {
    customer.aiAnalysis = {
      culinaryMood: "عشاق الكلاسيكيات الراقية",
      personalityAnalysis: "نظراتك الثاقبة وملامحك الواثقة تدل على ذوق فرنسي رفيع يبحث عن النكهات المتوازنة والتفاصيل الفاخرة المتقنة.",
      recommendedDish: "سماش برجر المشروم والترفل الفاخر"
    };
    await writeDb(db);
  }

  // Successful login, log them as a visitor
  const newVisitor: Visitor = {
    email: cleanEmail,
    name: dbFullName,
    picture: customer.picture,
    timestamp: new Date().toISOString(),
    ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"] || "Customer Existing Login Flow",
    authType: "sandbox",
    role: "Customer"
  };
  if (!db.visitors) db.visitors = [];
  db.visitors.unshift(newVisitor);
  await writeDb(db);

  res.json({
    success: true,
    user: {
      email: cleanEmail,
      name: `${customer.firstName} ${customer.secondName}`,
      role: "Customer",
      picture: customer.picture,
      lang: "ar",
      details: customer
    }
  });
});

app.get("/api/registered-customers", requireDeveloper, async (req, res) => {
  const db = await readDb();
  res.json(db.registeredCustomers || []);
});

app.get("/api/blocked-customers", requireDeveloper, async (req, res) => {
  const db = await readDb();
  res.json(db.blockedCustomers || []);
});

app.post("/api/block-customer", requireDeveloper, async (req, res) => {
  const { email, blockReason } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required to block a customer." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = await readDb();

  if (!db.registeredCustomers) db.registeredCustomers = [];
  const customerIndex = db.registeredCustomers.findIndex(c => c.email.toLowerCase() === cleanEmail);
  if (customerIndex === -1) {
    return res.status(404).json({ error: "لم يتم العثور على هذا العميل في قائمة المسجلين." });
  }

  const [customerToBlock] = db.registeredCustomers.splice(customerIndex, 1);
  if (blockReason) {
    customerToBlock.blockReason = blockReason;
  }

  if (!db.blockedCustomers) db.blockedCustomers = [];
  if (!db.blockedCustomers.some(b => b.email.toLowerCase() === cleanEmail)) {
    db.blockedCustomers.unshift(customerToBlock);
  }

  await writeDb(db);
  res.json({ success: true, registeredCustomers: db.registeredCustomers, blockedCustomers: db.blockedCustomers });
});

app.post("/api/warn-customer", requireDeveloper, async (req, res) => {
  const { email, warningMessage } = req.body;
  if (!email || !warningMessage) {
    return res.status(400).json({ error: "Email and warning message are required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = await readDb();

  const customer = (db.registeredCustomers || []).find(c => c.email.toLowerCase() === cleanEmail);
  if (!customer) {
    return res.status(404).json({ error: "لم يتم العثور على هذا العميل." });
  }

  customer.warningMessage = warningMessage;
  await writeDb(db);
  res.json({ success: true, registeredCustomers: db.registeredCustomers });
});

app.post("/api/unwarn-customer", requireDeveloper, async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const db = await readDb();

  const customer = (db.registeredCustomers || []).find(c => c.email.toLowerCase() === cleanEmail);
  if (customer) {
    delete customer.warningMessage;
    await writeDb(db);
  }
  res.json({ success: true, registeredCustomers: db.registeredCustomers });
});

app.post("/api/unblock-customer", requireDeveloper, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required to unblock a customer." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = await readDb();

  const blockedIndex = (db.blockedCustomers || []).findIndex(b => b.email.toLowerCase() === cleanEmail);
  if (blockedIndex === -1) {
    return res.status(404).json({ error: "هذا العميل ليس في قائمة المحظورين." });
  }

  const [unblockedCust] = db.blockedCustomers!.splice(blockedIndex, 1);
  
  if (!db.registeredCustomers) db.registeredCustomers = [];
  if (!db.registeredCustomers.some(c => c.email.toLowerCase() === cleanEmail)) {
    db.registeredCustomers.unshift(unblockedCust);
  }

  await writeDb(db);
  res.json({ success: true, registeredCustomers: db.registeredCustomers, blockedCustomers: db.blockedCustomers });
});

app.get("/api/email-logs", requireDeveloper, async (req, res) => {
  const db = await readDb();
  res.json(db.emailLogs || []);
});

// 4.6 Newsletter & Gmail Subscribers API
app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const cleanEmail = email.trim().toLowerCase();
  const db = await readDb();
  if (!db.subscribers) db.subscribers = [];
  if (!db.subscribers.includes(cleanEmail)) {
    db.subscribers.push(cleanEmail);
    await writeDb(db);
  }
  res.json({ success: true, subscribers: db.subscribers });
});

app.get("/api/subscribers", requireDeveloper, async (req, res) => {
  const db = await readDb();
  res.json(db.subscribers || []);
});

app.post("/api/send-newsletter", requireDeveloper, async (req, res) => {
  const { subject, body } = req.body;
  const db = await readDb();
  const subs = db.subscribers || [];
  
  console.log(`[SIMULATION] Dispatching newsletter to ${subs.length} emails:`);
  subs.forEach(email => {
    console.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${subject}`);
  });
  
  res.json({ success: true, count: subs.length, subscribers: subs });
});

// 5. Visitors logs (accessible to Developer only)
app.get("/api/visitors", requireDeveloper, async (req, res) => {
  const db = await readDb();
  res.json(db.visitors);
});

app.delete("/api/visitors", requireDeveloper, async (req, res) => {
  const db = await readDb();
  db.visitors = [];
  await writeDb(db);
  res.json({ success: true, visitors: [] });
});

// 6. Page Views Count API
app.get("/api/pageviews", async (req, res) => {
  const db = await readDb();
  res.json({ count: db.pageViews || 0 });
});

app.post("/api/pageviews/increment", async (req, res) => {
  const db = await readDb();
  db.pageViews = (db.pageViews || 0) + 1;
  await writeDb(db);
  res.json({ count: db.pageViews });
});

app.post("/api/orders/next-number", async (req, res) => {
  const db = await readDb();
  const nextNum = (db.orderCounter || 0) + 1;
  db.orderCounter = nextNum;
  await writeDb(db);
  res.json({ orderNumber: nextNum });
});

// 7. Dynamic Sections/Categories API
app.get("/api/categories", async (req, res) => {
  const db = await readDb();
  res.json(db.categories || DEFAULT_CATEGORIES);
});

app.post("/api/categories", requireManagerOrDeveloper, async (req, res) => {
  const { id, name, icon } = req.body;
  if (!id || !name || !name.ar || !name.en || !name.fr || !name.it) {
    return res.status(400).json({ error: "id and names in all 4 languages are required." });
  }

  const db = await readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  // Check duplicate
  if (db.categories.some(c => c.id.toLowerCase() === id.toLowerCase())) {
    return res.status(400).json({ error: "Section ID already exists" });
  }

  db.categories.push({ id, name, icon: icon || "Utensils" });
  await writeDb(db);
  res.json({ success: true, categories: db.categories });
});

app.delete("/api/categories/:id", requireManagerOrDeveloper, async (req, res) => {
  const categoryId = req.params.id;
  const db = await readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  db.categories = db.categories.filter(c => c.id !== categoryId);
  await writeDb(db);
  res.json({ success: true, categories: db.categories });
});

app.put("/api/categories/:id", requireManagerOrDeveloper, async (req, res) => {
  const categoryId = req.params.id;
  const { name, icon } = req.body;
  if (!name || !name.ar || !name.en || !name.fr || !name.it) {
    return res.status(400).json({ error: "Names in all 4 languages are required." });
  }

  const db = await readDb();
  if (!db.categories) {
    db.categories = [...DEFAULT_CATEGORIES];
  }

  const idx = db.categories.findIndex(c => c.id === categoryId);
  if (idx === -1) {
    return res.status(404).json({ error: "Category not found." });
  }

  db.categories[idx] = {
    ...db.categories[idx],
    name,
    icon: icon || db.categories[idx].icon || "utensils"
  };

  await writeDb(db);
  res.json({ success: true, categories: db.categories });
});

// 7.5. Products & Offers Endpoints with Smart Sync Restore
app.get("/api/products", async (req, res) => {
  const db = await readDb();
  res.json(db.products || []);
});

app.post("/api/products", requireManagerOrDeveloper, async (req, res) => {
  const product = req.body;
  if (!product || !product.id) {
    return res.status(400).json({ error: "بيانات المنتج غير صالحة." });
  }

  const db = await readDb();
  if (!db.products) db.products = [];

  const index = db.products.findIndex(p => p.id === product.id);
  if (index !== -1) {
    db.products[index] = product;
  } else {
    db.products.push(product);
  }

  await writeDb(db);
  res.json({ success: true, products: db.products });
});

app.delete("/api/products/:id", requireManagerOrDeveloper, async (req, res) => {
  const id = req.params.id;
  const db = await readDb();
  if (!db.products) db.products = [];

  db.products = db.products.filter(p => p.id !== id);
  await writeDb(db);
  res.json({ success: true, products: db.products });
});

app.post("/api/products/delete-all", requireManagerOrDeveloper, async (req, res) => {
  const db = await readDb();
  db.products = [];
  await writeDb(db);
  res.json({ success: true, products: [] });
});

app.post("/api/products/bulk-sync", requireManagerOrDeveloper, async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "مصفوفة المنتجات مطلوبة للمزامنة." });
  }
  const db = await readDb();
  db.products = products;
  await writeDb(db);
  res.json({ success: true, products: db.products });
});

app.get("/api/offers", async (req, res) => {
  const db = await readDb();
  res.json({
    exclusiveOffer: db.exclusiveOffer || null,
    weeklyOffers: db.weeklyOffers || []
  });
});

app.post("/api/offers/exclusive", requireManagerOrDeveloper, async (req, res) => {
  const offer = req.body;
  const db = await readDb();
  db.exclusiveOffer = offer;
  await writeDb(db);
  res.json({ success: true, exclusiveOffer: db.exclusiveOffer });
});

app.post("/api/offers/weekly", requireManagerOrDeveloper, async (req, res) => {
  const { weeklyOffers } = req.body;
  if (!Array.isArray(weeklyOffers)) {
    return res.status(400).json({ error: "مصفوفة العروض الأسبوعية مطلوبة." });
  }
  const db = await readDb();
  db.weeklyOffers = weeklyOffers;
  await writeDb(db);
  res.json({ success: true, weeklyOffers: db.weeklyOffers });
});

// Bulk database backup restore when server resets/updates
app.post("/api/db/sync-restore", requireManagerOrDeveloper, async (req, res) => {
  const { products, categories, registeredCustomers, blockedCustomers, managers, subscribers, emailLogs, orderCounter } = req.body;
  const db = await readDb();

  let restoredCount = 0;

  if (products && Array.isArray(products) && products.length > 0) {
    db.products = products;
    restoredCount++;
  }
  if (categories && Array.isArray(categories) && categories.length > 0) {
    db.categories = categories;
    restoredCount++;
  }
  if (registeredCustomers && Array.isArray(registeredCustomers) && registeredCustomers.length > 0) {
    const existingEmails = new Set((db.registeredCustomers || []).map(c => c.email.toLowerCase()));
    db.registeredCustomers = db.registeredCustomers || [];
    for (const cust of registeredCustomers) {
      if (!existingEmails.has(cust.email.toLowerCase())) {
        db.registeredCustomers.push(cust);
      }
    }
    restoredCount++;
  }
  if (blockedCustomers && Array.isArray(blockedCustomers) && blockedCustomers.length > 0) {
    const existingEmails = new Set((db.blockedCustomers || []).map(c => c.email.toLowerCase()));
    db.blockedCustomers = db.blockedCustomers || [];
    for (const cust of blockedCustomers) {
      if (!existingEmails.has(cust.email.toLowerCase())) {
        db.blockedCustomers.push(cust);
      }
    }
    restoredCount++;
  }
  if (managers && Array.isArray(managers) && managers.length > 0) {
    const existingEmails = new Set((db.managers || []).map(m => m.email.toLowerCase()));
    db.managers = db.managers || [];
    for (const mgr of managers) {
      if (!existingEmails.has(mgr.email.toLowerCase())) {
        db.managers.push(mgr);
      }
    }
    restoredCount++;
  }
  if (subscribers && Array.isArray(subscribers) && subscribers.length > 0) {
    const existingSubs = new Set((db.subscribers || []).map(s => s.toLowerCase()));
    db.subscribers = db.subscribers || [];
    for (const sub of subscribers) {
      if (!existingSubs.has(sub.toLowerCase())) {
        db.subscribers.push(sub);
      }
    }
    restoredCount++;
  }
  if (emailLogs && Array.isArray(emailLogs) && emailLogs.length > 0) {
    db.emailLogs = db.emailLogs || [];
    const existingTimes = new Set(db.emailLogs.map(l => l.sentAt));
    for (const log of emailLogs) {
      if (!existingTimes.has(log.sentAt)) {
        db.emailLogs.push(log);
      }
    }
    restoredCount++;
  }
  if (typeof orderCounter === "number" && orderCounter > (db.orderCounter || 0)) {
    db.orderCounter = orderCounter;
    restoredCount++;
  }

  await writeDb(db);
  res.json({ success: true, message: `Successfully synced ${restoredCount} database tables to server.` });
});

// 8. Dynamic Translation API (using Gemini)
app.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang" });
  }

  try {
    const langNames: Record<string, string> = {
      ar: "Arabic (العربية)",
      en: "English",
      fr: "French (Français)",
      it: "Italian (Italiano)"
    };

    const target = langNames[targetLang] || targetLang;

    // Check if key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing, returning original text.");
      return res.json({ translation: text });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert culinary translator. Translate the following restaurant menu item name, description, or section title into ${target}. 

Rules:
- Translate the text accurately, keeping a high-end gourmet restaurant tone.
- Return ONLY the exact translated text.
- Do NOT add quotes, explanation, punctuation, markdown, or preface.
- Do NOT say "Here is the translation:".
- If the text is empty or is already in that language, return it exactly as is.

Text to translate:
${text}`,
    });

    const translatedText = response.text?.trim() || text;
    res.json({ translation: translatedText });
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    res.json({ translation: text }); // Fallback
  }
});

// 8.5. Dynamic Translation to All Languages API (using Gemini)
app.post("/api/translate-all", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text to translate" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing, returning original text for all.");
      return res.json({ ar: text, en: text, fr: text, it: text });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert multilingual culinary translator for a high-end gourmet restaurant/cafe. 
Identify the language of the following text and translate it into Arabic (العربية), English, French (Français), and Italian (Italiano).

Rules:
- Keep a high-end, elegant gourmet restaurant/cafe tone.
- Keep translations highly accurate, premium, authentic, and naturally phrased for each culture.
- Return a JSON object with keys "ar", "en", "fr", "it".
- The value for each key must be the translated text (or the original text if that key matches the source language).
- Do not add any extra commentary, markdown, backticks, or code blocks outside the JSON itself.

Text to translate:
"${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ar: { type: Type.STRING },
            en: { type: Type.STRING },
            fr: { type: Type.STRING },
            it: { type: Type.STRING },
          },
          required: ["ar", "en", "fr", "it"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({
      ar: parsed.ar || text,
      en: parsed.en || text,
      fr: parsed.fr || text,
      it: parsed.it || text
    });
  } catch (error: any) {
    console.error("Gemini Translate All Error:", error);
    res.json({ ar: text, en: text, fr: text, it: text }); // Fallback
  }
});

// --- Restaurant Reviews & Interactive Discussions ---
app.get("/api/reviews", async (req, res) => {
  const db = await readDb();
  res.json(db.reviews || []);
});

app.post("/api/reviews", async (req, res) => {
  const { rating, comment, userEmail, userName, userPicture, role } = req.body;
  if (!userEmail || !userName) {
    return res.status(400).json({ error: "اسم المستخدم والبريد الإلكتروني مطلوبين لكتابة تقييم." });
  }
  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "التقييم يجب أن يكون بين 1 و 5 نجوم." });
  }

  const db = await readDb();
  db.reviews = db.reviews || [];

  const newReview: RestaurantReview = {
    id: "rev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    userEmail,
    userName,
    userPicture: userPicture || "",
    role: role || "Customer",
    rating: ratingNum,
    comment: comment || "",
    createdAt: new Date().toISOString(),
    replies: []
  };

  db.reviews.unshift(newReview);
  await writeDb(db);
  res.json({ success: true, reviews: db.reviews });
});

app.post("/api/reviews/:id/replies", async (req, res) => {
  const reviewId = req.params.id;
  const { text, userEmail, userName, userPicture, role } = req.body;
  if (!text) {
    return res.status(400).json({ error: "نص الرد مطلوب." });
  }
  if (!userEmail || !userName) {
    return res.status(400).json({ error: "بيانات المستخدم مطلوبة للمشاركة في المناقشة." });
  }

  const db = await readDb();
  db.reviews = db.reviews || [];

  const review = db.reviews.find(r => r.id === reviewId);
  if (!review) {
    return res.status(404).json({ error: "التقييم غير موجود." });
  }

  const newReply: ReviewReply = {
    id: "rep_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    userEmail,
    userName,
    userPicture: userPicture || "",
    role: role || "Customer",
    text,
    createdAt: new Date().toISOString()
  };

  review.replies.push(newReply);
  await writeDb(db);
  res.json({ success: true, reviews: db.reviews });
});

app.delete("/api/reviews/:id", requireManagerOrDeveloper, async (req, res) => {
  const id = req.params.id;
  const db = await readDb();
  db.reviews = db.reviews || [];
  db.reviews = db.reviews.filter(r => r.id !== id);
  await writeDb(db);
  res.json({ success: true, reviews: db.reviews });
});

app.delete("/api/reviews/:reviewId/replies/:replyId", requireManagerOrDeveloper, async (req, res) => {
  const { reviewId, replyId } = req.params;
  const db = await readDb();
  db.reviews = db.reviews || [];
  const review = db.reviews.find(r => r.id === reviewId);
  if (review) {
    review.replies = review.replies.filter(rep => rep.id !== replyId);
    await writeDb(db);
  }
  res.json({ success: true, reviews: db.reviews });
});

// --- AI Copilot for Managers and Developers ---
app.post("/api/ai/copilot", requireManagerOrDeveloper, async (req, res) => {
  const { prompt, currentLanguage } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "الرجاء إدخال نص الطلب." });
  }

  const userRole = (req.headers["x-user-role"] as string || "").trim();
  const isDeveloper = userRole === "Developer";

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "مفتاح الذكاء الاصطناعي غير متوفر حالياً على الخادم." });
    }

    const db = await readDb();
    const ai = getGeminiClient();

    // Prepare a compact representation of the DB to avoid token bloat
    const dbContext = {
      products: (db.products || []).map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category })),
      categories: db.categories || [],
      registeredCustomers: (db.registeredCustomers || []).map(c => ({ email: c.email, name: `${c.firstName || ""} ${c.secondName || ""} ${c.thirdName || ""}`.trim(), registeredAt: c.registeredAt, culinaryMood: c.aiAnalysis?.culinaryMood })),
      blockedCustomers: (db.blockedCustomers || []).map(c => ({ email: c.email, name: `${c.firstName || ""} ${c.secondName || ""} ${c.thirdName || ""}`.trim() })),
      exclusiveOffer: db.exclusiveOffer || null,
      weeklyOffers: db.weeklyOffers || [],
      reviews: (db.reviews || []).map(r => ({ id: r.id, email: r.userEmail, comment: r.comment, rating: r.rating, repliesCount: r.replies?.length })),
      orderCounter: db.orderCounter || 0
    };

    let systemPrompt = "";
    if (isDeveloper) {
      systemPrompt = `You are the Master AI Copilot of French Touch Restaurant management portal.
You have FULL control over the database and can modify products, offers, categories, customers, and reviews.
The current language of the UI is ${currentLanguage || 'ar'}. Respond in this language in the "response" property of the JSON.

You must parse the user's intent and decide if they want to execute an action or just ask a question.
Return your answer as a JSON object with this exact schema:
{
  "response": "Explain what you did or answer the user's query in Arabic or English",
  "actions": [
    {
      "type": "ADD_PRODUCT" | "DELETE_PRODUCT" | "SET_EXCLUSIVE_OFFER" | "SET_WEEKLY_OFFERS" | "BLOCK_CUSTOMER" | "UNBLOCK_CUSTOMER" | "DELETE_REVIEW",
      "payload": { ... }
    }
  ]
}

Available Action Types and their Payloads:
1. "ADD_PRODUCT"
   Payload fields:
   - "id": string (generate a random string like "prod_xxx" if not updating an existing product)
   - "name": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (Translate the product name into all 4 languages. DO NOT leave them empty!)
   - "description": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (Translate description into all 4 languages. DO NOT leave empty!)
   - "price": number
   - "category": string (must match one of the category IDs, e.g., "sandwiches", "meals", "pasta", "pizza", "dessert", "drinks", "exclusive")
   - "image": string (use a high quality Unsplash image url matching the product, or fallback to "https://images.unsplash.com/photo-1546069901-ba9599a7e63c")
   - "canHaveAddons": boolean
   - "canHaveSauces": boolean

2. "DELETE_PRODUCT"
   Payload fields:
   - "id": string (The ID of the product to delete)

3. "SET_EXCLUSIVE_OFFER"
   Payload fields:
   - "id": "exc_1"
   - "title": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (translate into all 4)
   - "description": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (translate into all 4)
   - "discount": string (e.g. "30% OFF")
   - "endTime": string (e.g. ISO date or duration)
   - "image": string
   - "active": boolean

4. "SET_WEEKLY_OFFERS"
   Payload: Array of 7 weekly offers corresponding to dayOfWeek 0-6. Update the relevant day or days requested.

5. "BLOCK_CUSTOMER"
   Payload fields:
   - "email": string (Customer's email address)

6. "UNBLOCK_CUSTOMER"
   Payload fields:
   - "email": string (Customer's email address)

7. "DELETE_REVIEW"
   Payload fields:
   - "id": string (Review ID to delete)

Rules:
- If asked to add/update an offer or product, always translate the Arabic inputs to English, French, and Italian so the multi-language UI works perfectly!
- If the user asks a question or requests information (e.g. 'من هو العميل uv...؟' or 'كم زبون مسجل؟'), return an empty "actions" array and provide the perfect detailed answer in the "response" text.
- Be extremely polite, professional, and helpful.

Current Database State:
${JSON.stringify(dbContext, null, 2)}`;
    } else {
      systemPrompt = `You are the LIMITED Manager AI Copilot of French Touch Restaurant management portal.
**CRITICAL LIMITATION**: You are ONLY authorized to manage products (add, edit, delete), categories, and offers (exclusive/weekly), or delete inappropriate reviews.
You are STRICTLY FORBIDDEN from blocking or unblocking customers, managing developer settings, accessing developer statistics, viewing internal logs, or performing any developer-level operations.

The current language of the UI is ${currentLanguage || 'ar'}. Respond in this language in the "response" property of the JSON.

You must parse the user's intent and decide if they want to execute an action or just ask a question.
Return your answer as a JSON object with this exact schema:
{
  "response": "Explain what you did or answer the user's query in Arabic or English",
  "actions": [
    {
      "type": "ADD_PRODUCT" | "DELETE_PRODUCT" | "SET_EXCLUSIVE_OFFER" | "SET_WEEKLY_OFFERS" | "DELETE_REVIEW",
      "payload": { ... }
    }
  ]
}

Available Action Types and their Payloads for Managers:
1. "ADD_PRODUCT"
   Payload fields:
   - "id": string (generate a random string like "prod_xxx" if not updating an existing product)
   - "name": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (Translate the product name into all 4 languages. DO NOT leave them empty!)
   - "description": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (Translate description into all 4 languages. DO NOT leave empty!)
   - "price": number
   - "category": string (must match one of the category IDs, e.g., "sandwiches", "meals", "pasta", "pizza", "dessert", "drinks", "exclusive")
   - "image": string (use a high quality Unsplash image url matching the product, or fallback to "https://images.unsplash.com/photo-1546069901-ba9599a7e63c")
   - "canHaveAddons": boolean
   - "canHaveSauces": boolean

2. "DELETE_PRODUCT"
   Payload fields:
   - "id": string (The ID of the product to delete)

3. "SET_EXCLUSIVE_OFFER"
   Payload fields:
   - "id": "exc_1"
   - "title": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (translate into all 4)
   - "description": { "ar": "...", "en": "...", "fr": "...", "it": "..." } (translate into all 4)
   - "discount": string (e.g. "30% OFF")
   - "endTime": string (e.g. ISO date or duration)
   - "image": string
   - "active": boolean

4. "SET_WEEKLY_OFFERS"
   Payload: Array of 7 weekly offers corresponding to dayOfWeek 0-6. Update the relevant day or days requested.

5. "DELETE_REVIEW"
   Payload fields:
   - "id": string (Review ID to delete)

Rules & Absolute Limitations for Managers:
- If the user asks you to block/unblock a customer, block an email, or perform developer tasks, you MUST refuse and state that you do not have the authorization to perform customer blocking or developer operations as a Manager, and that this permission is restricted exclusively to the Developer.
- If asked to add/update an offer or product, always translate the Arabic inputs to English, French, and Italian so the multi-language UI works perfectly!
- If the user asks a question or requests information, return an empty "actions" array and provide the perfect detailed answer in the "response" text.
- Be extremely polite, professional, and helpful.

Current Database State (Manager view - Limited):
${JSON.stringify(dbContext, null, 2)}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const aiResult = JSON.parse(response.text?.trim() || "{}");
    const actions = aiResult.actions || [];
    let updated = false;

    // Execute actions on real database
    for (const action of actions) {
      if ((action.type === "BLOCK_CUSTOMER" || action.type === "UNBLOCK_CUSTOMER") && !isDeveloper) {
        return res.status(403).json({ error: "عذراً، بصفتك مديراً، لا تملك صلاحية حظر أو إلغاء حظر العملاء. هذه الصلاحية حصرية للمطور فقط." });
      }

      if (action.type === "ADD_PRODUCT" && action.payload) {
        if (!db.products) db.products = [];
        const index = db.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          db.products[index] = { ...db.products[index], ...action.payload };
        } else {
          db.products.push(action.payload);
        }
        updated = true;
      } else if (action.type === "DELETE_PRODUCT" && action.payload?.id) {
        if (db.products) {
          db.products = db.products.filter(p => p.id !== action.payload.id);
          updated = true;
        }
      } else if (action.type === "SET_EXCLUSIVE_OFFER" && action.payload) {
        db.exclusiveOffer = action.payload;
        updated = true;
      } else if (action.type === "SET_WEEKLY_OFFERS" && Array.isArray(action.payload)) {
        db.weeklyOffers = action.payload;
        updated = true;
      } else if (action.type === "BLOCK_CUSTOMER" && action.payload?.email) {
        const targetEmail = action.payload.email.toLowerCase().trim();
        const customer = db.registeredCustomers?.find(c => c.email.toLowerCase().trim() === targetEmail);
        if (customer) {
          db.blockedCustomers = db.blockedCustomers || [];
          if (!db.blockedCustomers.some(c => c.email.toLowerCase().trim() === targetEmail)) {
            db.blockedCustomers.push(customer);
          }
          db.registeredCustomers = db.registeredCustomers?.filter(c => c.email.toLowerCase().trim() !== targetEmail);
          updated = true;
        }
      } else if (action.type === "UNBLOCK_CUSTOMER" && action.payload?.email) {
        const targetEmail = action.payload.email.toLowerCase().trim();
        const blocked = db.blockedCustomers?.find(c => c.email.toLowerCase().trim() === targetEmail);
        if (blocked) {
          db.registeredCustomers = db.registeredCustomers || [];
          if (!db.registeredCustomers.some(c => c.email.toLowerCase().trim() === targetEmail)) {
            db.registeredCustomers.push(blocked);
          }
          db.blockedCustomers = db.blockedCustomers?.filter(c => c.email.toLowerCase().trim() !== targetEmail);
          updated = true;
        }
      } else if (action.type === "DELETE_REVIEW" && action.payload?.id) {
        if (db.reviews) {
          db.reviews = db.reviews.filter(r => r.id !== action.payload.id);
          updated = true;
        }
      }
    }

    if (updated) {
      await writeDb(db);
    }

    res.json({
      success: true,
      response: aiResult.response || "تم تنفيذ الطلب بنجاح.",
      actionsExecuted: actions,
      dbProducts: db.products || [],
      dbCategories: db.categories || [],
      dbExclusiveOffer: db.exclusiveOffer || null,
      dbWeeklyOffers: db.weeklyOffers || [],
      dbReviews: db.reviews || [],
      dbRegisteredCustomers: db.registeredCustomers || [],
      dbBlockedCustomers: db.blockedCustomers || []
    });

  } catch (error: any) {
    console.error("AI Copilot Error:", error);
    res.status(500).json({ error: "حدث خطأ في معالجة طلب الذكاء الاصطناعي: " + error.message });
  }
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
    app.get("*", async (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK ENGINE] Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
