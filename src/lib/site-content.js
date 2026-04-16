import { getMongoDb, hasMongoConfig } from "@/lib/mongodb";

const DEFAULT_DOCUMENT_ID = "main";

function cloneValue(value) {
  return value === undefined ? value : structuredClone(value);
}

function extractStoredDocumentValue(doc) {
  if (!doc) return null;

  if ("data" in doc) {
    return cloneValue(doc.data);
  }

  const legacyValue = { ...doc };
  delete legacyValue._id;
  delete legacyValue.createdAt;
  delete legacyValue.updatedAt;

  return Object.keys(legacyValue).length > 0 ? cloneValue(legacyValue) : null;
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

    const storedValue = extractStoredDocumentValue(doc);
    return storedValue === null ? cloneValue(defaultValue) : storedValue;
  } catch (error) {
    console.error(`Erro ao buscar documento ${documentId} na collection ${collectionName}:`, error);
    return cloneValue(defaultValue);
  }
}

export async function getSiteContentDocuments(collectionName, defaultValue = []) {
  if (!hasMongoConfig()) {
    return cloneValue(defaultValue);
  }

  try {
    const db = await getMongoDb();
    const docs = await db.collection(collectionName).find({}).sort({ createdAt: 1, _id: 1 }).toArray();

    if (!docs.length) {
      return cloneValue(defaultValue);
    }

    if (
      docs.length === 1 &&
      docs[0]?._id === DEFAULT_DOCUMENT_ID &&
      "data" in docs[0] &&
      Array.isArray(docs[0].data)
    ) {
      return cloneValue(docs[0].data);
    }

    const values = docs
      .map((doc) => extractStoredDocumentValue(doc))
      .filter((value) => value !== null && value !== undefined);

    return values.length ? values : cloneValue(defaultValue);
  } catch (error) {
    console.error(`Erro ao buscar documentos na collection ${collectionName}:`, error);
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

export async function saveSiteContentDocuments(collectionName, documents) {
  if (!hasMongoConfig()) {
    throw new Error("MONGODB_URI not configured.");
  }

  const db = await getMongoDb();
  const now = new Date();
  const safeDocuments = Array.isArray(documents) ? documents.filter(Boolean) : [];

  await Promise.all(
    safeDocuments.map((doc) =>
      db.collection(collectionName).updateOne(
        { _id: String(doc._id) },
        {
          $set: {
            data: doc.data,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      ),
    ),
  );

  const idsToKeep = safeDocuments.map((doc) => String(doc._id));

  if (idsToKeep.length > 0) {
    await db.collection(collectionName).deleteMany({
      _id: { $nin: idsToKeep },
    });
  } else {
    await db.collection(collectionName).deleteMany({});
  }

  return cloneValue(safeDocuments.map((doc) => doc.data));
}
