import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error("Invalid Firebase configuration. Please verify your project settings.");
}

console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);

console.log("Connecting to Firestore (Long Polling)...");
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validate connection as per instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore connected successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("the client is offline")) {
        console.error("Firestore connection failed: Client is offline. Please check your network.");
      } else if (error.message.includes("not found")) {
        console.error("Firestore database not found. Please create one in Firebase Console with ID:", firebaseConfig.firestoreDatabaseId);
      } else {
        console.error("Firestore connection failed:", error.message);
      }
    }
  }
}

testConnection();
