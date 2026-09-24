import React, { useState, useRef, useEffect } from "react";
import {
  Search, Zap, RotateCcw, Download, FileSpreadsheet, FileJson, ChevronDown,
  Trash2, Loader2, CheckCheck, CheckCircle2, AlertTriangle, Printer,
  UploadCloud, ShieldAlert, Database
} from "lucide-react";
import JSZip from "jszip";

export function BulkActionBar({
  assets,
  selectedIds,
  searchQuery,
  onSearchChange,
  onReanalyzeBatch,
  onExportCsv,
  onExportJson,
  onOpenPrintReport,
  onOpenAdobeExport,
  readyCount = 0,
  duplicateCount = 0,
  onPruneDuplicates,
  onDeleteSelected,
  onMarkSelectedReviewed,
  onMoveSelectedToReady,
  onMoveSelectedToReview,
  onSaveToMemory,
  isProcessing
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadZip = async (onlySelected = false) => {
    const targetAssets = onlySelected
      ? assets.filter(a => selectedIds.includes(a.id))
      : assets;

    if (targetAssets.length === 0) return;

    const zip = new JSZip();
    const nameMap = new Map();

    for (const asset of targetAssets) {
      if (asset.metadata?.rawFile) {
        let name = asset.metadata.filename;
        if (nameMap.has(name)) {
          const count = nameMap.get(name) + 1;
          nameMap.set(name, count);
          const parts = name.split('.');
          const ext = parts.pop();
          const base = parts.join('.');
          name = `${base}_${count}.${ext}`;
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
    link.download = `stock_curator_originals_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="action-search-bar animate-fade-in" style={{ position: "relative", zIndex: 5 }}>
      {/* Search Input */}
      <div className="search-field-wrapper">
        <Search size={14} />
        <input
          type="text"
          className="search-field-input"
          placeholder="Cari berdasarkan nama file atau kata kunci..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Buttons Group */}
      <div className="action-buttons-group">
        {hasSelection && (
          <>
            {/* Move to Ready button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onMoveSelectedToReady}
              title="Pindahkan aset terpilih ke Siap Submit (Override Kontributor)"
              style={{ color: "var(--status-ready)", borderColor: "rgba(16, 185, 129, 0.4)" }}
            >
              <CheckCircle2 size={13} />
              <span>Ke Siap Submit ({selectedIds.length})</span>
            </button>

            {/* Move to Review button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onMoveSelectedToReview}
              title="Pindahkan aset terpilih ke Perlu Ditinjau"
              style={{ color: "var(--status-review)", borderColor: "rgba(245, 158, 11, 0.4)" }}
            >
              <AlertTriangle size={13} />
              <span>Ke Ditinjau ({selectedIds.length})</span>
            </button>

            {/* Mark as Reviewed */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onMarkSelectedReviewed}
              title="Tandai aset terpilih sudah ditinjau secara manual"
            >
              <CheckCheck size={13} style={{ color: "var(--status-ready)" }} />
              <span>Sudah Ditinjau ({selectedIds.length})</span>
            </button>

            {/* Download Selected */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleDownloadZip(true)}
              title="Unduh file asli aset terpilih dalam arsip ZIP"
            >
              <Download size={13} />
              <span>Unduh ({selectedIds.length})</span>
            </button>

            {/* Save Selected to Memory */}
            {onSaveToMemory && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onSaveToMemory()}
                title="Simpan sidik jari visual aset yang dipilih ke Memori Portofolio"
                style={{ color: "#c084fc", borderColor: "rgba(168, 85, 247, 0.4)", gap: "0.35rem" }}
              >
                <Database size={13} style={{ color: "#a855f7" }} />
                <span>Simpan Memori ({selectedIds.length})</span>
              </button>
            )}

            {/* Delete Selected */}
            <button
              className="btn btn-danger btn-sm"
              onClick={onDeleteSelected}
              title="Hapus aset yang dipilih dari sesi"
            >
              <Trash2 size={13} />
              <span>Hapus ({selectedIds.length})</span>
            </button>
          </>
        )}

        {/* 1. Tombol Analisis Ulang (Re-scan) */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onReanalyzeBatch}
          disabled={isProcessing || assets.length === 0}
          title="Jalankan ulang analisis batch dengan Mesin AI Kurator"
          style={{
            borderColor: "rgba(56, 189, 248, 0.3)",
            color: "var(--text-secondary)",
            gap: "0.35rem"
          }}
        >
          {isProcessing ? (
            <>
              <Loader2 size={13} className="animate-spin text-primary" />
              <span>Menganalisis...</span>
            </>
          ) : (
            <>
              <RotateCcw size={13} style={{ color: "#38bdf8" }} />
              <span>Analisis Ulang</span>
            </>
          )}
        </button>

        {/* 1.1 Pangkas Duplikat Berisiko (Anti Similar Submissions) */}
        {duplicateCount > 0 && onPruneDuplicates && (
          <button
            className="btn btn-sm"
            onClick={onPruneDuplicates}
            title="Otomatis singkirkan variasi duplikat berisiko dan hanya pertahankan karya Champion untuk mencegah penolakan Similar Content."
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              color: "#fca5a5",
              fontWeight: 700,
              gap: "0.35rem"
            }}
          >
            <ShieldAlert size={14} style={{ color: "#ef4444" }} />
            <span>Pangkas Duplikat ({duplicateCount})</span>
          </button>
        )}

        {/* Kirim ke Adobe Stock (Submission Hub) */}
        <button
          className="btn btn-sm"
          onClick={onOpenAdobeExport}
          disabled={assets.length === 0}
          title="Buka Pusat Pengiriman Adobe Stock (Unduh ZIP Lolos, Trik Windows, Metadata CSV)"
          style={{
            background: readyCount > 0 ? "linear-gradient(135deg, #10b981, #059669)" : "var(--bg-surface-elevated)",
            border: readyCount > 0 ? "1px solid #10b981" : "1px solid var(--border-medium)",
            color: readyCount > 0 ? "#ffffff" : "var(--text-secondary)",
            fontWeight: 700,
            boxShadow: readyCount > 0 ? "0 2px 10px rgba(16, 185, 129, 0.35)" : "none",
            gap: "0.35rem"
          }}
        >
          <UploadCloud size={14} />
          <span>Kirim ke Adobe</span>
          {readyCount > 0 && (
            <span
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                color: "#ffffff",
                fontSize: "0.68rem",
                padding: "0.08rem 0.42rem",
                borderRadius: "999px",
                fontWeight: 800,
                lineHeight: "1.2"
              }}
            >
              {readyCount}
            </span>
          )}
        </button>

        {/* 2. Download All ZIP */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleDownloadZip(false)}
          disabled={assets.length === 0}
          title="Unduh seluruh file asli tanpa kompresi ulang dalam arsip ZIP"
        >
          <Download size={13} style={{ color: "#f59e0b" }} />
          <span>Unduh Semua (ZIP)</span>
        </button>

        {/* 3. Export Laporan Dropdown */}
        <div style={{ position: "relative", zIndex: 50 }} ref={dropdownRef}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={assets.length === 0}
            title="Ekspor laporan kurasi"
          >
            <FileSpreadsheet size={13} style={{ color: "#38bdf8" }} />
            <span>Ekspor Laporan</span>
            <ChevronDown size={12} />
          </button>

          {showExportMenu && (
            <div
              className="glass-card animate-scale-up"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                zIndex: 100,
                minWidth: "195px",
                padding: "0.35rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-medium)",
                boxShadow: "0 12px 30px -4px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.5)",
                background: "#1e2531",
                opacity: 1
              }}
            >
              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start", width: "100%", border: "none" }}
                onClick={() => {
                  onExportCsv();
                  setShowExportMenu(false);
                }}
              >
                <FileSpreadsheet size={13} style={{ color: "var(--status-ready)" }} />
                <span>Ekspor CSV (.csv)</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start", width: "100%", border: "none" }}
                onClick={() => {
                  onExportJson();
                  setShowExportMenu(false);
                }}
              >
                <FileJson size={13} style={{ color: "var(--brand-primary)" }} />
                <span>Ekspor JSON (.json)</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start", width: "100%", border: "none" }}
                onClick={() => {
                  onOpenPrintReport();
                  setShowExportMenu(false);
                }}
              >
                <Printer size={13} style={{ color: "#38bdf8" }} />
                <span>Cetak / Simpan PDF</span>
              </button>
              {onSaveToMemory && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: "flex-start", width: "100%", border: "none" }}
                  onClick={() => {
                    onSaveToMemory();
                    setShowExportMenu(false);
                  }}
                >
                  <Database size={13} style={{ color: "#a855f7" }} />
                  <span>Simpan Sesi ke Memori</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
