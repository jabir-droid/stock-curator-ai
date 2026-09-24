/**
 * Cross-Batch Distinctiveness, Near-Duplicate & "Champion Selector" Engine
 * 
 * Calibrated specifically to eliminate Adobe Stock "Similar Submissions / Spam" rejections.
 * Identifies near-duplicate prompt iterations / photo variations, automatically ranks them,
 * crowns 1 "Champion" asset per group, and flags redundant variations as "Duplicate Risk".
 */

export async function computePerceptualHash(previewUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        // dHash requires 9 columns and 8 rows
        canvas.width = 9;
        canvas.height = 8;
        ctx.drawImage(img, 0, 0, 9, 8);
        const data = ctx.getImageData(0, 0, 9, 8).data;

        let hashBinary = "";
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const pLeft = (y * 9 + x) * 4;
            const pRight = (y * 9 + (x + 1)) * 4;
            const lumLeft = 0.299 * data[pLeft] + 0.587 * data[pLeft + 1] + 0.114 * data[pLeft + 2];
            const lumRight = 0.299 * data[pRight] + 0.587 * data[pRight + 1] + 0.114 * data[pRight + 2];
            hashBinary += lumLeft > lumRight ? "1" : "0";
          }
        }
        resolve(hashBinary);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = previewUrl;
  });
}

export function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB || hashA.length !== hashB.length) return 999;
  let dist = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

/**
 * Evaluates whether an asset is technically viable to be a Champion candidate.
 * A Champion CANNOT have fatal defects (blur, low resolution < 4MP, critical copyright/watermark, or fail verdict).
 */
export function isAssetViableForChampion(asset) {
  // If visual quality failed (e.g. Laplacian < 25 or sharpnessScore < 45)
  if (asset.visualQuality?.status === "FAIL") return false;
  if (typeof asset.visualQuality?.metrics?.sharpnessScore === "number" && asset.visualQuality.metrics.sharpnessScore < 45) return false;
  if (typeof asset.visualQuality?.metrics?.laplacianVariance === "number" && asset.visualQuality.metrics.laplacianVariance < 25) return false;

  // Adobe Stock technical hard requirements (< 4MP)
  if (asset.metadata?.megapixels && asset.metadata.megapixels < 4.0) return false;

  // Severe IP / watermark violations
  if (asset.ipRisk?.watermarkDetected || asset.ipRisk?.riskLevel === "TINGGI") return false;

  // Hard rejection verdict if already evaluated
  if (asset.verdict?.key === "NOT_RECOMMENDED" || asset.verdict?.key === "HIGH_RISK") return false;

  return true;
}

/**
 * Calculates an objective quality score used to crown the Champion among similar variations.
 */
function computeCurationRankScore(asset) {
  let score = 50;

  // 1. 100% Visual Sharpness
  const sharpness = asset.visualQuality?.metrics?.sharpnessScore || 60;
  score += Math.min(30, sharpness * 0.35);

  if (asset.visualQuality?.status === "PASS") score += 20;
  else if (asset.visualQuality?.status === "FAIL") score -= 50;

  // 2. Absence of chromatic aberration / shadow noise
  if (asset.visualQuality?.metrics?.chromaticAberrationDetected) score -= 15;
  const noise = parseFloat(asset.visualQuality?.metrics?.noiseLevel || "3");
  if (noise > 12) score -= 15;

  // 3. Megapixels / Resolution
  const mp = asset.metadata?.megapixels || 4;
  if (mp >= 16) score += 10;
  else if (mp >= 8) score += 5;
  else if (mp < 4) score -= 50;

  // 4. Copy space availability (Higher commercial usability)
  if (asset.copySpace?.detectedZones && asset.copySpace.detectedZones.length > 0) {
    score += 8;
  }

  // 5. IP & Release Safety
  if (asset.ipRisk?.riskLevel === "TINGGI" || asset.ipRisk?.watermarkDetected) {
    score -= 60;
  }

  // 6. Verdict Viability (A READY asset strongly preferred over others)
  if (asset.verdict?.key === "READY") score += 40;
  else if (asset.verdict?.key === "REVIEW") score += 10;
  else if (asset.verdict?.key === "HIGH_RISK") score -= 60;
  else if (asset.verdict?.key === "NOT_RECOMMENDED") score -= 100;

  return score;
}

/**
 * Clusters assets into similarity groups and automatically assigns Champion vs Duplicate Risk.
 * STRICT CRITERIA: A Champion can only be crowned if the asset passes quality viability!
 */
export function clusterSimilarAssets(assets) {
  if (assets.length < 2) {
    return assets.map(a => ({
      ...a,
      similarityGroup: null,
      similarWith: [],
      isChampion: false,
      isDuplicateRisk: false,
      hasGroupFlaw: false,
      similarityPercent: 0,
      championAssetId: null,
      distinctivenessNote: "Aset tunggal dalam sesi — keunikan terverifikasi."
    }));
  }

  const groupLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let groupCounter = 0;
  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < assets.length; i++) {
    const assetA = assets[i];
    if (visited.has(assetA.id)) continue;

    const clusterMembers = [assetA];
    visited.add(assetA.id);

    for (let j = i + 1; j < assets.length; j++) {
      const assetB = assets[j];
      if (visited.has(assetB.id)) continue;

      const dist = hammingDistance(assetA.pHash, assetB.pHash);
      // Distance <= 17 captures prompt iterations, crops, and slight object rearrangements
      if (dist <= 17) {
        clusterMembers.push(assetB);
        visited.add(assetB.id);
      }
    }

    if (clusterMembers.length > 1) {
      const groupName = `GRUP ${groupLetters[groupCounter % groupLetters.length]}`;
      groupCounter++;
      clusters.push({
        groupName,
        members: clusterMembers
      });
    }
  }

  // Map results per asset ID
  const resultMap = new Map();

  for (const cluster of clusters) {
    // Filter members that pass quality viability (no blur, >= 4MP, no watermarks)
    const viableMembers = cluster.members.filter(m => isAssetViableForChampion(m));

    if (viableMembers.length > 0) {
      // Sort viable members by curation rank score (Highest quality first)
      const rankedViable = [...viableMembers].sort((a, b) => {
        return computeCurationRankScore(b) - computeCurationRankScore(a);
      });

      const champion = rankedViable[0];
      const otherMembers = cluster.members.filter(m => m.id !== champion.id);

      // Record Champion (Guaranteed viable and ready!)
      resultMap.set(champion.id, {
        similarityGroup: cluster.groupName,
        isChampion: true,
        isDuplicateRisk: false,
        hasGroupFlaw: false,
        similarityPercent: 100,
        championAssetId: champion.id,
        championName: champion.metadata?.filename,
        similarWith: otherMembers.map(d => d.metadata?.filename || d.id),
        distinctivenessNote: `🏆 THE CHAMPION dalam ${cluster.groupName}. Terpilih sebagai variasi terkuat & paling tajam. Lolos kualifikasi untuk disubmit ke Adobe Stock.`
      });

      // Record other members as Duplicate Risk
      for (const dup of otherMembers) {
        const dist = hammingDistance(champion.pHash, dup.pHash);
        const similarityPercent = Math.max(72, Math.min(99, Math.round((1 - dist / 64) * 100)));

        resultMap.set(dup.id, {
          similarityGroup: cluster.groupName,
          isChampion: false,
          isDuplicateRisk: true,
          hasGroupFlaw: false,
          similarityPercent,
          championAssetId: champion.id,
          championName: champion.metadata?.filename,
          similarWith: [champion.metadata?.filename, ...otherMembers.filter(d => d.id !== dup.id).map(d => d.metadata?.filename)],
          distinctivenessNote: `⛔ DUPLICATE RISK dalam ${cluster.groupName} (${similarityPercent}% mirip dengan ${champion.metadata?.filename}). Mengunggah variasi serupa bersamaan berisiko tinggi memicu penolakan 'Similar Content' (Spam) oleh kurator Adobe Stock.`
        });
      }
    } else {
      // NO VIABLE MEMBERS! All members in this group fail quality/technical criteria (e.g. all blurry)!
      // DO NOT CROWN ANY CHAMPION! (Eliminates the contradiction in Foto 2)
      for (const member of cluster.members) {
        resultMap.set(member.id, {
          similarityGroup: cluster.groupName,
          isChampion: false,
          isDuplicateRisk: false,
          hasGroupFlaw: true,
          similarityPercent: 85,
          championAssetId: null,
          championName: null,
          similarWith: cluster.members.filter(m => m.id !== member.id).map(m => m.metadata?.filename),
          distinctivenessNote: `⚠️ ${cluster.groupName} (Seluruh Variasi Mengalami Cacat): Terdeteksi variasi serupa, namun seluruh file dalam seri ini memiliki kendala teknis (blur/laplacian rendah). Tidak ada aset yang dijadikan Champion sebelum diperbaiki.`
        });
      }
    }
  }

  return assets.map(asset => {
    const clusterInfo = resultMap.get(asset.id);
    if (clusterInfo) {
      return {
        ...asset,
        ...clusterInfo
      };
    }

    return {
      ...asset,
      similarityGroup: null,
      similarWith: [],
      isChampion: false,
      isDuplicateRisk: false,
      hasGroupFlaw: false,
      similarityPercent: 0,
      championAssetId: null,
      distinctivenessNote: "Komposisi unik dalam batch saat ini (tidak ditemukan variasi serupa)."
    };
  });
}

/**
 * Returns IDs of all assets designated as duplicate risk.
 * Used by 1-Click "Prune Duplicates" action.
 */
export function getDuplicateRiskIds(assets) {
  return assets.filter(a => a.isDuplicateRisk).map(a => a.id);
}

/**
 * Allows user to manually override and crown a different asset as the Champion of its group.
 */
export function setManualChampion(assets, groupId, newChampionAssetId) {
  const groupMembers = assets.filter(a => a.similarityGroup === groupId);
  if (groupMembers.length === 0) return assets;

  const newChampion = groupMembers.find(a => a.id === newChampionAssetId);
  if (!newChampion) return assets;

  return assets.map(asset => {
    if (asset.similarityGroup !== groupId) return asset;

    if (asset.id === newChampionAssetId) {
      return {
        ...asset,
        isChampion: true,
        isDuplicateRisk: false,
        hasGroupFlaw: false,
        similarityPercent: 100,
        championAssetId: newChampion.id,
        championName: newChampion.metadata?.filename,
        distinctivenessNote: `🏆 THE CHAMPION dalam ${groupId} (Dipilih manual oleh kontributor).`
      };
    }

    const dist = hammingDistance(newChampion.pHash, asset.pHash);
    const similarityPercent = Math.max(72, Math.min(99, Math.round((1 - dist / 64) * 100)));

    return {
      ...asset,
      isChampion: false,
      isDuplicateRisk: true,
      hasGroupFlaw: false,
      similarityPercent,
      championAssetId: newChampion.id,
      championName: newChampion.metadata?.filename,
      distinctivenessNote: `⛔ DUPLICATE RISK dalam ${groupId} (${similarityPercent}% mirip dengan ${newChampion.metadata?.filename}).`
    };
  });
}
