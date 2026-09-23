/**
 * Extracts comprehensive technical metadata and file specs
 * without altering or re-compressing the original file.
 * Highly optimized for speed & low memory footprint during batch processing.
 */

export async function readFileMetadata(file, existingPreviewUrl) {
  const extension = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type || getMimeFromExtension(extension);
  const sizeBytes = file.size;
  const sizeMB = Number((sizeBytes / (1024 * 1024)).toFixed(2));

  let width = 0;
  let height = 0;
  let megapixels = 0;
  let colorProfile = "sRGB";
  let isVector = ["svg", "eps", "ai"].includes(extension);
  let vectorDetails = null;
  let previewUrl = existingPreviewUrl || "";
  let formatWarning = null;
  let isNonSubmissionFormat = false;

  // Format compliance check (Section 2)
  if (extension === "webp") {
    isNonSubmissionFormat = true;
    formatWarning = "Format file WebP BUKAN format submission yang diterima oleh Adobe Stock. Adobe Stock hanya menerima JPEG sRGB untuk foto/ilustrasi raster dan AI/EPS/SVG untuk vektor. File ini hanya dapat digunakan sebagai preview lokal.";
  } else if (extension === "png") {
    formatWarning = "Format PNG memiliki batasan di Adobe Stock. Format utama yang direkomendasikan adalah JPEG sRGB atau Vektor AI/EPS/SVG.";
  }

  try {
    if (extension === "svg") {
      const text = await file.text();
      vectorDetails = parseSvgText(text);
      width = vectorDetails.width || 4500;
      height = vectorDetails.height || 3500;
      megapixels = Number(((width * height) / 1000000).toFixed(2));
      colorProfile = vectorDetails.colorMode || "RGB";
      if (!previewUrl) {
        previewUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
      }
    } else if (["eps", "ai"].includes(extension)) {
      const headerSlice = await file.slice(0, 65536).text();
      vectorDetails = parseEpsAiHeader(headerSlice);
      width = vectorDetails.width || 4500;
      height = vectorDetails.height || 3500;
      megapixels = Number(((width * height) / 1000000).toFixed(2));
      colorProfile = vectorDetails.colorMode || "RGB";
      if (!previewUrl) {
        previewUrl = createVectorPreviewPlaceholder(file.name, width, height, vectorDetails);
      }
    } else {
      // Raster: JPEG, PNG, WebP
      if (!previewUrl) {
        previewUrl = URL.createObjectURL(file);
      }

      // 1. Fast dimension reading from previewUrl
      const dims = await getImageDimensions(previewUrl);
      width = dims.width || 0;
      height = dims.height || 0;
      megapixels = Number(((width * height) / 1000000).toFixed(2));

      // 2. Only read first 32KB slice for ICC/EXIF profile (never entire multi-MB file)
      try {
        const sliceBuffer = await file.slice(0, 32768).arrayBuffer();
        const extractedSpecs = extractRasterSpecs(sliceBuffer, extension);
        if (extractedSpecs.colorProfile) {
          colorProfile = extractedSpecs.colorProfile;
        }
      } catch {
        colorProfile = "sRGB";
      }
    }
  } catch (err) {
    console.warn("Metadata extraction fallback for", file.name, err);
    if (!previewUrl) {
      previewUrl = URL.createObjectURL(file);
    }
  }

  const aspectRatio = calculateAspectRatio(width, height);
  const contentTypeData = determineInitialContentType(file.name, isVector, extension);

  return {
    filename: file.name,
    extension,
    mimeType,
    sizeBytes,
    sizeMB,
    width,
    height,
    megapixels,
    aspectRatio,
    colorProfile,
    isVector,
    vectorDetails,
    previewUrl,
    formatWarning,
    isNonSubmissionFormat,
    contentType: contentTypeData.type,
    contentTypeConfidence: contentTypeData.confidence,
    rawFile: file // Pristine original file kept untouched in memory byte-for-byte
  };
}

export function determineInitialContentType(filename, isVector, ext) {
  const lower = filename.toLowerCase();
  if (isVector) {
    return { type: "VECTOR", confidence: "High" };
  }
  if (lower.includes("ai") || lower.includes("mj") || lower.includes("midjourney") || lower.includes("firefly") || lower.includes("flux") || lower.includes("dalle")) {
    return { type: "GENERATIVE AI", confidence: "High" };
  }
  if (lower.includes("illustration") || lower.includes("render") || lower.includes("concept") || lower.includes("3d") || lower.includes("isometric")) {
    return { type: "ILLUSTRATION", confidence: "High" };
  }
  if (lower.includes("photo") || lower.includes("dsc") || lower.includes("img_") || lower.includes("raw")) {
    return { type: "PHOTO", confidence: "Moderate" };
  }
  return { type: "ILLUSTRATION", confidence: "Moderate" };
}

function getMimeFromExtension(ext) {
  switch (ext) {
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml";
    case "eps": return "application/postscript";
    case "ai": return "application/illustrator";
    default: return "application/octet-stream";
  }
}

export function getImageDimensions(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

function extractRasterSpecs(buffer, extension) {
  const view = new DataView(buffer);
  let colorProfile = "sRGB";

  if (extension === "jpg" || extension === "jpeg") {
    let offset = 2;
    const len = buffer.byteLength;
    while (offset < len - 4) {
      if (view.getUint8(offset) === 0xFF) {
        const marker = view.getUint8(offset + 1);
        if (marker === 0xE2) {
          const markerLen = view.getUint16(offset + 2);
          const chunkStr = getAsciiString(view, offset + 4, Math.min(markerLen, 100));
          if (chunkStr.includes("Adobe RGB")) colorProfile = "Adobe RGB (1998)";
          else if (chunkStr.includes("Display P3")) colorProfile = "Display P3";
          else if (chunkStr.includes("sRGB")) colorProfile = "sRGB";
        }
        offset += 2 + view.getUint16(offset + 2);
      } else {
        offset++;
      }
    }
  } else if (extension === "png") {
    if (view.byteLength >= 24 && view.getUint32(0) === 0x89504E47) {
      const textChunk = getAsciiString(view, 0, Math.min(buffer.byteLength, 2048));
      if (textChunk.includes("sRGB")) colorProfile = "sRGB";
      else if (textChunk.includes("iCCP")) colorProfile = "Embedded ICC";
    }
  }

  return { colorProfile };
}

function getAsciiString(view, offset, length) {
  let str = "";
  const end = Math.min(view.byteLength, offset + length);
  for (let i = offset; i < end; i++) {
    const code = view.getUint8(i);
    if (code >= 32 && code <= 126) str += String.fromCharCode(code);
  }
  return str;
}

function parseSvgText(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  let width = 4500;
  let height = 3500;
  let hasRasterImage = false;
  let pathCount = 0;
  let colorMode = "RGB";
  let artboardOffset = { x: 0, y: 0 };
  let isOffsetNonZero = false;

  if (svgEl) {
    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4) {
        artboardOffset.x = parts[0] || 0;
        artboardOffset.y = parts[1] || 0;
        if (artboardOffset.x !== 0 || artboardOffset.y !== 0) {
          isOffsetNonZero = true;
        }
        if (parts[2] > 0 && parts[3] > 0) {
          width = Math.round(parts[2]);
          height = Math.round(parts[3]);
        }
      }
    } else {
      const w = parseFloat(svgEl.getAttribute("width"));
      const h = parseFloat(svgEl.getAttribute("height"));
      if (w > 0) width = Math.round(w);
      if (h > 0) height = Math.round(h);
    }

    hasRasterImage = doc.querySelectorAll("image").length > 0 ||
      svgString.includes("data:image/png") ||
      svgString.includes("data:image/jpeg") ||
      svgString.includes("<image");

    pathCount = doc.querySelectorAll("path, polygon, polyline, circle, rect, ellipse").length;
  }

  return {
    width,
    height,
    hasRasterImage,
    pathCount,
    colorMode,
    artboardOffset,
    isOffsetNonZero
  };
}

function parseEpsAiHeader(headerText) {
  let width = 4500;
  let height = 3500;
  let colorMode = "RGB";
  let hasRaster = false;
  let artboardOffset = { x: 0, y: 0 };
  let isOffsetNonZero = false;

  const bbMatch = headerText.match(/%%BoundingBox:\s*(-?\d+)\s+(-?\d+)\s+(\d+)\s+(\d+)/);
  const hiresMatch = headerText.match(/%%HiResBoundingBox:\s*([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)/);

  if (hiresMatch) {
    const x1 = parseFloat(hiresMatch[1]);
    const y1 = parseFloat(hiresMatch[2]);
    const x2 = parseFloat(hiresMatch[3]);
    const y2 = parseFloat(hiresMatch[4]);
    artboardOffset = { x: x1, y: y1 };
    if (x1 !== 0 || y1 !== 0) isOffsetNonZero = true;
    width = Math.round((x2 - x1) * 4);
    height = Math.round((y2 - y1) * 4);
  } else if (bbMatch) {
    const x1 = parseInt(bbMatch[1], 10);
    const y1 = parseInt(bbMatch[2], 10);
    const x2 = parseInt(bbMatch[3], 10);
    const y2 = parseInt(bbMatch[4], 10);
    artboardOffset = { x: x1, y: y1 };
    if (x1 !== 0 || y1 !== 0) isOffsetNonZero = true;
    width = Math.round((x2 - x1) * 4);
    height = Math.round((y2 - y1) * 4);
  }

  if (headerText.includes("CMYK") && !headerText.includes("RGB")) {
    colorMode = "CMYK";
  }

  if (headerText.includes("%BeginPhotoshop") || headerText.includes("/Image ") || headerText.includes("ImageData")) {
    hasRaster = true;
  }

  return {
    width,
    height,
    colorMode,
    hasRasterImage: hasRaster,
    pathCount: 150,
    artboardOffset,
    isOffsetNonZero
  };
}

function calculateAspectRatio(w, h) {
  if (!w || !h) return "N/A";
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const r = gcd(w, h);
  const rw = w / r;
  const rh = h / r;
  if (rw <= 21 && rh <= 21) {
    return `${rw}:${rh}`;
  }
  const ratio = (w / h).toFixed(2);
  return `${ratio}:1`;
}

function createVectorPreviewPlaceholder(filename, w, h, details) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0c1222";
  ctx.fillRect(0, 0, 600, 400);

  ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 600; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  for (let y = 0; y < 400; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.arc(300, 160, 45, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(280, 140, 40, 40);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px Plus Jakarta Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(filename.split('.').pop().toUpperCase() + " VECTOR ASSET", 300, 240);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px JetBrains Mono, monospace";
  ctx.fillText(`${w} × ${h} px • Artboard (${((w * h)/1000000).toFixed(1)} MP)`, 300, 265);

  return canvas.toDataURL("image/png");
}
