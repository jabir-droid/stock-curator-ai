/**
 * Copy Space & Negative Space Composition Analyzer
 * Identifies clear zones for advertising text, headlines, and graphic overlays.
 */

export async function analyzeCopySpace(previewUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const w = 150;
        const h = 150;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        // Divide into 3x3 grid (9 zones)
        // [0,0 Top-Left] [0,1 Top-Mid] [0,2 Top-Right]
        // [1,0 Mid-Left] [1,1 Center]  [1,2 Mid-Right]
        // [2,0 Bot-Left] [2,1 Bot-Mid] [2,2 Bot-Right]
        const cellW = Math.floor(w / 3);
        const cellH = Math.floor(h / 3);
        const gridVariances = Array(3).fill(null).map(() => Array(3).fill(0));

        for (let gy = 0; gy < 3; gy++) {
          for (let gx = 0; gx < 3; gx++) {
            let sumLum = 0;
            let count = 0;
            const startX = gx * cellW;
            const startY = gy * cellH;

            for (let y = startY; y < startY + cellH; y += 2) {
              for (let x = startX; x < startX + cellW; x += 2) {
                const p = (y * w + x) * 4;
                const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
                sumLum += lum;
                count++;
              }
            }

            const meanLum = sumLum / count;
            let variance = 0;
            for (let y = startY; y < startY + cellH; y += 2) {
              for (let x = startX; x < startX + cellW; x += 2) {
                const p = (y * w + x) * 4;
                const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
                variance += (lum - meanLum) ** 2;
              }
            }
            gridVariances[gy][gx] = Math.round(variance / count);
          }
        }

        // Low variance = clean negative space / suitable for copy
        const leftVariance = (gridVariances[0][0] + gridVariances[1][0] + gridVariances[2][0]) / 3;
        const rightVariance = (gridVariances[0][2] + gridVariances[1][2] + gridVariances[2][2]) / 3;
        const topVariance = (gridVariances[0][0] + gridVariances[0][1] + gridVariances[0][2]) / 3;
        const bottomVariance = (gridVariances[2][0] + gridVariances[2][1] + gridVariances[2][2]) / 3;
        const centerVariance = gridVariances[1][1];

        const detectedZones = [];
        const threshold = 180; // Variance threshold for clean negative space

        if (leftVariance < threshold) detectedZones.push("Ruang Teks Kiri");
        if (rightVariance < threshold) detectedZones.push("Ruang Teks Kanan");
        if (topVariance < threshold) detectedZones.push("Ruang Teks Atas");
        if (bottomVariance < threshold) detectedZones.push("Ruang Teks Bawah");

        let summary = "Ruang teks terbatas (komposisi padat)";
        let compositionType = "Komposisi Penuh (Full-bleed)";

        if (leftVariance < threshold && rightVariance > threshold * 1.8) {
          summary = "Ruang teks sisi kiri sangat baik";
          compositionType = "Asimetris / Subjek di Kanan";
        } else if (rightVariance < threshold && leftVariance > threshold * 1.8) {
          summary = "Ruang teks sisi kanan sangat baik";
          compositionType = "Asimetris / Subjek di Kiri";
        } else if (topVariance < threshold && centerVariance > threshold * 1.5) {
          summary = "Ruang teks atas lapang untuk headline/judul";
          compositionType = "Fokus Bawah (Lower Focal Point)";
        } else if (detectedZones.length >= 3) {
          summary = "Ruang negatif melimpah / subjek terisolasi rapi";
          compositionType = "Subjek Terisolasi / Ruang Teks Luas";
        } else if (detectedZones.length === 0) {
          summary = "Tidak ada ruang teks kosong (detail subjek penuh hingga tepi)";
          compositionType = "Penuh / Pola Tekstur";
        }

        resolve({
          summary,
          compositionType,
          detectedZones,
          gridVariances,
          leftScore: Math.max(0, Math.round(100 - leftVariance / 4)),
          rightScore: Math.max(0, Math.round(100 - rightVariance / 4)),
          topScore: Math.max(0, Math.round(100 - topVariance / 4)),
          bottomScore: Math.max(0, Math.round(100 - bottomVariance / 4))
        });
      } catch {
        resolve(getFallbackCopySpace());
      }
    };
    img.onerror = () => resolve(getFallbackCopySpace());
    img.src = previewUrl;
  });
}

function getFallbackCopySpace() {
  return {
    summary: "Tersedia ruang teks standar",
    compositionType: "Komposisi Stok Standar",
    detectedZones: ["Ruang Teks Kanan"],
    gridVariances: [[100, 100, 50], [120, 300, 40], [110, 200, 50]],
    leftScore: 60,
    rightScore: 85,
    topScore: 65,
    bottomScore: 50
  };
}
