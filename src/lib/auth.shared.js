export const SESSION_COOKIE_NAME = "x-tenant";
export const SESSION_MAX_AGE_SECONDS = 16 * 60 * 60;

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

function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = "";

  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }

  return hex;
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

async function hmacHexWeb(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toHex(signature);
}

export async function verifySessionCookieEdge(cookieValue, secret) {
  if (!secret) return false;

  const parsed = parseSessionCookieValue(cookieValue);
  if (!parsed) return false;

  const ageInSeconds = (Date.now() - parsed.timestamp) / 1000;
  if (ageInSeconds < 0 || ageInSeconds > SESSION_MAX_AGE_SECONDS) {
    return false;
  }

  const signedData = `${parsed.userId}.${parsed.timestamp}.${parsed.nonce}`;
  const expectedSignature = await hmacHexWeb(signedData, secret);

  return timingSafeEqual(expectedSignature, parsed.signature);
}
