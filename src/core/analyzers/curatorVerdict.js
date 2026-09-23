/**
 * Final Curator Verdict & Multi-Dimensional Diagnostic Engine
 * Accurately calibrated to official Adobe Stock curator standards.
 */

import { ADOBE_STOCK_RULES } from "../../data/adobeStockRules";

export function evaluateCuratorVerdict({
  metadata,
  visualQuality,
  aiDetection,
  ipRisk,
  copySpace,
  commercialValue,
  similarityGroup,
  isIllustrativeEditorial = false
}) {
  const issues = [];
  const pros = [];
  const recommendedActions = [];

  // 1. Technical Checks
  let techScore = 100;
  let hardReject = false;

  // Format compliance (Section 2)
  if (metadata.isNonSubmissionFormat || metadata.extension === "webp") {
    techScore -= 60;
    hardReject = true;
    issues.push({
      priority: "CRITICAL",
      category: "TECHNICAL",
      title: "Format WebP bukan format submission resmi Adobe Stock",
      detail: "Adobe Stock tidak menerima format WebP untuk submission kontributor. File WebP hanya berguna untuk preview peramban lokal dan akan ditolak oleh sistem moderasi."
    });
    recommendedActions.push("Ekspor ulang aset dalam format JPEG standar (sRGB) dengan resolusi minimal 4 MP.");
  } else if (metadata.extension === "png") {
    techScore -= 20;
    issues.push({
      priority: "HIGH",
      category: "TECHNICAL",
      title: "Format PNG memiliki batasan di Adobe Stock",
      detail: "Adobe Stock hanya menerima PNG pada kategori terbatas (seperti ilustrasi transparansi tertentu). Format submission utama adalah JPEG sRGB atau Vektor SVG/AI/EPS."
    });
    recommendedActions.push("Konversikan ke format JPEG sRGB kecuali jika aset secara eksplisit memerlukan transparansi latar belakang khusus.");
  }

  if (!metadata.isVector) {
    // Raster Illustration / Photo Checks
    if (metadata.megapixels < ADOBE_STOCK_RULES.illustrationJpeg.minMegapixels) {
      techScore -= 50;
      hardReject = true;
      issues.push({
        priority: "CRITICAL",
        category: "TECHNICAL",
        title: `Resolusi terlalu rendah (${metadata.megapixels} MP)`,
        detail: `Adobe Stock mewajibkan resolusi minimal 4 Megapixels. Ukuran saat ini adalah ${metadata.megapixels} MP.`
      });
      recommendedActions.push("Render ulang atau ekspor dengan dimensi lebih besar (minimal 2000×2000px = 4 MP).");
    } else if (metadata.megapixels > ADOBE_STOCK_RULES.illustrationJpeg.maxMegapixels) {
      techScore -= 30;
      issues.push({
        priority: "HIGH",
        category: "TECHNICAL",
        title: `Resolusi melampaui batas maksimum (${metadata.megapixels} MP)`,
        detail: `Batas maksimal Adobe Stock adalah 100 MP.`
      });
      recommendedActions.push("Kecilkan resolusi kanvas di bawah 100 MP.");
    } else {
      pros.push(`Resolusi memenuhi standar Adobe (${metadata.megapixels} MP).`);
    }

    if (metadata.sizeBytes > ADOBE_STOCK_RULES.illustrationJpeg.maxFileSizeBytes) {
      techScore -= 50;
      hardReject = true;
      issues.push({
        priority: "CRITICAL",
        category: "TECHNICAL",
        title: `Ukuran file melebihi 45 MB (${metadata.sizeMB} MB)`,
        detail: `Adobe Stock memiliki batas upload maksimal 45 MB.`
      });
      recommendedActions.push("Kurangi kualitas ekspor agar di bawah 45 MB.");
    } else {
      pros.push(`Ukuran file aman (${metadata.sizeMB} MB < 45 MB).`);
    }

    if (metadata.colorProfile && metadata.colorProfile.includes("CMYK")) {
      techScore -= 20;
      issues.push({
        priority: "MEDIUM",
        category: "TECHNICAL",
        title: "Profil warna non-sRGB (CMYK)",
        detail: "Disarankan konversi ke sRGB IEC61966-2.1 sebelum submit."
      });
      recommendedActions.push("Konversi profil warna ke sRGB.");
    } else {
      pros.push("Profil warna kompatibel (sRGB).");
    }
  } else {
    // Vector Specific Checks (15 MP – 65 MP artboard, offset 0,0, RGB, no rasters)
    if (metadata.megapixels < ADOBE_STOCK_RULES.vector.minArtboardMP) {
      techScore -= 45;
      hardReject = true;
      issues.push({
        priority: "CRITICAL",
        category: "TECHNICAL",
        title: `Artboard vektor di bawah batas minimal (${metadata.megapixels} MP)`,
        detail: `Adobe Stock mewajibkan artboard vektor memiliki resolusi antara 15 MP hingga 65 MP (contoh: 4000×4000px = 16 MP). Resolusi artboard saat ini: ${metadata.megapixels} MP.`
      });
      recommendedActions.push("Perbesar ukuran artboard vektor di Illustrator minimal 15 MP (misal 5000×3500px).");
    } else if (metadata.megapixels > ADOBE_STOCK_RULES.vector.maxArtboardMP) {
      techScore -= 30;
      issues.push({
        priority: "HIGH",
        category: "TECHNICAL",
        title: `Artboard vektor melampaui batas maksimal 65 MP (${metadata.megapixels} MP)`,
        detail: "Batas maksimal artboard vektor Adobe Stock adalah 65 MP."
      });
      recommendedActions.push("Kecilkan ukuran artboard vektor agar di bawah 65 MP.");
    } else {
      pros.push(`Artboard vektor memenuhi standar ukuran Adobe Stock (${metadata.megapixels} MP).`);
    }

    if (metadata.sizeBytes > ADOBE_STOCK_RULES.vector.maxFileSizeBytes) {
      techScore -= 50;
      hardReject = true;
      issues.push({
        priority: "CRITICAL",
        category: "TECHNICAL",
        title: `Ukuran file vektor melebihi 45 MB (${metadata.sizeMB} MB)`,
        detail: "Batas maksimal file upload Adobe Stock adalah 45 MB."
      });
      recommendedActions.push("Sederhanakan path/anchor points atau bersihkan layer tidak terpakai.");
    }

    if (metadata.vectorDetails?.isOffsetNonZero) {
      techScore -= 20;
      issues.push({
        priority: "MEDIUM",
        category: "TECHNICAL",
        title: "Artboard offset tidak berada pada koordinat (0, 0)",
        detail: `Adobe Stock mewajibkan artboard vektor ditempatkan pada koordinat awal X:0, Y:0. Terdeteksi offset pada (${metadata.vectorDetails.artboardOffset.x}, ${metadata.vectorDetails.artboardOffset.y}).`
      });
      recommendedActions.push("Posisikan kembali artboard ke offset X:0, Y:0 di Adobe Illustrator.");
    } else {
      pros.push("Koordinat artboard tepat di offset (0, 0).");
    }

    if (metadata.vectorDetails?.hasRasterImage) {
      techScore -= 45;
      hardReject = true;
      issues.push({
        priority: "CRITICAL",
        category: "TECHNICAL",
        title: "Terdapat elemen bitmap raster dalam vektor",
        detail: "Adobe Stock mewajibkan elemen vektor murni tanpa raster bitmap atau embedded PNG/JPEG."
      });
      recommendedActions.push("Hapus elemen raster atau lakukan vector trace.");
    } else {
      pros.push("Vektor murni tanpa elemen raster bitmap.");
    }

    if (metadata.vectorDetails?.colorMode === "CMYK") {
      techScore -= 15;
      issues.push({
        priority: "MEDIUM",
        category: "TECHNICAL",
        title: "Vektor dalam mode warna CMYK",
        detail: "Ubah document color mode ke RGB di Adobe Illustrator sebelum submit."
      });
      recommendedActions.push("Ubah color mode dokumen ke RGB di Illustrator.");
    } else {
      pros.push("Mode warna vektor kompatibel (RGB).");
    }
  }

  // 2. Visual Quality Checks
  let visualScore = 95;
  if (visualQuality.issues) {
    for (const vIssue of visualQuality.issues) {
      if (vIssue.priority === "HIGH") visualScore -= 25;
      else if (vIssue.priority === "MEDIUM") visualScore -= 10;
      issues.push({
        priority: vIssue.priority,
        category: "VISUAL_QUALITY",
        title: vIssue.text,
        detail: vIssue.detail
      });
    }
  }
  if (visualQuality.status === "PASS") {
    pros.push("Ketajaman dan kualitas piksel lulus inspeksi kurator.");
  }

  // 3. IP, Trademark & Release Safety
  let ipScore = 100;
  let hasCriticalIp = false;

  if (ipRisk.watermarkDetected) {
    ipScore -= 50;
    hasCriticalIp = true;
    issues.push({
      priority: "CRITICAL",
      category: "WATERMARK",
      title: "Watermark / Tanda air terdeteksi",
      detail: "Adobe Stock melarang keras watermark, timestamp, tanda tangan, atau handle medsos pada aset submission."
    });
    recommendedActions.push("Hapus seluruh watermark atau tanda air sebelum upload.");
  }

  if (ipRisk.issues) {
    for (const ipIssue of ipRisk.issues) {
      if (ipIssue.category === "TRADEMARK") {
        ipScore -= 40;
        hasCriticalIp = true;
        issues.push(ipIssue);
        recommendedActions.push("Hilangkan logo atau nama merek terdaftar dari visual dan metadata.");
      } else if (ipIssue.category === "PROPERTY_RELEASE") {
        ipScore -= 20;
        issues.push({
          ...ipIssue,
          detail: ipIssue.detail + " — Tidak dapat diverifikasi otomatis 100% — wajib peninjauan manual oleh kontributor."
        });
        recommendedActions.push("Lampirkan Property Release untuk properti/arsitektur terkenal, atau submit sebagai Illustrative Editorial jika memenuhi syarat.");
      } else if (ipIssue.category === "MODEL_RELEASE") {
        ipScore -= 20;
        issues.push({
          ...ipIssue,
          detail: ipIssue.detail + " — Tidak dapat diverifikasi otomatis 100% — wajib peninjauan manual oleh kontributor."
        });
        recommendedActions.push("Lampirkan Model Release untuk orang yang dapat dikenali, atau konfirmasi karakter AI fiktif.");
      }
    }
  }

  if (!hasCriticalIp && !ipRisk.modelReleaseRequired) {
    pros.push("Tidak ada watermark atau pelanggaran IP komersial yang terdeteksi.");
  }

  // 4. Generative AI Guidelines
  if (aiDetection.isLikelyAi) {
    pros.push("Konten AI terdeteksi: pastikan menandai opsi 'Created using generative AI tools' saat submit.");
    if (aiDetection.anatomicalWarnings?.length > 0) {
      for (const w of aiDetection.anatomicalWarnings) {
        issues.push({
          priority: "HIGH",
          category: "GEN_AI",
          title: "Potensi distorsi anatomi AI",
          detail: `${w} — Tidak dapat diverifikasi otomatis 100% — wajib peninjauan manual oleh kontributor.`
        });
      }
      recommendedActions.push("Perbaiki bagian anatomi (tangan, jari, atau wajah) yang mengalami artefak AI.");
    }
  }

  // 5. Distinctiveness & Cross-Batch Similarity
  let distinctScore = 100;
  if (similarityGroup) {
    distinctScore = 60;
    issues.push({
      priority: "MEDIUM",
      category: "DISTINCTIVENESS",
      title: `Memiliki kemiripan tinggi dengan aset lain (${similarityGroup})`,
      detail: "Mengupload terlalu banyak variasi prompt serupa berisiko ditolak karena spam katalog Adobe Stock."
    });
    recommendedActions.push("Pilih hanya 1 variasi terkuat dalam similarity group ini untuk disubmit.");
  } else {
    pros.push("Komposisi unik dan tidak memiliki duplikat repetitif dalam batch.");
  }

  // 6. Commercial Utility
  let commercialScore = 85;
  if (commercialValue?.rating === "HIGH POTENTIAL") commercialScore = 95;
  else if (commercialValue?.rating === "LIMITED POTENTIAL") commercialScore = 65;

  // Order Issues by Priority
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  issues.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Determine Final Verdict
  let verdict = ADOBE_STOCK_RULES.verdicts.READY;
  let verdictReason = "Aset memenuhi persyaratan teknis Adobe Stock tanpa pelanggaran kritis.";

  if (hardReject) {
    verdict = ADOBE_STOCK_RULES.verdicts.NOT_RECOMMENDED;
    verdictReason = "Melanggar batas wajib Adobe Stock (resolusi, format non-submission, atau ukuran file).";
  } else if (hasCriticalIp) {
    verdict = ADOBE_STOCK_RULES.verdicts.HIGH_RISK;
    verdictReason = "Risiko penolakan tinggi terdeteksi (watermark atau merek/logo terdaftar).";
  } else if (issues.some(i => i.priority === "HIGH")) {
    verdict = ADOBE_STOCK_RULES.verdicts.HIGH_RISK;
    verdictReason = "Dibutuhkan perbaikan visual atau kelengkapan rilis hak cipta.";
  } else if (aiDetection.isLikelyAi || similarityGroup || isIllustrativeEditorial || issues.some(i => i.priority === "MEDIUM")) {
    verdict = ADOBE_STOCK_RULES.verdicts.REVIEW;
    verdictReason = "Disarankan pengecekan ulang (checklist kepatuhan AI atau variasi serupa dalam batch).";
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push("Aset dalam kondisi baik. Periksa kembali judul dan kata kunci sebelum upload.");
  }

  return {
    verdict,
    verdictReason,
    pros,
    issues,
    recommendedActions,
    diagnosticMeters: {
      technical: Math.max(10, Math.min(100, techScore)),
      visual: Math.max(10, Math.min(100, visualScore)),
      ipSafety: Math.max(10, Math.min(100, ipScore)),
      distinctiveness: Math.max(10, Math.min(100, distinctScore)),
      commercialUtility: Math.max(10, Math.min(100, commercialScore))
    }
  };
}
