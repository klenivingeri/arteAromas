import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual as nodeTimingSafeEqual,
} from "node:crypto";
import { getSiteContentDocument } from "@/lib/site-content";
import { SESSION_MAX_AGE_SECONDS } from "./auth.shared";

export const LOGIN_USER_COLLECTION_NAME = "site_login_users";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function pickFirstString(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function createPasswordHash(password, pepper) {
  return createHash("sha256")
    .update(`${String(password)}.${String(pepper)}`)
    .digest("hex");
}

function createSimplePasswordHash(password) {
  return createHash("sha256").update(String(password)).digest("hex");
}

function matchPasswordHash(password, storedHash) {
  const pepper = process.env.AUTH_PASSWORD_PEPPER || process.env.COOKIE_SECRET || "";
  const withPepper = pepper ? createPasswordHash(password, pepper) : "";
  const withoutPepper = createSimplePasswordHash(password);

  return storedHash === withPepper || storedHash === withoutPepper;
}

export function createSessionCookieValue(userId, secret) {
  const timestamp = Date.now();
  const nonce = randomUUID();
  const payload = `${userId}.${timestamp}.${nonce}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");

  return `${payload}.${signature}`;
}

function parseSessionCookieValue(cookieValue) {
  if (!cookieValue || typeof cookieValue !== "string") return null;

  const parts = cookieValue.split(".");
  if (parts.length !== 4) return null;

  const [userId, timestampStr, nonce, signature] = parts;
  const timestamp = Number(timestampStr);

  if (!userId || !nonce || !signature || !Number.isFinite(timestamp)) {
    return null;
  }

  return { userId, timestamp, nonce, signature };
}

export function verifySessionCookieServer(cookieValue, secret) {
  if (!secret) return false;

  const parsed = parseSessionCookieValue(cookieValue);
  if (!parsed) return false;

  const ageInSeconds = (Date.now() - parsed.timestamp) / 1000;
  if (ageInSeconds < 0 || ageInSeconds > SESSION_MAX_AGE_SECONDS) {
    return false;
  }

  const signedData = `${parsed.userId}.${parsed.timestamp}.${parsed.nonce}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(signedData)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const incomingBuffer = Buffer.from(parsed.signature, "utf8");

  if (expectedBuffer.length !== incomingBuffer.length) return false;

  return nodeTimingSafeEqual(expectedBuffer, incomingBuffer);
}

function buildFallbackLoginUser() {
  return {
    id: process.env.LOGIN_USER_ID || "decorador-admin",
    email:
      process.env.LOGIN_EMAIL ||
      process.env.AUTH_EMAIL ||
      "admin@decorartearomas.com",
    password:
      process.env.LOGIN_PASSWORD || process.env.AUTH_PASSWORD || "123456",
    passwordHash: process.env.LOGIN_PASSWORD_HASH || "",
  };
}

export async function getLoginUserFromMongo() {
  try {
    const data = await getSiteContentDocument(LOGIN_USER_COLLECTION_NAME, null);

    if (!data) {
      return {
        ok: false,
        error: "login-user document not found in Mongo.",
      };
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: `Erro ao acessar Mongo: ${error?.message || "desconhecido"}`,
    };
  }
}

export async function authenticateFixedUserFromMongo({ email, password }) {
  const mongoResult = await getLoginUserFromMongo();
  const user = mongoResult.ok ? mongoResult.data : buildFallbackLoginUser();

  const normalizedEmail = normalizeEmail(email);
  const storedEmail = normalizeEmail(
    pickFirstString(user, ["email", "login", "username", "user"]),
  );

  if (!normalizedEmail || !password || !storedEmail) {
    return { success: false, message: "Credenciais inválidas" };
  }

  if (normalizedEmail !== storedEmail) {
    return { success: false, message: "Credenciais inválidas" };
  }

  const passwordHash = pickFirstString(user, ["passwordHash", "hash", "senhaHash"]);
  const plainPassword = pickFirstString(user, ["password", "senha", "pass"]);

  if (passwordHash) {
    if (!matchPasswordHash(password, passwordHash)) {
      return { success: false, message: "Credenciais inválidas" };
    }
  } else if (plainPassword) {
    if (String(password) !== String(plainPassword)) {
      return { success: false, message: "Credenciais inválidas" };
    }
  } else {
    return {
      success: false,
      message: "login-user document needs passwordHash (recommended) or password.",
    };
  }

  return {
    success: true,
    user: {
      id: user.id || "decorador-admin",
      email: storedEmail,
    },
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
