/**
 * Commercial Stock Value & Adobe Market Trend Intelligence Engine
 * 
 * Provides:
 * 1. Commercial versatility & buyer utility rating.
 * 2. Adobe Stock Seasonal Calendar & Submission Lead Time Guidance.
 * 3. Market Saturation (Red Ocean vs Blue Ocean Niche Opportunity).
 * 4. Adobe Creative Trends alignment.
 */

const RED_OCEAN_KEYWORDS = [
  "coffee", "coffee_cup", "handshake", "business_handshake", "flower",
  "rose", "sunset", "cloud", "sky", "isolated_apple", "businessman_smile"
];

const BLUE_OCEAN_KEYWORDS = [
  "telehealth", "telemedicine", "clean_energy", "solar_farm", "wind_turbine",
  "ev_charging", "electric_vehicle", "logistics_warehouse", "smart_farming",
  "cyber_security", "diverse_family", "elderly_active", "ai_robotics",
  "biotechnology", "mental_health", "sustainable_packaging"
];

const ADOBE_CREATIVE_TRENDS = [
  { name: "Authentic Everyday Connection", tag: "Human Diversity & Real Emotion", matchKws: ["family", "community", "candid", "friends", "lifestyle", "emotion"] },
  { name: "Dynamic Tech & Clean Future", tag: "Green Energy & AI Transformation", matchKws: ["energy", "solar", "tech", "data", "robot", "cyber", "ev", "eco"] },
  { name: "Calm Rhythms & Wellness", tag: "Mindfulness & Holistic Health", matchKws: ["yoga", "meditation", "wellness", "spa", "peace", "calm", "nature"] },
  { name: "Bold Heritage & Retro Reboot", tag: "Vintage Aesthetics with Modern Twist", matchKws: ["vintage", "retro", "heritage", "traditional", "artisan", "craft"] }
];

export function analyzeCommercialStockValue(metadata, copySpace, visualQuality) {
  let potentialScore = 75;
  const strengths = [];
  const considerations = [];
  const filename = (metadata.filename || "").toLowerCase();

  // 1. Copy Space Impact (Huge for commercial buyers)
  if (copySpace.detectedZones && copySpace.detectedZones.length > 0) {
    potentialScore += 12;
    strengths.push(`Ruang teks (copy space) ideal: ${copySpace.summary} (Memudahkan desainer meletakkan headline iklan).`);
  } else {
    considerations.push("Ruang latar kosong minim untuk penempatan teks promosi/judul.");
  }

  // 2. Megapixels / Resolution (Supports billboard & cropping)
  if (metadata.megapixels >= 16) {
    potentialScore += 10;
    strengths.push(`Fleksibilitas komersial tinggi (${metadata.megapixels} MP mendukung cetak 300 DPI skala besar & cropping rapat).`);
  } else if (metadata.megapixels < 8) {
    considerations.push("Resolusi ideal untuk media digital/web, namun kurang optimal untuk cetak skala besar (billboard/packaging).");
  }

  // 3. Visual Cleanliness
  if (visualQuality.status === "PASS") {
    potentialScore += 8;
    strengths.push("Visual bersih dengan profil ketajaman 100% dan noise terkontrol.");
  }

  // 4. Vector bonus
  if (metadata.isVector) {
    potentialScore += 10;
    strengths.push("Format vektor memiliki daya tarik komersial tinggi karena skalabilitas tak terbatas.");
  }

  // 5. Market Saturation / Niche Analysis (Red Ocean vs Blue Ocean)
  let marketNiche = {
    type: "STANDARD",
    label: "Permintaan Stabil",
    color: "var(--brand-primary)",
    detail: "Topik memiliki pangsa pasar yang sehat dan stabil di Adobe Stock."
  };

  for (const redKw of RED_OCEAN_KEYWORDS) {
    if (filename.includes(redKw)) {
      potentialScore -= 12;
      marketNiche = {
        type: "RED_OCEAN",
        label: "Pasar Sangat Jenuh (Red Ocean)",
        color: "var(--status-highrisk)",
        detail: `Kata kunci '${redKw}' sudah memiliki ratusan ribu aset serupa di katalog Adobe Stock. Kurator cenderung menolak jika karya tidak menawarkan sudut pandang yang sangat unik.`
      };
      considerations.push(`Topik '${redKw}' berada di pasar yang sangat jenuh; butuh keunikan sudut pandang agar laku.`);
      break;
    }
  }

  for (const blueKw of BLUE_OCEAN_KEYWORDS) {
    if (filename.includes(blueKw)) {
      potentialScore += 15;
      marketNiche = {
        type: "BLUE_OCEAN",
        label: "Peluang Permintaan Tinggi (Blue Ocean)",
        color: "var(--status-ready)",
        detail: `Tema '${blueKw}' dicari oleh pembeli korporat dan agensi internasional dengan suplai berkualitas tinggi yang masih terbatas.`
      };
      strengths.push(`Topik '${blueKw}' masuk dalam kategori permintaan tinggi (Blue Ocean).`);
      break;
    }
  }

  // 6. Seasonal Timing & Lead Time Intelligence
  const currentMonth = new Date().getMonth(); // 0-11
  const seasonalAdvice = getSeasonalSubmissionTiming(filename, currentMonth);

  // 7. Adobe Creative Trend Match
  let matchedTrend = null;
  for (const trend of ADOBE_CREATIVE_TRENDS) {
    if (trend.matchKws.some(kw => filename.includes(kw))) {
      matchedTrend = trend;
      strengths.push(`Selaras dengan Adobe Creative Trend: "${trend.name}".`);
      break;
    }
  }

  let rating = "POTENSI MENENGAH";
  if (potentialScore >= 85) rating = "POTENSI TINGGI";
  else if (potentialScore < 65) rating = "POTENSI TERBATAS";

  return {
    rating,
    score: Math.min(100, Math.max(30, potentialScore)),
    disclaimer: "Analisis potensi komersial mengevaluasi kegunaan bagi pembeli stok (desainer/agensi) berdasarkan tren pasar aktual.",
    marketNiche,
    seasonalAdvice,
    matchedTrend,
    strengths,
    considerations,
    applications: [
      "Kampanye Pemasaran Digital & Social Media Ads",
      "Banner Website Korporat & Hero Image",
      "Publikasi Editorial Jurnalistik & Ilustrasi Blog",
      metadata.isVector ? "Branding Vektor & Merchandise" : "Mockup Kemasan & Desain Cetak"
    ]
  };
}

/**
 * Calculates stock contributor lead times for seasonal events.
 * Microstock buyers purchase assets 60 to 90 days before an event.
 */
function getSeasonalSubmissionTiming(filename, currentMonth) {
  // Calendar definitions: target quarter and ideal upload months
  const seasons = [
    { name: "Tahun Baru & Resolusi Kebugaran (Q1)", kws: ["new year", "workout", "fitness", "resolution", "finance", "tax"], idealMonths: [9, 10, 11] },
    { name: "Paskah & Musim Semi (Q1/Q2)", kws: ["easter", "spring", "ramadan", "eid"], idealMonths: [0, 1, 2] },
    { name: "Liburan Musim Panas & Wisata (Q2)", kws: ["summer", "vacation", "beach", "travel", "holiday"], idealMonths: [2, 3, 4] },
    { name: "Back to School & Musim Gugur (Q3)", kws: ["school", "autumn", "fall", "halloween"], idealMonths: [5, 6, 7] },
    { name: "Black Friday & Belanja Akhir Tahun (Q4)", kws: ["black friday", "cyber monday", "sale", "shopping", "discount"], idealMonths: [7, 8, 9] },
    { name: "Natal & Musim Dingin (Q4)", kws: ["christmas", "xmas", "winter", "snow", "santa"], idealMonths: [8, 9, 10] }
  ];

  for (const s of seasons) {
    if (s.kws.some(kw => filename.includes(kw))) {
      const isOptimalMonth = s.idealMonths.includes(currentMonth);
      return {
        isSeasonal: true,
        eventName: s.name,
        isOptimalTiming: isOptimalMonth,
        statusText: isOptimalMonth
          ? `Waktu Submit Sempurna: Pembeli stok sedang aktif mencari konten ${s.name} saat ini (Lead time 2-3 bulan sebelum musim).`
          : `Info Musiman: Konten bertema ${s.name} paling ideal diunggah 60-90 hari sebelum tanggal perayaan agar sempat terindeks algoritma pencarian Adobe.`
      };
    }
  }

  return {
    isSeasonal: false,
    eventName: "Konten Evergreen",
    isOptimalTiming: true,
    statusText: "Konten bersifat Evergreen (relevan sepanjang tahun tanpa terikat musim tertentu)."
  };
}
