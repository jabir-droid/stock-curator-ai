/**
 * Commercial Stock Value Insight
 * Evaluates commercial versatility, advertising copy utility, and market suitability.
 * NOTE: This is NOT an Adobe compliance rule or approval score.
 */

export function analyzeCommercialStockValue(metadata, copySpace, visualQuality) {
  let potentialScore = 75;
  const strengths = [];
  const considerations = [];

  // Copy Space Impact
  if (copySpace.detectedZones && copySpace.detectedZones.length > 0) {
    potentialScore += 10;
    strengths.push(`Ruang teks (copy space) baik: ${copySpace.summary}`);
  } else {
    considerations.push("Ruang latar kosong terbatas untuk penempatan teks judul atau headline desainer.");
  }

  // Megapixels / Resolution Impact
  if (metadata.megapixels >= 16) {
    potentialScore += 10;
    strengths.push(`Fleksibilitas komersial tinggi (${metadata.megapixels} MP mendukung cetak 300 DPI & cropping besar).`);
  } else if (metadata.megapixels < 8) {
    considerations.push("Resolusi cocok untuk web/sosial media, namun kurang optimal untuk cetak skala besar (billboard).");
  }

  // Visual Cleanliness
  if (visualQuality.status === "PASS") {
    potentialScore += 5;
    strengths.push("Visual bersih dengan gangguan artefak minimal.");
  }

  // Vector bonus
  if (metadata.isVector) {
    potentialScore += 10;
    strengths.push("Format vektor memiliki permintaan komersial tinggi karena skalabilitas tanpa batas.");
  }

  let rating = "POTENSI MENENGAH";
  if (potentialScore >= 85) rating = "POTENSI TINGGI";
  else if (potentialScore < 65) rating = "POTENSI TERBATAS";

  return {
    rating,
    disclaimer: "Analisis nilai komersial merupakan diagnostik kegunaan bagi pembeli dan bukan probabilitas penerimaan resmi Adobe Stock.",
    strengths,
    considerations,
    applications: [
      "Pemasaran Digital & Iklan Media Sosial",
      "Banner Website Perusahaan & Gambar Utama",
      "Publikasi Editorial & Ilustrasi Blog",
      metadata.isVector ? "Branding & Cetak Merchandise" : "Mockup Kemasan Produk"
    ]
  };
}
