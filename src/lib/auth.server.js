import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual as nodeTimingSafeEqual,
} from "node:crypto";
import { list } from "@vercel/blob";
import { SESSION_MAX_AGE_SECONDS } from "./auth.shared";

export const LOGIN_USER_PATH = "login/user.json";

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

function parseLoginUserPayload(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    // Accept a relaxed format like: { email: "a@b.com", password: "123" }
    const normalized = rawText.replace(
      /([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g,
      '$1"$2"$3'
    );

    return JSON.parse(normalized);
  }
}

export async function getLoginUserFromBlob() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return {
      ok: false,
      error:
        "BLOB_READ_WRITE_TOKEN não configurado. Defina no ambiente para ler login/user.json.",
    };
  }

  try {
    const { blobs } = await list({ prefix: "login/" });
    const loginBlob = blobs.find((item) => item.pathname === LOGIN_USER_PATH);

    if (!loginBlob) {
      return {
        ok: false,
        error: "Arquivo login/user.json não encontrado no Blob.",
      };
    }

    const response = await fetch(loginBlob.url, { cache: "no-store" });
    if (!response.ok) {
      return {
        ok: false,
        error: `Falha ao ler login/user.json (HTTP ${response.status}).`,
      };
    }

    const rawText = await response.text();
    let data;

    try {
      data = parseLoginUserPayload(rawText);
    } catch {
      return {
        ok: false,
        error:
          "login/user.json inválido. Use JSON válido, por exemplo: { \"email\": \"erick@gmail.com\", \"password\": \"123\" }",
      };
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: `Erro ao acessar Blob: ${error?.message || "desconhecido"}`,
    };
  }
}

export async function authenticateFixedUserFromBlob({ email, password }) {
  const blobResult = await getLoginUserFromBlob();
  const user = blobResult.ok
    ? blobResult.data
    : {
        id: process.env.LOGIN_USER_ID || "decorador-admin",
        email:
          process.env.LOGIN_EMAIL ||
          process.env.AUTH_EMAIL ||
          "admin@decorartearomas.com",
        password:
          process.env.LOGIN_PASSWORD || process.env.AUTH_PASSWORD || "123456",
        passwordHash: process.env.LOGIN_PASSWORD_HASH || "",
      };

  const normalizedEmail = normalizeEmail(email);
  const blobEmail = normalizeEmail(
    pickFirstString(user, ["email", "login", "username", "user"])
  );

  if (!normalizedEmail || !password || !blobEmail) {
    return { success: false, message: "Credenciais inválidas" };
  }

  if (normalizedEmail !== blobEmail) {
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
      message: "login/user.json precisa ter passwordHash (recomendado) ou password.",
    };
  }

  return {
    success: true,
    user: {
      id: user.id || "decorador-admin",
      email: blobEmail,
    },
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
