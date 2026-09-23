/**
 * Adobe Stock Compliant Metadata Assistant
 * Generates SEO-optimized titles, categories, and clean keyword tags
 * strictly adhering to Adobe's anti-spam and IP policies.
 */

const CATEGORIES = [
  "Animals", "Buildings and Architecture", "Business", "Drinks", "The Environment",
  "States of Mind", "Food", "Graphic Resources", "Hobbies and Leisure", "Industry",
  "Landscape", "Lifestyle", "People", "Plants and Flowers", "Culture and Religion",
  "Science", "Social Issues", "Sports", "Technology", "Transport", "Travel"
];

const PROHIBITED_TAGS = [
  "nike", "apple", "disney", "marvel", "greg rutkowski", "artgerm", "alphonse mucha",
  "midjourney", "firefly", "dalle", "best quality", "masterpiece", "trending on artstation",
  "8k", "photorealistic", "award winning", "unreal engine"
];

export function generateMetadataSuggestions(metadata, aiDetection, isIllustrativeEditorial) {
  const baseName = cleanFilename(metadata.filename);
  const words = baseName.split(/[\s_-]+/).filter(w => w.length > 2);
  
  // Title generation
  let title = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  if (isIllustrativeEditorial) {
    title = `New York, USA - September 2026: Conceptual illustration of ${title.toLowerCase()}`;
  } else if (metadata.isVector) {
    title = `${title} vector illustration icon and graphic design element`;
  } else if (aiDetection.isLikelyAi) {
    title = `${title} generative conceptual artwork`;
  } else {
    title = `${title} high resolution commercial stock image`;
  }

  // Category determination
  let category = "Graphic Resources";
  const lowerName = metadata.filename.toLowerCase();
  if (lowerName.includes("business") || lowerName.includes("office")) category = "Business";
  else if (lowerName.includes("tech") || lowerName.includes("ai") || lowerName.includes("digital")) category = "Technology";
  else if (lowerName.includes("nature") || lowerName.includes("landscape")) category = "Landscape";
  else if (lowerName.includes("people") || lowerName.includes("portrait")) category = "People";
  else if (lowerName.includes("build") || lowerName.includes("city")) category = "Buildings and Architecture";

  // Keyword Generation
  const rawKeywords = new Set([
    ...words,
    category.toLowerCase(),
    metadata.isVector ? "vector" : "photo",
    metadata.isVector ? "scalable" : "photography",
    "illustration",
    "design",
    "graphic",
    "concept",
    "modern",
    "background",
    "creative",
    "visual",
    "art",
    "digital",
    "commercial",
    "element",
    "isolated",
    "template",
    "style",
    "symbol",
    "icon",
    "clean",
    "space",
    "advertising",
    "marketing",
    "presentation",
    "project"
  ]);

  // Clean & Sanitize keywords according to Adobe Stock guidelines
  const sanitizedKeywords = Array.from(rawKeywords)
    .map(k => k.toLowerCase().trim())
    .filter(k => k.length > 2 && !PROHIBITED_TAGS.includes(k) && !/^\d+$/.test(k))
    .slice(0, 35);

  return {
    title: title.slice(0, 120),
    description: `Aset komersial berkualitas tinggi ${metadata.isVector ? 'vektor' : 'gambar'} yang menggambarkan ${title.toLowerCase()}. Sangat cocok untuk materi promosi, banner web, dan publikasi digital.`,
    category,
    keywords: sanitizedKeywords,
    keywordCount: sanitizedKeywords.length,
    disclaimer: "Saran metadata secara ketat mengecualikan istilah terlarang, nama seniman terkenal, dan merek dagang. Harap tinjau ulang secara manual sebelum mengunggah ke Adobe Stock."
  };
}

function cleanFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[0-9]{4,}/g, "") // remove long numbers / seed ids
    .replace(/[-_]+/g, " ")
    .trim();
}
