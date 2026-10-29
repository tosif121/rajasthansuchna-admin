import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";

let messagingInstance: Messaging | null = null;

function getFirebaseMessaging(): Messaging | null {
  if (messagingInstance) return messagingInstance;

  try {
    const existingApp = getApps().find((item) => item.name === "push-admin");
    if (existingApp) {
      messagingInstance = getMessaging(existingApp);
      return messagingInstance;
    }

    // 1. Try environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || "rajsuchnaa-9f50a";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      const app = initializeApp(
        {
          credential: cert({ projectId, clientEmail, privateKey }),
        },
        "push-admin"
      );
      messagingInstance = getMessaging(app);
      console.log("[Firebase Admin] Initialized with FIREBASE_CLIENT_EMAIL & PRIVATE_KEY");
      return messagingInstance;
    }

    // 2. Try service account JSON file paths
    const candidatePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      path.join(process.cwd(), "firebase-service-account.json"),
      path.join(process.cwd(), "src", "server", "firebase-service-account.json"),
      path.join(process.cwd(), "..", "rajasthan-suchna", "firebase-service-account.json"),
      "/Users/tosif/Downloads/rajsuchnaa-firebase-adminsdk.json",
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const fileContent = fs.readFileSync(p, "utf-8");
        const creds = JSON.parse(fileContent);
        const app = initializeApp(
          {
            credential: cert(creds),
            projectId: creds.project_id || projectId,
          },
          "push-admin"
        );
        messagingInstance = getMessaging(app);
        console.log(`[Firebase Admin] Initialized using service account file at ${p}`);
        return messagingInstance;
      }
    }

    console.warn(
      "[Firebase Admin] Service account credentials not found. Device tokens will be stored in Neon DB push_devices table."
    );
    return null;
  } catch (err) {
    console.error("[Firebase Admin] Error initializing Firebase Admin:", err);
    return null;
  }
}

export const messaging = getFirebaseMessaging();
export { getFirebaseMessaging };
