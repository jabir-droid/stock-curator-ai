/**
 * Final Curator Verdict & Multi-Dimensional Diagnostic Engine
 * Accurately calibrated to official Adobe Stock curator standards.
 * 
 * UPGRADED:
 * - Anti-Rejection Shield: Zero-tolerance for Similar Submissions & 100% Pixel Quality issues.
 * - Strictness Mode ("BALANCED" vs "STRICT_ADOBE").
 * - Official Adobe Stock Rejection Code mapping.
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
  isChampion = false,
  isDuplicateRisk = false,
  similarityPercent = 0,
  championName = "",
  isHistoricalDuplicate = false,
  historicalMatch = null,
  historicalPercent = 0,
  isIllustrativeEditorial = false,
  strictnessMode = "BALANCED" // "BALANCED" | "STRICT_ADOBE"
}) {
  const issues = [];
  const pros = [];
  const recommendedActions = [];
  const adobeRejectionCodes = [];

  const isStrict = strictnessMode === "STRICT_ADOBE";

  // 1. Technical Checks
  let techScore = 100;
  let hardReject = false;

  // Format compliance
  if (metadata.isNonSubmissionFormat || metadata.extension === "webp") {
    techScore -= 60;
    hardReject = true;
    issues.push({
      priority: "CRITICAL",
      category: "TECHNICAL",
      adobeCode: "Technical File Requirements",
      title: "Format WebP bukan format submission resmi Adobe Stock",
      detail: "Adobe Stock tidak menerima format WebP untuk submission kontributor. File WebP hanya berguna untuk preview peramban lokal dan akan ditolak otomatis oleh sistem moderasi."
    });
    adobeRejectionCodes.push("Technical File Requirements (Non-supported format)");
    recommendedActions.push("Ekspor ulang aset dalam format JPEG standar (sRGB) dengan resolusi minimal 4 MP.");
  } else if (metadata.extension === "png") {
    techScore -= 20;
    issues.push({
      priority: "HIGH",
      category: "TECHNICAL",
      adobeCode: "Technical File Requirements",
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
        adobeCode: "Technical Quality Issues",
        title: `Resolusi terlalu rendah (${metadata.megapixels} MP)`,
        detail: `Adobe Stock mewajibkan resolusi minimal 4 Megapixels. Ukuran saat ini adalah ${metadata.megapixels} MP.`
      });
      adobeRejectionCodes.push("Technical Quality Issues (Resolution under 4 MP)");
      recommendedActions.push("Render ulang atau ekspor dengan dimensi lebih besar (minimal 2000×2000px = 4 MP).");
    } else if (metadata.megapixels > ADOBE_STOCK_RULES.illustrationJpeg.maxMegapixels) {
      techScore -= 30;
      issues.push({
        priority: "HIGH",
        category: "TECHNICAL",
        adobeCode: "Technical Quality Issues",
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
        adobeCode: "Technical File Requirements",
        title: `Ukuran file melebihi 45 MB (${metadata.sizeMB} MB)`,
        detail: `Adobe Stock memiliki batas upload maksimal 45 MB.`
      });
      adobeRejectionCodes.push("Technical File Requirements (File size > 45 MB)");
      recommendedActions.push("Kurangi kualitas ekspor agar di bawah 45 MB.");
    } else {
      pros.push(`Ukuran file aman (${metadata.sizeMB} MB < 45 MB).`);
    }

    if (metadata.colorProfile && metadata.colorProfile.includes("CMYK")) {
      techScore -= 20;
      issues.push({
        priority: "MEDIUM",
        category: "TECHNICAL",
        adobeCode: "Technical File Requirements",
        title: "Profil warna non-sRGB (CMYK)",
        detail: "Disarankan konversi ke sRGB IEC61966-2.1 sebelum submit."
      });
      recommendedActions.push("Konversi profil warna ke sRGB.");
    } else {
      pros.push("Profil warna kompatibel (sRGB).");
    }
  } else {
    // Vector Specific Checks
    if (metadata.megapixels < ADOBE_STOCK_RULES.vector.minArtboardMP) {
      techScore -= 45;
      hardReject = true;
      issues.push({
        priority: "CRITICAL",
        category: "TECHNICAL",
        adobeCode: "Vector Technical Requirements",
        title: `Artboard vektor di bawah batas minimal (${metadata.megapixels} MP)`,
        detail: `Adobe Stock mewajibkan artboard vektor memiliki resolusi antara 15 MP hingga 65 MP. Resolusi saat ini: ${metadata.megapixels} MP.`
      });
      adobeRejectionCodes.push("Vector Technical Requirements (Artboard < 15 MP)");
      recommendedActions.push("Perbesar ukuran artboard vektor di Illustrator minimal 15 MP (misal 5000×3500px).");
    } else {
      pros.push(`Artboard vektor memenuhi standar ukuran Adobe Stock (${metadata.megapixels} MP).`);
    }

    if (metadata.vectorDetails?.hasRasterImage) {
      techScore -= 45;
      hardReject = true;
      issues.push({
        priority: "CRITICAL",
        category: "TECHNICAL",
        adobeCode: "Vector Technical Requirements",
        title: "Terdapat elemen bitmap raster dalam vektor",
        detail: "Adobe Stock mewajibkan elemen vektor murni tanpa raster bitmap atau embedded PNG/JPEG."
      });
      adobeRejectionCodes.push("Vector Technical Requirements (Embedded raster bitmap)");
      recommendedActions.push("Hapus elemen raster atau lakukan vector trace.");
    }
  }

  // 2. Visual Quality Checks (100% Native Pixel Inspection)
  let visualScore = 95;
  if (visualQuality.issues) {
    for (const vIssue of visualQuality.issues) {
      let priority = vIssue.priority;
      // In STRICT_ADOBE mode, micro-blur or heavy noise is non-negotiable
      if (isStrict && vIssue.priority === "HIGH") {
        priority = "CRITICAL";
      }

      if (priority === "CRITICAL") {
        visualScore -= 35;
        adobeRejectionCodes.push(vIssue.adobeCode || "Technical Quality Issues");
      } else if (priority === "HIGH") {
        visualScore -= 22;
        adobeRejectionCodes.push(vIssue.adobeCode || "Technical Quality Issues");
      } else if (priority === "MEDIUM") {
        visualScore -= 10;
      }

      issues.push({
        priority,
        category: vIssue.category || "VISUAL_QUALITY",
        adobeCode: vIssue.adobeCode || "Technical Quality Issues",
        title: vIssue.text,
        detail: vIssue.detail
      });

      if (vIssue.text.includes("blur") || vIssue.text.includes("Ketajaman 100%")) {
        recommendedActions.push("Lakukan re-shoot dengan shutter speed lebih tinggi atau tingkatkan ketajaman dengan AI unblur selektif pada subjek.");
      }
      if (vIssue.text.includes("Chromatic Aberration")) {
        recommendedActions.push("Gunakan fitur 'Remove Chromatic Aberration' (Defringe) di Adobe Lightroom/Photoshop Camera Raw.");
      }
      if (vIssue.text.includes("Noise")) {
        recommendedActions.push("Aplikasikan reduksi noise luminansi halus pada area bayangan gelap (shadows).");
      }
    }
  }
  if (visualQuality.status === "PASS") {
    pros.push("Uji ketajaman 100% dan profil noise lulus inspeksi kurator.");
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
      adobeCode: "Intellectual Property / Watermark",
      title: "Watermark / Tanda air terdeteksi",
      detail: "Adobe Stock melarang keras watermark, timestamp, tanda tangan, atau handle medsos pada aset submission."
    });
    adobeRejectionCodes.push("Intellectual Property / Watermark Violation");
    recommendedActions.push("Hapus seluruh watermark atau tanda air sebelum upload.");
  }

  if (ipRisk.issues) {
    for (const ipIssue of ipRisk.issues) {
      if (ipIssue.category === "TRADEMARK") {
        ipScore -= 40;
        hasCriticalIp = true;
        issues.push({
          ...ipIssue,
          adobeCode: "Intellectual Property / Trademark"
        });
        adobeRejectionCodes.push("Intellectual Property (Recognizable trademark/brand)");
        recommendedActions.push("Hilangkan logo atau nama merek terdaftar dari visual dan metadata.");
      } else if (ipIssue.category === "PROPERTY_RELEASE") {
        ipScore -= 20;
        issues.push({
          ...ipIssue,
          adobeCode: "Property Release Required",
          detail: ipIssue.detail + " — Wajib konfirmasi kelengkapan rilis oleh kontributor."
        });
        recommendedActions.push("Lampirkan Property Release untuk arsitektur terkenal, atau submit sebagai Illustrative Editorial jika memenuhi syarat.");
      } else if (ipIssue.category === "MODEL_RELEASE") {
        ipScore -= 20;
        issues.push({
          ...ipIssue,
          adobeCode: "Model Release Required",
          detail: ipIssue.detail + " — Wajib konfirmasi kelengkapan rilis oleh kontributor."
        });
        recommendedActions.push("Lampirkan Model Release untuk orang nyata, atau konfirmasi karakter AI fiktif.");
      }
    }
  }

  if (!hasCriticalIp && !ipRisk.modelReleaseRequired) {
    pros.push("Bebas dari watermark, logo merek, atau pelanggaran IP komersial terdeteksi.");
  }

  // 4. Generative AI Guidelines
  if (aiDetection.isLikelyAi) {
    pros.push("Konten AI: Pastikan mencentang kotak 'Created using generative AI tools' saat submit.");
    if (aiDetection.anatomicalWarnings?.length > 0) {
      for (const w of aiDetection.anatomicalWarnings) {
        issues.push({
          priority: isStrict ? "CRITICAL" : "HIGH",
          category: "GEN_AI",
          adobeCode: "Non-Compliant Generative AI",
          title: "Distorsi anatomi AI generatif",
          detail: `${w} — Kurator Adobe sangat teliti menolak cacat jari, mata, dan gigi pada gambar AI.`
        });
        adobeRejectionCodes.push("Non-Compliant Generative AI (Anatomical flaw)");
      }
      recommendedActions.push("Perbaiki bagian anatomi (tangan, jari, atau wajah) yang mengalami artefak AI.");
    }
  }

  // 5. ANTI-REJECTION SHIELD: Distinctiveness & Champion / Duplicate / Historical Analysis
  let distinctScore = 100;

  if (isHistoricalDuplicate && historicalMatch) {
    distinctScore = 10;
    const dateFormatted = historicalMatch.uploadedAt
      ? new Date(historicalMatch.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "sesi sebelumnya";

    issues.push({
      priority: "CRITICAL",
      category: "HISTORICAL_DUPLICATE",
      adobeCode: "Similar Submissions (Prior Upload)",
      title: `⛔ Terdeteksi Duplikat dari Riwayat Sebelumnya (${historicalPercent}% mirip)`,
      detail: `Gambar ini memiliki kemiripan ${historicalPercent}% dengan file '${historicalMatch.filename}' yang telah Anda unggah pada ${dateFormatted}. Adobe Stock melarang pengunggahan variasi serupa dari portofolio lama Anda karena memicu penolakan kurator: 'Similar Submissions' (Spam).`
    });
    adobeRejectionCodes.push("Similar Submissions (Prior Portfolio Duplicate)");
    recommendedActions.push(`Singkirkan file ini dari submission saat ini. File '${historicalMatch.filename}' sudah pernah ada di riwayat submission Anda.`);
  } else if (isChampion) {
    pros.push(`🏆 TERPILIH SEBAGAI CHAMPION dalam ${similarityGroup || 'Grup'}: Variasi paling tajam & berkualitas tertinggi untuk disubmit.`);
    distinctScore = 98;
  } else if (isDuplicateRisk) {
    distinctScore = isStrict ? 25 : 50;
    const priority = isStrict ? "CRITICAL" : "HIGH";

    issues.push({
      priority,
      category: "SIMILAR_SUBMISSIONS",
      adobeCode: "Similar Submissions (Spam)",
      title: `Terdeteksi Duplikat Berisiko (${similarityPercent}% mirip dengan ${championName || 'Champion'})`,
      detail: `Gambar ini merupakan variasi dari ${similarityGroup || 'seri serupa'}. Mengunggahnya bersamaan dengan ${championName || 'karya utama'} hampir pasti memicu penolakan kurator: 'Similar Submissions' karena dianggap membanjiri katalog.`
    });
    adobeRejectionCodes.push("Similar Submissions (Excessive near-duplicate variations)");
    recommendedActions.push(`Pangkas / Arsipkan variasi ini. Hanya submit variasi Champion (${championName || 'utama'}) untuk melindungi reputasi akun kontributor Anda.`);
  } else if (similarityGroup) {
    distinctScore = 65;
    issues.push({
      priority: "MEDIUM",
      category: "DISTINCTIVENESS",
      adobeCode: "Similar Submissions",
      title: `Memiliki kemiripan dengan aset lain (${similarityGroup})`,
      detail: "Pastikan sudut atau konsep cerita memiliki perbedaan signifikan sebelum diunggah."
    });
  } else {
    pros.push("Komposisi unik dan tidak memiliki duplikat repetitif dalam batch maupun riwayat.");
  }

  // 6. Commercial Utility
  let commercialScore = 85;
  if (commercialValue?.rating === "POTENSI TINGGI" || commercialValue?.rating === "HIGH POTENTIAL") commercialScore = 95;
  else if (commercialValue?.rating === "POTENSI TERBATAS" || commercialValue?.rating === "LIMITED POTENTIAL") commercialScore = 65;

  // Order Issues by Priority
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  issues.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Determine Final Verdict
  let verdict = ADOBE_STOCK_RULES.verdicts.READY;
  let verdictReason = isChampion
    ? `🏆 The Champion (${similarityGroup || 'Seri'}): Karya terkuat dalam variasinya dan memenuhi seluruh standar teknis Adobe Stock. Siap untuk disubmit!`
    : "Aset memenuhi standar kualitas teknis dan kepatuhan Adobe Stock. Siap untuk disubmit.";

  if (hardReject) {
    verdict = ADOBE_STOCK_RULES.verdicts.NOT_RECOMMENDED;
    verdictReason = "Melanggar batas wajib Adobe Stock (resolusi < 4MP, format non-submission, atau ukuran file).";
  } else if (isHistoricalDuplicate) {
    verdict = ADOBE_STOCK_RULES.verdicts.NOT_RECOMMENDED;
    verdictReason = `[Proteksi Spam Portofolio] Terdeteksi kemiripan ${historicalPercent}% dengan file '${historicalMatch?.filename || 'sebelumnya'}' yang pernah diunggah. Dilarang submit ulang untuk melindungi reputasi akun Anda.`;
  } else if (hasCriticalIp) {
    verdict = ADOBE_STOCK_RULES.verdicts.HIGH_RISK;
    verdictReason = "Risiko penolakan tinggi terdeteksi (watermark atau merek/logo terdaftar).";
  } else if (isDuplicateRisk && isStrict) {
    verdict = ADOBE_STOCK_RULES.verdicts.NOT_RECOMMENDED;
    verdictReason = `[Mode Kurator Ketat] Ditandai Duplikat Berisiko (${similarityPercent}% mirip dengan ${championName || 'Champion'}). Dilarang submit bersamaan untuk mencegah penalti Similar Content.`;
  } else if (issues.some(i => i.priority === "CRITICAL")) {
    verdict = ADOBE_STOCK_RULES.verdicts.HIGH_RISK;
    verdictReason = "Terdeteksi cacat kualitas kritis (blur pada zoom 100% atau resolusi di bawah batas wajib). Wajib diperbaiki sebelum submit.";
  } else if (issues.some(i => i.priority === "HIGH")) {
    verdict = ADOBE_STOCK_RULES.verdicts.HIGH_RISK;
    verdictReason = "Dibutuhkan perbaikan visual atau penyempurnaan artefak teknis sebelum submit.";
  } else if (aiDetection.isLikelyAi || (similarityGroup && !isChampion) || isIllustrativeEditorial || issues.some(i => i.priority === "MEDIUM")) {
    verdict = ADOBE_STOCK_RULES.verdicts.REVIEW;
    verdictReason = isChampion
      ? `⭐ Pilihan Utama Seri (${similarityGroup || 'Koleksi'}): Dari seluruh variasi serupa, ini adalah karya terbaik untuk diunggah. Pastikan melengkapi checklist kepatuhan AI / rilis sebelum submit.`
      : "Disarankan pengecekan ulang (checklist kepatuhan AI atau variasi serupa dalam batch).";
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push("Aset dalam kondisi prima. Periksa kembali judul dan kata kunci sebelum upload.");
  }

  return {
    verdict,
    verdictReason,
    pros,
    issues,
    recommendedActions,
    adobeRejectionCodes: [...new Set(adobeRejectionCodes)],
    strictnessMode,
    diagnosticMeters: {
      technical: Math.max(10, Math.min(100, techScore)),
      visual: Math.max(10, Math.min(100, visualScore)),
      ipSafety: Math.max(10, Math.min(100, ipScore)),
      distinctiveness: Math.max(10, Math.min(100, distinctScore)),
      commercialUtility: Math.max(10, Math.min(100, commercialScore))
    }
  };
}
