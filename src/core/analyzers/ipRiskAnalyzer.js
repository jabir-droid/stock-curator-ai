/**
 * Copyright, Trademark, IP Risk & Model/Property Release Analyzer
 * Calibrated for Adobe Stock standards without false-positive triggers.
 */

const KNOWN_TRADEMARKS = [
  "nike", "adidas", "apple", "iphone", "ipad", "macbook", "samsung", "sony",
  "microsoft", "windows", "xbox", "playstation", "nintendo", "disney", "marvel",
  "star wars", "pokemon", "coca-cola", "pepsi", "starbucks", "mcdonalds",
  "bmw", "mercedes", "audi", "porsche", "ferrari", "tesla", "toyota", "honda",
  "gucci", "louis vuitton", "chanel", "prada", "rolex", "lego", "barbie"
];

const FAMOUS_PROPERTY_KEYWORDS = [
  "eiffel tower", "burj khalifa", "statue of liberty", "sydney opera", "colosseum",
  "taj mahal", "empire state", "sagrada familia", "hollywood sign", "disneyland"
];

const HUMAN_PORTRAIT_KEYWORDS = [
  "portrait", "person", "woman", "man", "girl", "boy", "face", "people",
  "model", "selfie", "human", "worker", "doctor", "chef", "businessman", "businesswoman"
];

const WATERMARK_KEYWORDS = [
  "watermark", "shutterstock", "getty", "istock", "depositphotos", "alamy",
  "dreamstime", "freepik", "copyright", "sample", "preview_watermark"
];

export async function analyzeIpAndReleases(imageSource, metadata) {
  const filename = (metadata.filename || "").toLowerCase();
  const issues = [];
  let riskLevel = "AMAN / RENDAH";
  let modelReleaseRequired = false;
  let propertyReleaseRequired = false;
  let watermarkDetected = false;

  // 1. Trademark / Brand Check in Filename / Metadata
  for (const brand of KNOWN_TRADEMARKS) {
    if (filename.includes(brand)) {
      riskLevel = "TINGGI";
      issues.push({
        priority: "CRITICAL",
        category: "TRADEMARK",
        title: "Potensi masalah merek dagang / hak kekayaan intelektual (IP)",
        detail: `Referensi merek komersial terkenal ('${brand}') terdeteksi pada nama/metadata aset. Seluruh logo dan nama merek komersial wajib dihapus.`
      });
      break;
    }
  }

  // 2. Recognizable Property / Landmark Check
  for (const property of FAMOUS_PROPERTY_KEYWORDS) {
    if (filename.includes(property)) {
      propertyReleaseRequired = true;
      if (riskLevel !== "TINGGI") riskLevel = "SEDANG";
      issues.push({
        priority: "MEDIUM",
        category: "PROPERTY_RELEASE",
        title: "Kemungkinan memerlukan dokumen Rilis Properti",
        detail: `Properti atau landmark arsitektur terkenal ('${property}') teridentifikasi. Pengajuan komersial memerlukan formulir Property Release yang ditandatangani atau klasifikasi Editorial Ilustratif.`
      });
      break;
    }
  }

  // 3. Human / Model Release Check (Keyword-informed, avoids false positives on warm architecture)
  for (const humanKw of HUMAN_PORTRAIT_KEYWORDS) {
    if (filename.includes(humanKw)) {
      modelReleaseRequired = true;
      issues.push({
        priority: "MEDIUM",
        category: "MODEL_RELEASE",
        title: "Potensi memerlukan dokumen Rilis Model (Orang)",
        detail: `Subjek merujuk pada orang/wajah yang dapat dikenali ('${humanKw}'). Jika orang yang digambarkan nyata, formulir Model Release Adobe Stock wajib dilampirkan. Jika karakter fiktif AI, pastikan konfirmasi status fiktif.`
      });
      break;
    }
  }

  // 4. Watermark Check (Filename keywords & explicit corner signature check)
  for (const wkw of WATERMARK_KEYWORDS) {
    if (filename.includes(wkw)) {
      watermarkDetected = true;
      riskLevel = "TINGGI";
      issues.push({
        priority: "CRITICAL",
        category: "WATERMARK",
        title: "Terdeteksi watermark atau stempel agensi stok",
        detail: `Nama aset memuat pengenal watermark/agensi ('${wkw}'). Adobe Stock melarang keras segala bentuk watermark atau tanda air.`
      });
      break;
    }
  }

  // Perform canvas corner scan only if not already flagged and not vector
  if (!watermarkDetected && !metadata.isVector) {
    const cornerScan = await scanImageForDefiniteWatermark(metadata.previewUrl || imageSource);
    if (cornerScan.hasDefiniteWatermark) {
      watermarkDetected = true;
      riskLevel = "TINGGI";
      issues.push({
        priority: "CRITICAL",
        category: "WATERMARK",
        title: "Terdeteksi watermark / tanda tangan kreator pada gambar",
        detail: "Tanda air atau tanda tangan kontras tinggi terdeteksi di sudut gambar. Wajib dibersihkan sebelum diupload."
      });
    }
  }

  const verificationNote = "Tidak dapat diverifikasi secara otomatis 100% — peninjauan manual oleh kontributor atas logo, properti privat, dan rilis model wajib dilakukan.";

  return {
    riskLevel,
    modelReleaseRequired,
    propertyReleaseRequired,
    watermarkDetected,
    issues,
    verificationNote
  };
}

async function scanImageForDefiniteWatermark(previewUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const w = 240;
        const h = 240;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        // Inspect only bottom right 35x35 corner specifically for isolated white/bright text glyph lines
        let extremeContrastGlyphs = 0;
        const cornerSize = 35;

        for (let y = h - cornerSize; y < h - 4; y += 2) {
          for (let x = w - cornerSize; x < w - 4; x += 2) {
            const p = (y * w + x) * 4;
            const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
            const pRight = (y * w + (x + 1)) * 4;
            const lumRight = 0.299 * data[pRight] + 0.587 * data[pRight + 1] + 0.114 * data[pRight + 2];
            
            // Text watermark typically has sharp 120+ luminance jump between letter and dark background
            if (Math.abs(lum - lumRight) > 120 && (lum > 220 || lumRight > 220)) {
              extremeContrastGlyphs++;
            }
          }
        }

        // Conservative threshold to prevent false positives on architecture/windows
        const hasDefiniteWatermark = extremeContrastGlyphs > 45;
        resolve({ hasDefiniteWatermark });
      } catch {
        resolve({ hasDefiniteWatermark: false });
      }
    };
    img.onerror = () => resolve({ hasDefiniteWatermark: false });
    img.src = previewUrl;
  });
}
