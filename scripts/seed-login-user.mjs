import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key || process.env[key]) continue;

    let value = trimmed.slice(equalsIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

function readEnv() {
  loadEnvFile(path.join(rootDir, ".env"));
  loadEnvFile(path.join(rootDir, ".env.local"));
}

function createPasswordHash(password, pepper) {
  return createHash("sha256")
    .update(`${String(password)}.${String(pepper || "")}`)
    .digest("hex");
}

async function main() {
  readEnv();

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const dbName =
    process.env.MONGODB_DB?.trim() ||
    process.env.MONGODB_DATABASE?.trim() ||
    "decorartearomas";

  const email = "decorartearomas21@gmail.com";
  const password = "Dio1234.";
  const pepper = process.env.AUTH_PASSWORD_PEPPER || process.env.COOKIE_SECRET || "";
  const passwordHash = createPasswordHash(password, pepper);

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(dbName);
    const now = new Date();

    await db.collection("site_login_users").updateOne(
      { _id: "main" },
      {
        $set: {
          data: {
            id: "decorador-admin",
            email,
            passwordHash,
          },
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    );

    console.log("Seeded site_login_users/main with the provided client login.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
