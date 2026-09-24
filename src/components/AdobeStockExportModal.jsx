import React, { useState } from "react";
import {
  X, CheckCircle2, Download, ExternalLink,
  FileSpreadsheet, FolderArchive,
  UploadCloud, ShieldCheck, CheckCheck
} from "lucide-react";
import JSZip from "jszip";
import { generateMetadataSuggestions } from "../core/metadata/metadataGenerator";

export function AdobeStockExportModal({
  isOpen,
  onClose,
  assets = [],
  selectedIds = []
}) {
  if (!isOpen) return null;

  // Determine export target pool
  const readyAssets = assets.filter(a => a.verdict?.key === "READY");
  const selectedAssets = assets.filter(a => selectedIds.includes(a.id));

  // Default to READY assets if any, otherwise selected, otherwise all
  const [scope, setScope] = useState(
    readyAssets.length > 0 ? "READY" : (selectedAssets.length > 0 ? "SELECTED" : "ALL")
  );

  const [isZipping, setIsZipping] = useState(false);

  const targetAssets = scope === "READY"
    ? readyAssets
    : scope === "SELECTED"
      ? selectedAssets
      : assets;

  const count = targetAssets.length;

  // 2. Download ZIP Handler (Original raw bytes, 100% byte-original)
  const handleDownloadZip = async () => {
    if (count === 0 || isZipping) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const nameMap = new Map();

      for (const asset of targetAssets) {
        if (asset.metadata?.rawFile) {
          let name = asset.metadata.filename;
          if (nameMap.has(name)) {
            const num = nameMap.get(name) + 1;
            nameMap.set(name, num);
            const parts = name.split(".");
            const ext = parts.pop();
            name = `${parts.join(".")}_${num}.${ext}`;
          } else {
            nameMap.set(name, 1);
          }
          zip.file(name, asset.metadata.rawFile);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `AdobeStock_${scope === "READY" ? "SiapSubmit" : "Export"}_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error("Gagal membuat arsip ZIP:", err);
    } finally {
      setIsZipping(false);
    }
  };

  // 3. Download Adobe Stock Official Metadata CSV
  // Format: Filename,Title,Keywords,Category
  const handleDownloadAdobeCsv = () => {
    if (count === 0) return;

    const headers = ["Filename", "Title", "Keywords", "Category"];
    const rows = targetAssets.map(asset => {
      const meta = generateMetadataSuggestions(
        asset.metadata,
        asset.aiDetection || {},
        asset.isIllustrativeEditorial
      );

      const filename = asset.metadata.filename.replace(/"/g, '""');
      const title = (meta.title || asset.metadata.filename).replace(/"/g, '""');
      const keywords = (meta.keywords || []).join(", ").replace(/"/g, '""');
      const category = (meta.category || "Graphic Resources").replace(/"/g, '""');

      return `"${filename}","${title}","${keywords}","${category}"`;
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AdobeStock_Metadata_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "860px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--bg-surface)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--border-medium)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to right, rgba(16, 185, 129, 0.08), transparent)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-md)",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--status-ready)"
              }}
            >
              <UploadCloud size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  Pusat Pengiriman Adobe Stock
                </h3>
                <span
                  style={{
                    fontSize: "0.68rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    background: "rgba(16, 185, 129, 0.18)",
                    color: "var(--status-ready)",
                    border: "1px solid rgba(16, 185, 129, 0.35)"
                  }}
                >
                  SUBMISSION HUB
                </span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Unggah foto yang lulus kurasi dengan cepat tanpa pusing mencari manual satu per satu di folder.
              </span>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: "0.4rem" }}
            title="Tutup (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Target Scope Pill Selector */}
        <div
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--bg-surface-elevated)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.6rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            <span>Target Pengiriman:</span>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <button
                className={`btn btn-sm ${scope === "READY" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setScope("READY")}
                style={{
                  fontSize: "0.76rem",
                  padding: "0.25rem 0.65rem",
                  background: scope === "READY" ? "var(--status-ready)" : undefined,
                  borderColor: scope === "READY" ? "var(--status-ready)" : undefined,
                  color: scope === "READY" ? "#ffffff" : undefined
                }}
              >
                <CheckCircle2 size={12} />
                <span>Foto Lulus / Siap Submit ({readyAssets.length})</span>
              </button>

              {selectedAssets.length > 0 && (
                <button
                  className={`btn btn-sm ${scope === "SELECTED" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setScope("SELECTED")}
                  style={{ fontSize: "0.76rem", padding: "0.25rem 0.65rem" }}
                >
                  <CheckCheck size={12} />
                  <span>Foto Terpilih ({selectedAssets.length})</span>
                </button>
              )}

              <button
                className={`btn btn-sm ${scope === "ALL" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setScope("ALL")}
                style={{ fontSize: "0.76rem", padding: "0.25rem 0.65rem" }}
              >
                <span>Semua Foto Sesi ({assets.length})</span>
              </button>
            </div>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 600 }}>
            {count} file siap diproses
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.1rem"
          }}
        >
          {count === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: "2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.6rem"
              }}
            >
              <CheckCircle2 size={32} style={{ color: "var(--text-tertiary)" }} />
              <h4 style={{ margin: 0, fontSize: "1rem" }}>Belum Ada Foto Berstatus Siap Submit</h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "420px" }}>
                Jalankan kurasi batch terlebih dahulu atau gunakan tombol &ldquo;Foto Terpilih&rdquo; jika ingin mengekspor foto tertentu secara manual.
              </p>
            </div>
          ) : (
            <>
              {/* Solusi 1: Unduh Arsip ZIP (Folder Bersih Siap Upload) */}
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "1.25rem",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent 70%)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        padding: "0.5rem",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "var(--status-ready)",
                        height: "fit-content"
                      }}
                    >
                      <FolderArchive size={20} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                          Solusi 1: Unduh Arsip ZIP (Folder Bersih Siap Upload)
                        </h4>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.1rem 0.45rem",
                            borderRadius: "4px",
                            fontWeight: 700,
                            background: "rgba(16, 185, 129, 0.2)",
                            color: "var(--status-ready)"
                          }}
                        >
                          100% BYTE-ORIGINAL
                        </span>
                      </div>
                      <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        Download seluruh {count} file asli tanpa kompresi dalam 1 file ZIP. Ekstrak ke folder baru lalu drag-and-drop langsung ke Adobe Stock.
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn btn-sm"
                    onClick={handleDownloadZip}
                    disabled={isZipping || count === 0}
                    style={{
                      flexShrink: 0,
                      gap: "0.4rem",
                      background: "var(--status-ready)",
                      borderColor: "var(--status-ready)",
                      color: "#ffffff",
                      fontWeight: 700,
                      padding: "0.5rem 1rem",
                      boxShadow: "0 2px 10px rgba(16, 185, 129, 0.35)"
                    }}
                  >
                    <Download size={14} />
                    <span>{isZipping ? "Mengompresi..." : `Unduh ZIP (${count} File)`}</span>
                  </button>
                </div>
              </div>

              {/* Solusi 2: Unduh CSV Metadata Adobe Stock */}
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "1.25rem",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent 70%)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        padding: "0.5rem",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(245, 158, 11, 0.15)",
                        color: "#f59e0b",
                        height: "fit-content"
                      }}
                    >
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                          Solusi 2: Unduh CSV Metadata Adobe Stock
                        </h4>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.1rem 0.45rem",
                            borderRadius: "4px",
                            fontWeight: 700,
                            background: "rgba(245, 158, 11, 0.2)",
                            color: "#f59e0b"
                          }}
                        >
                          OTOMATISASI TAG &amp; JUDUL
                        </span>
                      </div>
                      <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        Format resmi Adobe Stock (<code>Filename, Title, Keywords, Category</code>). Diunggah via tombol &ldquo;Upload CSV&rdquo; di portal Adobe agar judul dan keyword terisi otomatis.
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadAdobeCsv}
                    disabled={count === 0}
                    style={{
                      flexShrink: 0,
                      gap: "0.4rem",
                      fontWeight: 700,
                      padding: "0.5rem 1rem",
                      borderColor: "rgba(245, 158, 11, 0.4)",
                      color: "#fbbf24"
                    }}
                  >
                    <Download size={14} style={{ color: "#f59e0b" }} />
                    <span>Unduh CSV Metadata</span>
                  </button>
                </div>
              </div>

              {/* Asset Preview List */}
              <div style={{ marginTop: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Daftar {count} File yang Akan Diproses
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                    {targetAssets.filter(a => a.verdict?.key === "READY").length} Lolos Kurasi
                  </span>
                </div>

                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-surface-elevated)"
                  }}
                >
                  {targetAssets.map((asset, idx) => (
                    <div
                      key={asset.id || idx}
                      style={{
                        padding: "0.45rem 0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: idx < targetAssets.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        fontSize: "0.78rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                        <span style={{ color: "var(--text-tertiary)", fontSize: "0.7rem", width: "20px" }}>
                          {idx + 1}.
                        </span>
                        {asset.metadata?.thumbnailUrl ? (
                          <img
                            src={asset.metadata.thumbnailUrl}
                            alt=""
                            style={{ width: "24px", height: "24px", objectFit: "cover", borderRadius: "3px" }}
                          />
                        ) : null}
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {asset.metadata.filename}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                          ({asset.metadata.megapixels ? `${asset.metadata.megapixels} MP` : `${asset.metadata.sizeMB} MB`})
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            padding: "0.1rem 0.45rem",
                            borderRadius: "4px",
                            fontWeight: 600,
                            background: asset.verdict?.key === "READY" ? "var(--status-ready-bg)" : "rgba(255, 255, 255, 0.08)",
                            color: asset.verdict?.key === "READY" ? "var(--status-ready)" : "var(--text-secondary)",
                            border: `1px solid ${asset.verdict?.key === "READY" ? "var(--status-ready-border)" : "var(--border-subtle)"}`
                          }}
                        >
                          {asset.verdict?.label || asset.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer with Direct Link */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-elevated)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.76rem", color: "var(--text-tertiary)" }}>
            <ShieldCheck size={14} style={{ color: "var(--status-ready)" }} />
            <span>Kualitas file dipertahankan 100% tanpa modifikasi pixel atau kompresi ulang.</span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Tutup
            </button>
            <a
              href="https://contributor.stock.adobe.com/uploads"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                textDecoration: "none",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                borderColor: "#6366f1"
              }}
            >
              <span>Buka Adobe Stock Contributor</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
