import { getMongoDb, hasMongoConfig } from "@/lib/mongodb";

const DEFAULT_DOCUMENT_ID = "main";

function cloneValue(value) {
  return value === undefined ? value : structuredClone(value);
}

export async function getSiteContentDocument(
  collectionName,
  defaultValue = null,
  documentId = DEFAULT_DOCUMENT_ID,
) {
  if (!hasMongoConfig()) {
    return cloneValue(defaultValue);
  }

  try {
    const db = await getMongoDb();
    const doc = await db.collection(collectionName).findOne({ _id: documentId });

    if (!doc) {
      return cloneValue(defaultValue);
    }

    if ("data" in doc) {
      return cloneValue(doc.data);
    }

    const legacyValue = { ...doc };
    delete legacyValue._id;
    delete legacyValue.createdAt;
    delete legacyValue.updatedAt;

    return Object.keys(legacyValue).length > 0
      ? cloneValue(legacyValue)
      : cloneValue(defaultValue);
  } catch (error) {
    console.error(`Erro ao buscar documento ${documentId} na collection ${collectionName}:`, error);
    return cloneValue(defaultValue);
  }
}

export async function saveSiteContentDocument(
  collectionName,
  data,
  documentId = DEFAULT_DOCUMENT_ID,
) {
  if (!hasMongoConfig()) {
    throw new Error("MONGODB_URI not configured.");
  }

  const db = await getMongoDb();
  const now = new Date();

  await db.collection(collectionName).updateOne(
    { _id: documentId },
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

  return cloneValue(data);
}
