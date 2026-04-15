import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { get } from "@vercel/blob";
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

function parseRelaxedJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const normalized = rawText.replace(
      /([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g,
      '$1"$2"$3',
    );
    return JSON.parse(normalized);
  }
}

async function readBlobJson(pathname, token) {
  for (const access of ["private", "public"]) {
    const result = await get(pathname, {
      access,
      token,
    }).catch(() => null);

    if (result && result.stream) {
      const rawText = await new Response(result.stream).text();
      return parseRelaxedJson(rawText);
    }
  }

  return null;
}

async function main() {
  readEnv();

  const uri = process.env.MONGODB_URI?.trim();
  const dbName =
    process.env.MONGODB_DB?.trim() ||
    process.env.MONGODB_DATABASE?.trim() ||
    "decorartearomas";

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(dbName);
    const now = new Date();

    const documents = [
      {
        collectionName: "site_banner",
        pathname: "config/banner.json",
      },
      {
        collectionName: "site_texts",
        pathname: "config/texts.json",
      },
      {
        collectionName: "site_products",
        pathname: "config/products.json",
      },
      {
        collectionName: "site_comments",
        pathname: "config/comments.json",
      },
      {
        collectionName: "site_login_users",
        pathname: "login/user.json",
      },
    ];

    for (const doc of documents) {
      const data = await readBlobJson(doc.pathname, token).catch((error) => {
        console.warn(`Skipping ${doc.pathname}: ${error.message}`);
        return null;
      });

      if (data == null) {
        console.log(`No data found for ${doc.pathname}, skipping.`);
        continue;
      }

      await db.collection(doc.collectionName).updateOne(
        { _id: "main" },
        {
          $set: {
            data,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      );

      console.log(`Migrated ${doc.pathname} -> ${doc.collectionName}/main`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
