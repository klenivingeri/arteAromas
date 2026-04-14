import { put } from "@vercel/blob";
import { createHash } from "node:crypto";

const LOGIN_USER_PATH = "login/user.json";

const email = process.env.LOGIN_EMAIL || "admin@decorartearomas.com";
const password = process.env.LOGIN_PASSWORD || "123456";

const passwordHash = createHash("sha256").update(password).digest("hex");

const userPayload = {
  id: "decorador-admin",
  email,
  passwordHash,
  updatedAt: new Date().toISOString(),
};

await put(LOGIN_USER_PATH, JSON.stringify(userPayload, null, 2), {
  access: "public",
  contentType: "application/json",
  addRandomSuffix: false,
  allowOverwrite: true,
});

console.log(`Arquivo ${LOGIN_USER_PATH} criado/atualizado no Blob para ${email}.`);
