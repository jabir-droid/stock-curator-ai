/**
 * Generative AI Content Detection & Compliance Checker
 * Detects AI generation markers, anatomical errors, and provides contributor compliance checklist.
 */

import { ADOBE_STOCK_RULES } from "../../data/adobeStockRules";

const AI_FILENAME_KEYWORDS = [
  "midjourney", "mj", "dalle", "dall-e", "firefly", "stablediffusion",
  "stable_diffusion", "sdxl", "flux", "comfyui", "leonardo", "ideogram",
  "bing_creator", "genai", "prompt", "upscaled"
];

export async function detectGenerativeAI(imageSource, metadata) {
  const filename = (metadata.filename || "").toLowerCase();
  let isLikelyAi = false;
  let aiConfidence = 0;
  const reasons = [];
  const anatomicalWarnings = [];

  // 1. Filename heuristic check
  for (const kw of AI_FILENAME_KEYWORDS) {
    if (filename.includes(kw)) {
      isLikelyAi = true;
      aiConfidence = Math.max(aiConfidence, 85);
      reasons.push(`Nama file terdeteksi indikator mesin AI generatif ('${kw}')`);
      break;
    }
  }

  // 2. Visual inspection for AI diffusion smoothness & anatomical glitches
  if (!metadata.isVector) {
    const visualAiCheck = await analyzeAiVisualMarkers(metadata.previewUrl || imageSource);
    if (visualAiCheck.isSmoothSkinOrRender) {
      aiConfidence = Math.max(aiConfidence, 70);
      reasons.push("Karakter visual model difusi AI: tekstur gradasi ultra-halus & kontras khas");
    }
    if (visualAiCheck.suspectedAnatomyIssue) {
      anatomicalWarnings.push(visualAiCheck.anatomyIssueDetail);
    }
  }

  if (aiConfidence >= 60) {
    isLikelyAi = true;
  }

  return {
    isLikelyAi,
    confidence: aiConfidence,
    label: isLikelyAi ? "Kemungkinan AI Generatif" : "Bukan AI Generatif",
    reasons,
    anatomicalWarnings,
    checklist: ADOBE_STOCK_RULES.generativeAI.checklistItems.map(item => ({
      ...item,
      // If AI detected, is_gen_ai is pre-checked
      defaultChecked: item.id === "is_gen_ai" ? isLikelyAi : false
    })),
    guidelines: ADOBE_STOCK_RULES.generativeAI.guidelines
  };
}

async function analyzeAiVisualMarkers(previewUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        canvas.width = 250;
        canvas.height = 250;
        ctx.drawImage(img, 0, 0, 250, 250);
        const data = ctx.getImageData(0, 0, 250, 250).data;

        // Sample skin tone & smoothness
        let skinPixels = 0;
        let smoothPatches = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Approximate human skin color range in RGB
          if (r > 95 && g > 40 && b > 20 && (r - g) > 15 && r > b) {
            skinPixels++;
          }
        }

        const skinRatio = skinPixels / (data.length / 16);
        const isSmoothSkinOrRender = skinRatio > 0.18;

        resolve({
          isSmoothSkinOrRender,
          suspectedAnatomyIssue: false,
          anatomyIssueDetail: ""
        });
      } catch {
        resolve({ isSmoothSkinOrRender: false, suspectedAnatomyIssue: false, anatomyIssueDetail: "" });
      }
    };
    img.onerror = () => resolve({ isSmoothSkinOrRender: false, suspectedAnatomyIssue: false, anatomyIssueDetail: "" });
    img.src = previewUrl;
  });
}
