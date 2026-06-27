import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence, 
  GoogleAuthProvider 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "gen-lang-client-0447591345",
  appId: "1:1047666840859:web:8d9938fad9ed225339efbe",
  apiKey: "AIzaSyDHyK14UAnuxfrREq80KIA-s5Ks9qKlN3s",
  authDomain: "gen-lang-client-0447591345.firebaseapp.com",
  storageBucket: "gen-lang-client-0447591345.firebasestorage.app",
  messagingSenderId: "1047666840859",
  measurementId: ""
};

// Initialize Firebase safely to prevent re-initialization errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, "ai-studio-franchtouch-c185637b-7de9-4621-bd19-1411605bdf0f");

// Safe storage availability check
function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    const testKey = "__firebase_storage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

let tempAuth;

try {
  if (isStorageAvailable()) {
    try {
      // Standard initialization
      tempAuth = initializeAuth(app, {
        persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]
      });
    } catch (e: any) {
      if (e.code === "auth/already-initialized" || e.name === "FirebaseError") {
        tempAuth = getAuth(app);
      } else {
        console.warn("Standard initializeAuth failed, falling back to getAuth:", e);
        tempAuth = getAuth(app);
      }
    }
  } else {
    console.log("Storage is not available (sandboxed iframe context). Initializing Firebase Auth with in-memory persistence.");
    try {
      tempAuth = initializeAuth(app, {
        persistence: inMemoryPersistence
      });
    } catch (e: any) {
      if (e.code === "auth/already-initialized" || e.name === "FirebaseError") {
        tempAuth = getAuth(app);
      } else {
        console.warn("initializeAuth with inMemoryPersistence failed, falling back to getAuth:", e);
        tempAuth = getAuth(app);
      }
    }
  }
} catch (outerErr) {
  console.error("Outer Firebase Auth initialization error:", outerErr);
  tempAuth = getAuth(app);
}

// Initialize Firebase Auth
export const auth = tempAuth;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

