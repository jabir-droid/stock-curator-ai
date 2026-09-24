import React, { useState } from "react";
import {
  ArrowLeft, Download, Trash2, CheckCircle2, AlertTriangle, AlertOctagon,
  XCircle, Sparkles, Copy, Check, Eye, EyeOff,
  RotateCw, CheckCheck, FileDown, Trophy, ShieldAlert, ZoomIn, Compass,
  Calendar, Flame, TrendingUp, Database
} from "lucide-react";
import { CopySpaceOverlay } from "./CopySpaceOverlay";
import { generateMetadataSuggestions } from "../core/metadata/metadataGenerator";

export function AssetDetailModal({
  asset,
  onClose,
  onDownloadOriginal,
  onDeleteAsset,
  onUpdateNotes,
  onToggleEditorialMode,
  onToggleReviewed,
  onReanalyzeSingle,
  onSetManualChampion
}) {
  const [showCopySpaceOverlay, setShowCopySpaceOverlay] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [aiChecklistState, setAiChecklistState] = useState(asset?.aiChecklistState || {});
  const [activeLoupeCrop, setActiveLoupeCrop] = useState("center"); // "center" | "corner" | "shadow"
  const [loupeZoom, setLoupeZoom] = useState(1); // 1 = 100%, 2 = 200%

  if (!asset) return null;

  const {
    metadata, verdict, pros, issues, recommendedActions,
    diagnosticMeters, copySpace, commercialValue, aiDetection,
    ipRisk, visualQuality, curatorNotes, isReviewed,
    isChampion, isDuplicateRisk, similarityGroup, similarityPercent, championName,
    isHistoricalDuplicate, historicalMatch, historicalPercent
  } = asset;

  const metadataSuggestions = generateMetadataSuggestions(metadata, aiDetection, asset.isIllustrativeEditorial);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllMetadata = () => {
    const formatted = `Title: ${metadataSuggestions.title}\nCategory: ${metadataSuggestions.category}\nDescription: ${metadataSuggestions.description}\nKeywords: ${metadataSuggestions.keywords.join(", ")}`;
    handleCopy(formatted, "all");
  };

  const handleChecklistChange = (id, checked) => {
    const updated = { ...aiChecklistState, [id]: checked };
    setAiChecklistState(updated);
    asset.aiChecklistState = updated;
  };

  const handleDownloadSingleReport = () => {
    const reportData = {
      filename: metadata.filename,
      contentType: metadata.contentType,
      resolution: `${metadata.width}x${metadata.height}`,
      megapixels: metadata.megapixels,
      sizeMB: metadata.sizeMB,
      colorProfile: metadata.colorProfile,
      verdict: verdict?.label,
      adobeRejectionCodes: verdict?.adobeRejectionCodes || [],
      isChampion: !!isChampion,
      isDuplicateRisk: !!isDuplicateRisk,
      similarityGroup: similarityGroup || null,
      diagnosticMeters,
      whyFactors: pros,
      issuesDetected: issues,
      recommendedActions,
      curatorNotes: curatorNotes || "",
      isReviewed: !!isReviewed,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `curator_audit_${metadata.filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const loupePreview = visualQuality?.loupePreview;
  const currentLoupeDataUrl = activeLoupeCrop === "corner"
    ? loupePreview?.cornerDataUrl
    : activeLoupeCrop === "shadow"
    ? loupePreview?.shadowDataUrl
    : loupePreview?.centerDataUrl;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="detail-top-nav">
          <div className="detail-nav-left">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <ArrowLeft size={15} />
              <span>Kembali</span>
            </button>
            <span className="detail-filename" title={metadata.filename}>
              {metadata.filename}
            </span>
            <span className={`badge ${verdict?.badgeClass}`}>
              {verdict?.label}
            </span>
            {isChampion && (
              <span
                className="badge"
                style={{
                  background: verdict?.key === "READY"
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(245, 158, 11, 0.2)",
                  color: verdict?.key === "READY" ? "#10b981" : "#f59e0b",
                  border: `1px solid ${verdict?.key === "READY" ? "#10b981" : "#f59e0b"}`,
                  gap: "3px"
                }}
              >
                <Trophy size={11} />
                <span>
                  {verdict?.key === "READY"
                    ? "The Champion (Siap Submit)"
                    : "Pilihan Seri (Perlu Review)"}
                </span>
              </span>
            )}
            {isDuplicateRisk && (
              <span className="badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid #ef4444" }}>
                ⛔ Duplikat ({similarityPercent}%)
              </span>
            )}
            {isHistoricalDuplicate && (
              <span className="badge" style={{ background: "rgba(124, 58, 237, 0.2)", color: "#c4b5fd", border: "1px solid rgba(167, 139, 250, 0.5)", gap: "3px" }}>
                <Database size={11} />
                <span>Duplikat Riwayat ({historicalPercent}%)</span>
              </span>
            )}
            {isReviewed && (
              <span className="badge badge-ready">
                <CheckCheck size={12} /> Sudah Ditinjau
              </span>
            )}
          </div>

          <div className="detail-nav-actions">
            <button
              className={`btn btn-sm ${isReviewed ? "btn-secondary" : "btn-outline"}`}
              onClick={() => onToggleReviewed && onToggleReviewed(asset.id)}
              title="Tandai aset sudah ditinjau secara manual"
            >
              <CheckCheck size={14} style={{ color: isReviewed ? "var(--status-ready)" : "inherit" }} />
              <span>{isReviewed ? "Sudah Ditinjau" : "Tandai Sudah Ditinjau"}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onReanalyzeSingle && onReanalyzeSingle(asset.id)}
              title="Analisis ulang aset ini dengan 100% Pixel Inspection"
            >
              <RotateCw size={14} />
              <span>Analisis Ulang</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadSingleReport}
              title="Unduh laporan audit JSON"
            >
              <FileDown size={14} />
              <span>Laporan JSON</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => onDownloadOriginal(asset)}
              title="Unduh file asli tanpa perubahan byte"
            >
              <Download size={14} />
              <span>Unduh File Asli</span>
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDeleteAsset(asset)}
              title="Hapus aset dari sesi kurasi"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Split Body */}
        <div className="detail-split-body">
          {/* Left Pane: Preview Canvas, 100% Loupe & Technical Details */}
          <div className="detail-left-pane">
            <div className="detail-preview-container">
              <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", maxHeight: "100%" }}>
                <img
                  src={metadata.previewUrl}
                  alt={metadata.filename}
                  className="detail-main-img"
                />
                {showCopySpaceOverlay && (
                  <CopySpaceOverlay copySpace={copySpace} />
                )}
              </div>

              {/* Toolbar */}
              <div className="preview-toolbar">
                <button
                  className={`btn btn-sm ${showCopySpaceOverlay ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
                  onClick={() => setShowCopySpaceOverlay(!showCopySpaceOverlay)}
                >
                  {showCopySpaceOverlay ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showCopySpaceOverlay ? "Sembunyikan Kisi Ruang Teks" : "Tampilkan Kisi Ruang Teks (Copy Space)"}</span>
                </button>
              </div>
            </div>

            {/* UPGRADE: SIMULASI ZOOM 100% KURATOR ADOBE (1:1 NATIVE PIXEL INSPECTOR) */}
            {!metadata.isVector && (
              <div className="glass-card" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "rgba(15, 23, 42, 0.6)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.78rem", color: "#38bdf8" }}>
                    <ZoomIn size={14} />
                    <span>SIMULASI ZOOM 100% KURATOR ADOBE (Inspeksi Piksel 1:1)</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button
                      className={`btn btn-sm ${loupeZoom === 1 ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "0.15rem 0.4rem", fontSize: "0.68rem" }}
                      onClick={() => setLoupeZoom(1)}
                    >
                      100%
                    </button>
                    <button
                      className={`btn btn-sm ${loupeZoom === 2 ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "0.15rem 0.4rem", fontSize: "0.68rem" }}
                      onClick={() => setLoupeZoom(2)}
                    >
                      200%
                    </button>
                  </div>
                </div>

                {/* Spot selector tabs */}
                <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.5rem" }}>
                  <button
                    className={`btn btn-sm ${activeLoupeCrop === "center" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem", flex: 1 }}
                    onClick={() => setActiveLoupeCrop("center")}
                  >
                    Titik Subjek (Pusat)
                  </button>
                  <button
                    className={`btn btn-sm ${activeLoupeCrop === "corner" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem", flex: 1 }}
                    onClick={() => setActiveLoupeCrop("corner")}
                  >
                    Sudut Lensa (Corner)
                  </button>
                  <button
                    className={`btn btn-sm ${activeLoupeCrop === "shadow" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem", flex: 1 }}
                    onClick={() => setActiveLoupeCrop("shadow")}
                  >
                    Area Bayangan (Shadow)
                  </button>
                </div>

                {/* Crop view container */}
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div
                    style={{
                      width: "128px",
                      height: "128px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: "2px solid #38bdf8",
                      background: "#000",
                      flexShrink: 0,
                      position: "relative"
                    }}
                  >
                    {currentLoupeDataUrl ? (
                      <img
                        src={currentLoupeDataUrl}
                        alt="100% pixel crop"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: loupeZoom === 2 ? "scale(1.8)" : "scale(1)",
                          transformOrigin: "center center",
                          imageRendering: "pixelated"
                        }}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "0.68rem", color: "var(--text-tertiary)" }}>
                        Memuat crop 100%...
                      </div>
                    )}
                    <span style={{ position: "absolute", bottom: "3px", right: "3px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "0.6rem", padding: "1px 4px", borderRadius: "2px" }}>
                      {loupeZoom * 100}%
                    </span>
                  </div>

                  {/* Diagnostic metrics on 100% scale */}
                  <div style={{ fontSize: "0.72rem", display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Ketajaman Tepi (Laplacian 100%):</span>
                      <strong style={{ color: visualQuality?.metrics?.sharpnessScore > 50 ? "var(--status-ready)" : "var(--status-notrec)" }}>
                        {visualQuality?.metrics?.sharpnessScore || 0} ({visualQuality?.metrics?.sharpness100Status === "PASS" ? "TAJAM" : "BURAM/LEMBUT"})
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Chromatic Aberration:</span>
                      <strong style={{ color: visualQuality?.metrics?.chromaticAberrationDetected ? "var(--status-notrec)" : "var(--status-ready)" }}>
                        {visualQuality?.metrics?.chromaticAberrationDetected ? "TERDETEKSI BIAS UNGU" : "BERSIH"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Noise Bayangan (Shadow Grain):</span>
                      <strong style={{ color: parseFloat(visualQuality?.metrics?.noiseLevel || 0) > 12 ? "var(--status-review)" : "var(--status-ready)" }}>
                        {visualQuality?.metrics?.noiseLevel || "0.0"} dB
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Tekstur AI (Waxy Skin Check):</span>
                      <strong style={{ color: visualQuality?.metrics?.aiWaxyTextureDetected ? "var(--status-review)" : "var(--status-ready)" }}>
                        {visualQuality?.metrics?.aiWaxyTextureDetected ? "TERLALU LICIN (PLASTIK)" : "ALAMI"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Specifications Bar */}
            <div className="detail-specs-bar">
              <div className="spec-item">
                <span className="spec-label">Format / Tipe</span>
                <span className="spec-value">{metadata.extension.toUpperCase()} ({metadata.contentType || "Raster"})</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Dimensi Piksel</span>
                <span className="spec-value">{metadata.width} × {metadata.height} px</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Megapiksel</span>
                <span className="spec-value">{metadata.megapixels} MP</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Ukuran File</span>
                <span className="spec-value">{metadata.sizeMB} MB</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Rasio Aspek</span>
                <span className="spec-value">{metadata.aspectRatio}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Ruang Warna</span>
                <span className="spec-value">{metadata.colorProfile}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Klasifikasi Konten</span>
                <span className="spec-value">{metadata.contentType || "ILUSTRASI"}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Integritas File Asli</span>
                <span className="spec-value" style={{ color: "var(--status-ready)" }}>Terjaga 100% (Byte-Asli)</span>
              </div>
            </div>
          </div>

          {/* Right Pane: Curator Inspection & Deep-Dive Analysis */}
          <div className="detail-right-pane">
            {/* Verdict Banner */}
            <div
              className="verdict-banner"
              style={{
                borderColor: verdict?.color || "var(--brand-primary)",
                background: `linear-gradient(135deg, ${verdict?.color}14, transparent)`
              }}
            >
              <div className="verdict-header">
                <div className="verdict-title" style={{ color: verdict?.color }}>
                  {verdict?.key === "READY" && <CheckCircle2 size={20} />}
                  {verdict?.key === "REVIEW" && <AlertTriangle size={20} />}
                  {verdict?.key === "HIGH_RISK" && <AlertOctagon size={20} />}
                  {verdict?.key === "NOT_RECOMMENDED" && <XCircle size={20} />}
                  <span>{verdict?.label}</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700 }}>
                  PRA-MODERASI ADOBE STOCK
                </span>
              </div>
              <p className="verdict-desc">{asset.verdictReason}</p>
            </div>

            {/* HISTORICAL DUPLICATE WARNING CARD */}
            {isHistoricalDuplicate && historicalMatch && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "0.85rem 1.1rem",
                  background: "rgba(124, 58, 237, 0.12)",
                  border: "1px solid rgba(167, 139, 250, 0.45)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Database size={22} style={{ color: "#a78bfa", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#c4b5fd", fontSize: "0.85rem", display: "block" }}>
                      DUPLIKAT DARI RIWAYAT PORTOFOLIO SEBELUMNYA ({historicalPercent}% MIRIP)
                    </strong>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                      Sistem mendeteksi bahwa aset ini memiliki kemiripan sangat tinggi dengan gambar yang pernah Anda unggah pada sesi sebelumnya.
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "rgba(0, 0, 0, 0.35)",
                    padding: "0.55rem 0.8rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  {historicalMatch.thumbnail ? (
                    <img
                      src={historicalMatch.thumbnail}
                      alt={historicalMatch.filename}
                      style={{ width: "46px", height: "46px", borderRadius: "4px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)" }}
                    />
                  ) : (
                    <div style={{ width: "46px", height: "46px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Database size={18} style={{ color: "var(--text-tertiary)" }} />
                    </div>
                  )}
                  <div style={{ fontSize: "0.75rem", flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      File Asal: {historicalMatch.filename}
                    </div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "0.7rem", marginTop: "2px" }}>
                      Diunggah pada: {historicalMatch.uploadedAt ? new Date(historicalMatch.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Sesi Terdahulu"}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#fca5a5", lineHeight: "1.4" }}>
                  ⚠️ <strong>Peringatan Anti-Spam Adobe Stock:</strong> Mengunggah kembali variasi yang serupa dengan portofolio lama Anda berisiko memicu penolakan kurator <em>"Similar Submissions / Spam"</em> dan dapat menurunkan peringkat akun kontributor.
                </div>
              </div>
            )}

            {/* UPGRADE: CHAMPION VS DUPLICATE RISK ACTION CARD */}
            {isChampion && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "0.75rem 1rem",
                  background: verdict?.key === "READY"
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(245, 158, 11, 0.12)",
                  border: `1px solid ${verdict?.key === "READY" ? "#10b981" : "#f59e0b"}`,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.8rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Trophy size={20} style={{ color: verdict?.key === "READY" ? "#10b981" : "#f59e0b", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: verdict?.key === "READY" ? "#10b981" : "#f59e0b", fontSize: "0.82rem", display: "block" }}>
                      {verdict?.key === "READY"
                        ? `🏆 THE CHAMPION (${similarityGroup || 'Seri'}) — SIAP SUBMIT`
                        : `⭐ PILIHAN UTAMA SERI (${similarityGroup || 'Seri'}) — PERLU REVIEW`}
                    </strong>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                      {verdict?.key === "READY"
                        ? "Variasi terkuat dalam seri ini dan telah lolos 100% persyaratan teknis Adobe Stock. Sangat direkomendasikan untuk disubmit."
                        : "Karya ini merupakan variasi terbaik di antara duplikat serupa yang diunggah. Sebelum disubmit, pastikan melengkapi checklist kepatuhan AI atau rilis."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {similarityGroup && !isChampion && !isDuplicateRisk && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem"
                }}
              >
                <AlertTriangle size={18} style={{ color: "#f87171", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#fca5a5", fontSize: "0.8rem", display: "block" }}>
                    SERI {similarityGroup} — BELUM MEMILIKI CHAMPION
                  </strong>
                  <span style={{ fontSize: "0.73rem", color: "var(--text-secondary)" }}>
                    Seluruh foto dalam grup ini memiliki kendala teknis (blur / laplacian rendah). Tidak ada variasi yang dinobatkan sebagai Champion sampai salah satu diperbaiki pada zoom 100%.
                  </span>
                </div>
              </div>
            )}

            {isDuplicateRisk && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.8rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <ShieldAlert size={20} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#ef4444", fontSize: "0.82rem", display: "block" }}>
                      DUPLIKAT BERISIKO ({similarityPercent}% mirip dengan {championName || 'Champion'})
                    </strong>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                      Mengunggah variasi ini bersamaan hampir pasti ditolak dengan alasan <em>'Similar Submissions / Spam'</em>.
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem", flexShrink: 0, borderColor: "#f59e0b", color: "#f59e0b" }}
                  onClick={() => onSetManualChampion && onSetManualChampion(similarityGroup, asset.id)}
                  title="Pilih aset ini sebagai Champion pengganti untuk seri ini"
                >
                  <Trophy size={12} />
                  <span>Jadikan Champion</span>
                </button>
              </div>
            )}

            {/* UPGRADE: OFFICIAL ADOBE STOCK REJECTION CODES WARNING */}
            {verdict?.adobeRejectionCodes?.length > 0 && (
              <div
                className="glass-card"
                style={{
                  padding: "0.65rem 0.9rem",
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.4)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f87171", fontWeight: 700, fontSize: "0.75rem", marginBottom: "0.3rem" }}>
                  <AlertOctagon size={13} />
                  <span>POTENSI KODE PENOLAKAN RESMI ADOBE STOCK:</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {verdict.adobeRejectionCodes.map((code, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#fca5a5",
                        fontSize: "0.68rem",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "3px",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        fontWeight: 600
                      }}
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic Meters */}
            <div className="curator-why-box">
              <div className="box-title">
                <span>Kartu Skor Diagnostik Kepatuhan</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontWeight: 400 }}>
                  (Evaluasi multi-dimensi Adobe Stock)
                </span>
              </div>
              <div className="diagnostic-meters-section">
                <DiagnosticMeterRow label="Kepatuhan Teknis" score={diagnosticMeters?.technical || 90} color="var(--brand-primary)" />
                <DiagnosticMeterRow label="Kualitas Visual 100% Skala Asli" score={diagnosticMeters?.visual || 85} color="var(--status-info)" />
                <DiagnosticMeterRow label="Keamanan Hak Cipta & Dokumen Rilis" score={diagnosticMeters?.ipSafety || 95} color="var(--status-ready)" />
                <DiagnosticMeterRow label="Keunikan & Anti-Spam (Similar)" score={diagnosticMeters?.distinctiveness || 90} color="var(--status-review)" />
                <DiagnosticMeterRow label="Kegunaan Komersial Stok" score={diagnosticMeters?.commercialUtility || 85} color="var(--status-ready)" />
              </div>
            </div>

            {/* WHY? Section */}
            <div className="curator-why-box">
              <div className="box-title">
                <CheckCircle2 size={14} style={{ color: "var(--status-ready)" }} />
                <span>Mengapa? (Faktor Utama Moderasi)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {pros?.map((pro, idx) => (
                  <div key={idx} className="why-item">
                    <CheckCircle2 size={13} className="why-icon-pass" />
                    <span>{pro}</span>
                  </div>
                ))}
                {issues?.map((issue, idx) => (
                  <div key={idx} className="why-item">
                    {issue.priority === "CRITICAL" ? (
                      <XCircle size={13} className="why-icon-fail" />
                    ) : (
                      <AlertTriangle size={13} className="why-icon-warn" />
                    )}
                    <div>
                      <strong style={{ color: issue.priority === "CRITICAL" ? "var(--status-notrec)" : "var(--status-review)" }}>
                        [{issue.priority === "CRITICAL" ? "KRITIS" : issue.priority === "HIGH" ? "TINGGI" : issue.priority === "MEDIUM" ? "SEDANG" : "INFO"}] {issue.title}:
                      </strong>{" "}
                      <span>{issue.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="action-recommendation-box">
              <div className="box-title" style={{ color: "#a5b4fc" }}>
                <Sparkles size={14} />
                <span>Tindakan yang Disarankan untuk Kontributor</span>
              </div>
              <ul style={{ paddingLeft: "1.15rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {recommendedActions?.map((act, idx) => (
                  <li key={idx} className="action-text">{act}</li>
                ))}
              </ul>
            </div>

            {/* Category Accordion */}
            <div className="inspector-accordion">
              {/* 1. Technical */}
              <AccordionItem title="1. Rincian Kepatuhan Teknis & 100% Zoom" defaultOpen={true}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem", fontSize: "0.78rem" }}>
                  <div>&bull; Format: <strong>{metadata.extension.toUpperCase()} {metadata.isNonSubmissionFormat ? "(BUKAN FORMAT RESMI)" : ""}</strong></div>
                  <div>&bull; Resolusi ({metadata.isVector ? "Artboard" : "Raster"}): <strong>{metadata.megapixels} MP</strong></div>
                  <div>&bull; Batas Ukuran: <strong>{metadata.sizeMB <= 45 ? "LOLOS (<45 MB)" : "GAGAL (>45 MB)"}</strong></div>
                  <div>&bull; Profil Warna: <strong>{metadata.colorProfile}</strong></div>
                  <div>&bull; Skor Ketajaman 100%: <strong>{visualQuality?.metrics?.sharpnessScore || 0} ({visualQuality?.metrics?.sharpness100Status === "PASS" ? "Lolos" : "Kurang"})</strong></div>
                  <div>&bull; Noise Bayangan: <strong>{visualQuality?.metrics?.noiseLevel || 0} dB</strong></div>
                </div>
              </AccordionItem>

              {/* 2. Generative AI Checklist */}
              <AccordionItem title="2. Daftar Periksa Kepatuhan AI Generatif" defaultOpen={aiDetection?.isLikelyAi}>
                <p style={{ fontSize: "0.78rem", marginBottom: "0.5rem" }}>
                  Adobe Stock mewajibkan semua konten AI generatif diberi label resmi dan bebas dari kemiripan tokoh publik maupun merek terdaftar:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {aiDetection?.checklist?.map((item) => {
                    const isChecked = aiChecklistState[item.id] ?? item.defaultChecked;
                    return (
                      <label key={item.id} className="checklist-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                          className="checklist-checkbox"
                        />
                        <span>{item.text}</span>
                      </label>
                    );
                  })}
                </div>
              </AccordionItem>

              {/* 3. IP & Release */}
              <AccordionItem title="3. Pemeriksaan Hak Cipta, Merek Dagang & Dokumen Rilis" defaultOpen={ipRisk?.issues?.length > 0}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.78rem" }}>
                  <div>Status Risiko: <strong>{ipRisk?.riskLevel === "LOW" ? "RENDAH" : ipRisk?.riskLevel === "MEDIUM" ? "SEDANG" : ipRisk?.riskLevel === "HIGH" ? "TINGGI" : (ipRisk?.riskLevel || "AMAN")}</strong></div>
                  <div>Rilis Model (Orang): <strong>{ipRisk?.modelReleaseRequired ? "Perlu Dokumen Rilis Model" : "Tidak terdeteksi"}</strong></div>
                  <div>Rilis Properti: <strong>{ipRisk?.propertyReleaseRequired ? "Perlu Dokumen Rilis Properti" : "Tidak terdeteksi"}</strong></div>
                  <div>Tanda Air / Watermark: <strong>{ipRisk?.watermarkDetected ? "TERDETEKSI WATERMARK / TEKS" : "Bersih / Tidak terdeteksi"}</strong></div>
                </div>
              </AccordionItem>

              {/* 4. Illustrative Editorial */}
              <AccordionItem title="4. Mode Editorial Ilustratif" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="checklist-item">
                    <input
                      type="checkbox"
                      checked={asset.isIllustrativeEditorial || false}
                      onChange={(e) => onToggleEditorialMode(asset.id, e.target.checked)}
                      className="checklist-checkbox"
                    />
                    <strong>Klasifikasikan sebagai Pengajuan Editorial Ilustratif</strong>
                  </label>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                    Memerlukan akun kontributor dengan reputasi minimal 100+ penjualan disetujui di Adobe Stock.
                  </p>
                </div>
              </AccordionItem>

              {/* 5. UPGRADED: Market Saturation & Trend Intelligence */}
              <AccordionItem title="5. Tren Pasar Adobe Stock & Nilai Komersial" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.78rem" }}>
                  {/* Niche Saturation Badge */}
                  {commercialValue?.marketNiche && (
                    <div style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.05)", border: `1px solid ${commercialValue.marketNiche.color}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: commercialValue.marketNiche.color }}>
                        {commercialValue.marketNiche.type === "RED_OCEAN" ? <Flame size={13} /> : <TrendingUp size={13} />}
                        <span>{commercialValue.marketNiche.label}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {commercialValue.marketNiche.detail}
                      </div>
                    </div>
                  )}

                  {/* Seasonal Advice */}
                  {commercialValue?.seasonalAdvice && (
                    <div style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#38bdf8" }}>
                        <Calendar size={13} />
                        <span>{commercialValue.seasonalAdvice.eventName}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {commercialValue.seasonalAdvice.statusText}
                      </div>
                    </div>
                  )}

                  {/* Adobe Creative Trend */}
                  {commercialValue?.matchedTrend && (
                    <div style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
                      <div style={{ fontWeight: 700, color: "#c084fc" }}>
                        Adobe Creative Trend: {commercialValue.matchedTrend.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        Pilar tema: {commercialValue.matchedTrend.tag}
                      </div>
                    </div>
                  )}

                  <div>Potensi Komersial: <strong>{commercialValue?.rating}</strong></div>
                  <div>Komposisi Ruang: <strong>{copySpace?.summary}</strong></div>
                  <ul style={{ paddingLeft: "1.15rem", margin: "0.2rem 0", fontSize: "0.78rem" }}>
                    {commercialValue?.strengths?.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              </AccordionItem>

              {/* 6. Metadata Assistant */}
              <AccordionItem title="6. Asisten Metadata (Tag Standar Adobe, Kategori & SEO)" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Saran metadata sesuai standar Adobe Stock (bebas kata kunci spam/merek terdaftar):
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem" }}
                      onClick={handleCopyAllMetadata}
                    >
                      {copiedKey === "all" ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKey === "all" ? "Semua Disalin" : "Salin Semua Metadata"}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8" }}>SARAN JUDUL ASET</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.68rem", padding: "0.12rem 0.4rem" }}
                        onClick={() => handleCopy(metadataSuggestions.title, "title")}
                      >
                        {copiedKey === "title" ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === "title" ? "Disalin" : "Salin"}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      className="curator-textarea"
                      style={{ minHeight: "32px", height: "32px" }}
                      value={metadataSuggestions.title}
                      readOnly
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8" }}>KATEGORI ADOBE STOCK</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.68rem", padding: "0.12rem 0.4rem" }}
                        onClick={() => handleCopy(metadataSuggestions.category, "cat")}
                      >
                        {copiedKey === "cat" ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === "cat" ? "Disalin" : "Salin"}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      className="curator-textarea"
                      style={{ minHeight: "32px", height: "32px" }}
                      value={metadataSuggestions.category}
                      readOnly
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8" }}>
                        KATA KUNCI / TAGS ({metadataSuggestions.keywordCount})
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.68rem", padding: "0.12rem 0.4rem" }}
                        onClick={() => handleCopy(metadataSuggestions.keywords.join(", "), "keywords")}
                      >
                        {copiedKey === "keywords" ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === "keywords" ? "Disalin" : "Salin Kata Kunci"}</span>
                      </button>
                    </div>
                    <div className="keyword-chips-container">
                      {metadataSuggestions.keywords.map((kw, idx) => (
                        <span key={idx} className="keyword-chip">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionItem>

              {/* 7. Curator Notes */}
              <AccordionItem title="7. Catatan Pribadi Kontributor" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <textarea
                    className="curator-textarea"
                    placeholder="Tulis catatan pribadi untuk aset ini (tersimpan di browser storage)..."
                    value={curatorNotes || ""}
                    onChange={(e) => onUpdateNotes(asset.id, e.target.value)}
                  />
                </div>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiagnosticMeterRow({ label, score, color }) {
  return (
    <div className="meter-row">
      <div className="meter-label-row">
        <span>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>{score}%</span>
      </div>
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{
            width: `${score}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

function AccordionItem({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </div>
      {isOpen && <div className="accordion-body">{children}</div>}
    </div>
  );
}
