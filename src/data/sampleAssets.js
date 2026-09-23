/**
 * Pre-configured Curated Sample Datasets for Testing & Demonstration
 * Generates realistic Adobe Stock assets that accurately demonstrate:
 * - Clean 3D illustrations & cityscapes (Likely Ready)
 * - Similar batch variations / prompt iterations (GROUP A & GROUP B)
 * - AI generation with watermark (High Risk)
 * - Commercial trademark IP issue (High Risk)
 * - Low-resolution asset < 4 MP (Not Recommended)
 * - Clean scalable vector (Likely Ready)
 */

export async function generateSampleAssets() {
  const samples = [
    {
      name: "future_city_hero_refined_57.jpg",
      type: "image/jpeg",
      width: 2752,
      height: 1536, // 4.23 MP (matches user screenshot)
      draw: (ctx, w, h) => {
        // Futuristic green eco-city with sunlight
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        sky.addColorStop(0, "#bae6fd");
        sky.addColorStop(0.5, "#fef08a");
        sky.addColorStop(1, "#f97316");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // Sun glow
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.45, 120, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fill();

        // City skyline silhouettes & buildings
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, h * 0.48, w * 0.35, h * 0.52);
        ctx.fillRect(w * 0.65, h * 0.45, w * 0.35, h * 0.55);

        // Bridge & river
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(w * 0.35, h * 0.6, w * 0.3, h * 0.4);
      }
    },
    {
      name: "smart_city_infrastructure_concept_55_2.jpg",
      type: "image/jpeg",
      width: 2752,
      height: 1536, // 4.23 MP (matches user screenshot)
      draw: (ctx, w, h) => {
        // Modern glass office desk overlooking night city
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, "#090d16");
        bg.addColorStop(0.6, "#1e1b4b");
        bg.addColorStop(1, "#0f172a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Glass prisms & desk tablets
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(w * 0.25, h * 0.7);
        ctx.lineTo(w * 0.45, h * 0.4);
        ctx.lineTo(w * 0.65, h * 0.7);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(w * 0.2, h * 0.6, w * 0.6, h * 0.35);
      }
    },
    {
      name: "smart_city_infrastructure_concept_55_1.jpg",
      type: "image/jpeg",
      width: 2752,
      height: 1536, // 4.23 MP (Prompt iteration of #2 -> GROUP B)
      draw: (ctx, w, h) => {
        // Slight variation of the glass office desk
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, "#090d16");
        bg.addColorStop(0.6, "#1e1b4b");
        bg.addColorStop(1, "#0f172a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Same glass prisms with minor angle shift
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(w * 0.27, h * 0.69);
        ctx.lineTo(w * 0.47, h * 0.39);
        ctx.lineTo(w * 0.67, h * 0.69);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(w * 0.22, h * 0.6, w * 0.58, h * 0.35);
      }
    },
    {
      name: "sustainable_city_concept_miniature_54.jpg",
      type: "image/jpeg",
      width: 2752,
      height: 1536, // 4.23 MP (Similar to #1 -> GROUP A)
      draw: (ctx, w, h) => {
        // Eco miniature architecture
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        sky.addColorStop(0, "#bae6fd");
        sky.addColorStop(0.5, "#fef08a");
        sky.addColorStop(1, "#f97316");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, h * 0.49, w * 0.36, h * 0.51);
        ctx.fillRect(w * 0.64, h * 0.46, w * 0.36, h * 0.54);

        ctx.fillStyle = "#0284c7";
        ctx.fillRect(w * 0.36, h * 0.6, w * 0.28, h * 0.4);
      }
    },
    {
      name: "cyberpunk_ai_character_watermark.jpg",
      type: "image/jpeg",
      width: 3200,
      height: 2400, // 7.68 MP
      draw: (ctx, w, h) => {
        // Dark neon portrait with simulated watermark
        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, "#090d16");
        bg.addColorStop(1, "#311042");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 280, 0, Math.PI * 2);
        ctx.fillStyle = "#ec4899";
        ctx.fill();

        // Watermark text in bottom right corner
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px sans-serif";
        ctx.fillText("© 2026 AI-ARTIST.STUDIO - DO NOT COPY", w - 650, h - 35);
      }
    },
    {
      name: "apple_iphone_desk_commercial_mockup.jpg",
      type: "image/jpeg",
      width: 3000,
      height: 2000, // 6 MP
      draw: (ctx, w, h) => {
        // Clean desk with Apple trademark reference
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(w * 0.35, h * 0.2, w * 0.3, h * 0.6);
      }
    },
    {
      name: "vintage_coffee_retro_lowres.jpg",
      type: "image/jpeg",
      width: 1200,
      height: 1200, // 1.44 MP (< 4 MP threshold)
      draw: (ctx, w, h) => {
        ctx.fillStyle = "#451a03";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fef3c7";
        ctx.font = "bold 60px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("VINTAGE ROAST", w / 2, h / 2);
      }
    },
    {
      name: "isometric_smart_grid_network.svg",
      type: "image/svg+xml",
      content: createSvgSampleContent(5000, 4000, "Vektor Arsitektural Bersih", "#6366f1", "#06b6d4")
    }
  ];

  const generatedFiles = [];

  for (const sample of samples) {
    if (sample.type === "image/svg+xml") {
      const blob = new Blob([sample.content], { type: "image/svg+xml" });
      const file = new File([blob], sample.name, { type: "image/svg+xml", lastModified: Date.now() });
      generatedFiles.push(file);
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = sample.width;
      canvas.height = sample.height;
      const ctx = canvas.getContext("2d");
      sample.draw(ctx, sample.width, sample.height);

      const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.95));
      const file = new File([blob], sample.name, { type: "image/jpeg", lastModified: Date.now() });
      generatedFiles.push(file);
    }
  }

  return generatedFiles;
}

function createSvgSampleContent(w, h, title, c1, c2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="#0b0f19"/>
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <g fill="none" stroke="url(#g1)" stroke-width="5">
      <circle cx="${w/2}" cy="${h/2}" r="1200"/>
      <polygon points="${w/2},${h/2-800} ${w/2+700},${h/2+400} ${w/2-700},${h/2+400}"/>
      <rect x="${w/2-500}" y="${h/2-500}" width="1000" height="1000" rx="40"/>
    </g>
    <text x="${w/2}" y="${h/2+700}" font-family="Plus Jakarta Sans, sans-serif" font-size="80" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${title}
    </text>
  </svg>`;
}
