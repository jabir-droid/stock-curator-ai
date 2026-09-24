/**
 * Portfolio Memory & Historical Fingerprint Persistence Engine
 * 
 * Protects stock contributors from cross-session "Similar Submissions / Spam" rejections
 * by remembering perceptual fingerprints (dHash) of past uploads (100+ to 10,000+ images)
 * using IndexedDB with automatic localStorage fallback.
 */

import { hammingDistance } from "../analyzers/batchSimilarity";

const DB_NAME = "StockCuratorMemoryDB";
const DB_VERSION = 1;
const STORE_NAME = "portfolio_fingerprints";
const LOCAL_STORAGE_KEY = "stock_curator_portfolio_memory_fallback_v1";

let dbInstance = null;

/**
 * Initializes IndexedDB connection with fallback handling.
 */
export async function initPortfolioDb() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("by_filename", "filename", { unique: false });
          store.createIndex("by_date", "uploadedAt", { unique: false });
          store.createIndex("by_hash", "pHash", { unique: false });
        }
      };

      request.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = () => {
        console.warn("IndexedDB unavailable, falling back to localStorage.");
        resolve(null);
      };
    } catch (err) {
      console.warn("IndexedDB init failed:", err);
      resolve(null);
    }
  });
}

/**
 * Generates an ultracompact (64x64) thumbnail for fast comparison without memory bloat.
 */
export async function generateMiniThumbnail(previewUrl, size = 64) {
  if (!previewUrl) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        
        // Center crop to square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = previewUrl;
  });
}

/**
 * Reads all historical fingerprints from IndexedDB or localStorage fallback.
 */
export async function getAllHistoricalFingerprints() {
  const db = await initPortfolioDb();

  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          resolve(getLocalStorageFallback());
        };
      } catch {
        resolve(getLocalStorageFallback());
      }
    });
  }

  return getLocalStorageFallback();
}

function getLocalStorageFallback() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageFallback(items) {
  try {
    // Keep max 500 items in localStorage to stay well below 5MB
    const trimmed = items.slice(-500);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Failed to save to localStorage fallback:", e);
  }
}

/**
 * Saves one or multiple assets into the Portfolio Memory database.
 */
export async function saveToPortfolioMemory(assets) {
  const list = Array.isArray(assets) ? assets : [assets];
  if (list.length === 0) return 0;

  const db = await initPortfolioDb();
  const records = [];

  for (const asset of list) {
    if (!asset.pHash) continue;

    let thumb = asset.miniThumbnail || asset.thumbnail;
    const pUrl = asset.previewUrl || asset.metadata?.previewUrl;
    if (!thumb && pUrl) {
      thumb = await generateMiniThumbnail(pUrl);
    }

    records.push({
      id: asset.id || `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: asset.metadata?.filename || asset.filename || "Untitled",
      pHash: asset.pHash,
      fileSize: asset.metadata?.sizeBytes || asset.fileSize || 0,
      megapixels: asset.metadata?.megapixels || asset.megapixels || 0,
      format: asset.metadata?.extension?.toUpperCase() || asset.format || "JPG",
      uploadedAt: asset.uploadedAt || new Date().toISOString(),
      thumbnail: thumb,
      verdictKey: asset.verdict?.key || "READY",
      isChampion: !!asset.isChampion
    });
  }

  if (records.length === 0) return 0;

  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        for (const record of records) {
          store.put(record);
        }

        tx.oncomplete = () => {
          resolve(records.length);
        };

        tx.onerror = () => {
          const current = getLocalStorageFallback();
          const merged = [...current, ...records];
          saveLocalStorageFallback(merged);
          resolve(records.length);
        };
      } catch {
        const current = getLocalStorageFallback();
        const merged = [...current, ...records];
        saveLocalStorageFallback(merged);
        resolve(records.length);
      }
    });
  } else {
    const current = getLocalStorageFallback();
    const merged = [...current, ...records];
    saveLocalStorageFallback(merged);
    return records.length;
  }
}

/**
 * Checks if a given asset matches any historical fingerprint in the portfolio memory.
 * Threshold: dist <= 17 (Similarity >= 73%).
 * dist <= 10 (Similarity >= 84%) triggers high alert.
 * dist == 0 (Exact Duplicate 100%).
 */
export function checkHistoricalDuplicate(asset, historicalList = [], currentBatchIds = new Set()) {
  if (!asset.pHash || !historicalList || historicalList.length === 0) {
    return { isHistoricalDuplicate: false, matchedAsset: null, similarityPercent: 0 };
  }

  let bestMatch = null;
  let minDistance = 999;

  for (const hist of historicalList) {
    // Avoid self-matching if the asset has the same ID or same filename in current batch
    if (currentBatchIds.has(hist.id) || hist.id === asset.id) continue;
    if (!hist.pHash || hist.pHash.length !== 64) continue;

    const dist = hammingDistance(asset.pHash, hist.pHash);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = hist;
    }
  }

  // Distance <= 17 means ~73%+ similarity in 64-bit dHash
  if (minDistance <= 17 && bestMatch) {
    const similarityPercent = Math.max(73, Math.min(100, Math.round((1 - minDistance / 64) * 100)));
    return {
      isHistoricalDuplicate: true,
      similarityPercent,
      distance: minDistance,
      matchedAsset: {
        id: bestMatch.id,
        filename: bestMatch.filename,
        uploadedAt: bestMatch.uploadedAt,
        thumbnail: bestMatch.thumbnail,
        megapixels: bestMatch.megapixels,
        verdictKey: bestMatch.verdictKey,
        isChampion: bestMatch.isChampion
      }
    };
  }

  return { isHistoricalDuplicate: false, matchedAsset: null, similarityPercent: 0 };
}

/**
 * Removes an asset from the portfolio memory by ID.
 */
export async function deleteFromPortfolioMemory(id) {
  const db = await initPortfolioDb();

  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  const current = getLocalStorageFallback();
  const filtered = current.filter(item => item.id !== id);
  saveLocalStorageFallback(filtered);
  return true;
}

/**
 * Clears the entire portfolio memory database.
 */
export async function clearPortfolioMemory() {
  const db = await initPortfolioDb();

  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = () => {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          resolve(true);
        };
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return true;
}

/**
 * Exports historical portfolio memory to a downloadable JSON string.
 */
export async function exportPortfolioMemoryJson() {
  const items = await getAllHistoricalFingerprints();
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    generator: "Stock Curator AI — Portfolio Memory Engine",
    totalAssets: items.length,
    assets: items
  }, null, 2);
}

/**
 * Imports historical fingerprints from a JSON string.
 */
export async function importPortfolioMemoryJson(jsonString) {
  try {
    const parsed = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    const items = Array.isArray(parsed) ? parsed : (parsed.assets || []);
    if (!Array.isArray(items) || items.length === 0) return 0;

    await saveToPortfolioMemory(items);
    return items.length;
  } catch (err) {
    console.error("Failed to import portfolio memory:", err);
    throw new Error("Format berkas cadangan JSON tidak valid.");
  }
}
