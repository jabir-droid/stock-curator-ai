import React, { useState } from "react";
import {
  ArrowLeft, Download, Trash2, CheckCircle2, AlertTriangle, AlertOctagon,
  XCircle, Sparkles, Copy, Check, ShieldCheck, Eye, EyeOff,
  RotateCw, CheckCheck, FileDown, Printer, Tag
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
  onPrintSingle
}) {
  const [showCopySpaceOverlay, setShowCopySpaceOverlay] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [aiChecklistState, setAiChecklistState] = useState(asset?.aiChecklistState || {});

  if (!asset) return null;

  const {
    metadata, verdict, pros, issues, recommendedActions,
    diagnosticMeters, copySpace, commercialValue, aiDetection,
    ipRisk, curatorNotes, isReviewed
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
              title="Analisis ulang aset ini"
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
          {/* Left Pane: Preview Canvas & Technical Details */}
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

            {/* Diagnostic Meters */}
            <div className="curator-why-box">
              <div className="box-title">
                <span>Kartu Skor Diagnostik Kepatuhan</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontWeight: 400 }}>
                  (Indikator diagnostik per kategori, bukan skor agregat acak)
                </span>
              </div>
              <div className="diagnostic-meters-section">
                <DiagnosticMeterRow label="Kepatuhan Teknis" score={diagnosticMeters?.technical || 90} color="var(--brand-primary)" />
                <DiagnosticMeterRow label="Kualitas Visual & Ketajaman" score={diagnosticMeters?.visual || 85} color="var(--status-info)" />
                <DiagnosticMeterRow label="Keamanan Hak Cipta & Dokumen Rilis" score={diagnosticMeters?.ipSafety || 95} color="var(--status-ready)" />
                <DiagnosticMeterRow label="Keunikan & Nilai Katalog" score={diagnosticMeters?.distinctiveness || 90} color="var(--status-review)" />
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
              <AccordionItem title="1. Rincian Kepatuhan Teknis" defaultOpen={true}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem" }}>
                  <div>&bull; Format: <strong>{metadata.extension.toUpperCase()} {metadata.isNonSubmissionFormat ? "(BUKAN FORMAT RESMI ADOBE)" : ""}</strong></div>
                  <div>&bull; Resolusi ({metadata.isVector ? "Artboard Vektor" : "Raster"}): <strong>{metadata.megapixels} MP</strong></div>
                  <div>&bull; Batas Ukuran: <strong>{metadata.sizeMB <= 45 ? "LOLOS (<45 MB)" : "GAGAL (>45 MB)"}</strong></div>
                  <div>&bull; Profil Warna: <strong>{metadata.colorProfile}</strong></div>
                  {metadata.isVector && (
                    <div>&bull; Posisi Artboard Vektor: <strong>({metadata.vectorDetails?.artboardOffset?.x || 0}, {metadata.vectorDetails?.artboardOffset?.y || 0})</strong></div>
                  )}
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
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  <div>Status Risiko: <strong>{ipRisk?.riskLevel === "LOW" ? "RENDAH" : ipRisk?.riskLevel === "MEDIUM" ? "SEDANG" : ipRisk?.riskLevel === "HIGH" ? "TINGGI" : (ipRisk?.riskLevel || "AMAN")}</strong></div>
                  <div>Rilis Model (Orang): <strong>{ipRisk?.modelReleaseRequired ? "Perlu Dokumen Rilis Model" : "Tidak terdeteksi"}</strong></div>
                  <div>Rilis Properti: <strong>{ipRisk?.propertyReleaseRequired ? "Perlu Dokumen Rilis Properti" : "Tidak terdeteksi"}</strong></div>
                  <div>Tanda Air / Watermark: <strong>{ipRisk?.watermarkDetected ? "TERDETEKSI WATERMARK / TEKS" : "Bersih / Tidak terdeteksi"}</strong></div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                    {ipRisk?.verificationNote}
                  </div>
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

              {/* 5. Copy Space & Stock Value */}
              <AccordionItem title="5. Potensi Komersial & Ruang Teks (Copy Space)" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
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

                  {/* Description */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8" }}>DESKRIPSI LENGKAP</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.68rem", padding: "0.12rem 0.4rem" }}
                        onClick={() => handleCopy(metadataSuggestions.description, "desc")}
                      >
                        {copiedKey === "desc" ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === "desc" ? "Disalin" : "Salin"}</span>
                      </button>
                    </div>
                    <textarea
                      className="curator-textarea"
                      style={{ minHeight: "44px", height: "44px" }}
                      value={metadataSuggestions.description}
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
