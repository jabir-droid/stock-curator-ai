/**
 * Cross-Batch Distinctiveness & Near-Duplicate Detector
 * Uses 64-bit Difference Hash (dHash) and color distributions to cluster
 * prompt iterations, crops, and near-identical variations.
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

function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB || hashA.length !== hashB.length) return 999;
  let dist = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

export function clusterSimilarAssets(assets) {
  if (assets.length < 2) {
    return assets.map(a => ({
      ...a,
      similarityGroup: null,
      similarWith: [],
      distinctivenessNote: "Aset tunggal dalam sesi — keunikan terverifikasi."
    }));
  }

  const groupLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let groupCounter = 0;
  const visited = new Set();
  const assetGroups = new Map();
  const similarityWarnings = new Map();

  for (let i = 0; i < assets.length; i++) {
    const assetA = assets[i];
    if (visited.has(assetA.id)) continue;

    const cluster = [assetA.id];
    for (let j = i + 1; j < assets.length; j++) {
      const assetB = assets[j];
      const dist = hammingDistance(assetA.pHash, assetB.pHash);

      // Distance <= 12 indicates very close composition or prompt variation
      if (dist <= 12) {
        cluster.push(assetB.id);
        visited.add(assetB.id);
      }
    }

    if (cluster.length > 1) {
      const groupName = `GRUP ${groupLetters[groupCounter % groupLetters.length]}`;
      groupCounter++;

      for (const id of cluster) {
        assetGroups.set(id, groupName);
        const others = cluster.filter(cId => cId !== id);
        similarityWarnings.set(id, others);
      }
    }
  }

  return assets.map(asset => {
    const group = assetGroups.get(asset.id) || null;
    const similarIds = similarityWarnings.get(asset.id) || [];
    const similarFilenames = similarIds.map(id => {
      const found = assets.find(a => a.id === id);
      return found ? found.metadata.filename : id;
    });

    let distinctivenessNote = "Komposisi unik dalam batch saat ini.";
    if (group) {
      distinctivenessNote = `Bagian dari ${group}. Memiliki kemiripan tinggi dengan ${similarFilenames.length} aset lain (${similarFilenames.slice(0, 2).join(", ")}${similarFilenames.length > 2 ? '...' : ''}). Disarankan hanya mengajukan 1 variasi terkuat untuk menghindari penolakan spam katalog Adobe Stock.`;
    }

    return {
      ...asset,
      similarityGroup: group,
      similarWith: similarFilenames,
      distinctivenessNote
    };
  });
}
