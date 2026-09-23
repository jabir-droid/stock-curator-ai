import React, { useState, useRef, useEffect } from "react";
import {
  Search, Zap, Download, FileSpreadsheet, FileJson, ChevronDown,
  Trash2, Loader2, CheckCheck, CheckCircle2, AlertTriangle, Printer
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
  onDeleteSelected,
  onMarkSelectedReviewed,
  onMoveSelectedToReady,
  onMoveSelectedToReview,
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
    <div className="action-search-bar animate-fade-in" style={{ position: "relative", zIndex: 40 }}>
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

        {/* 1. Analisis Batch AI */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onReanalyzeBatch}
          disabled={isProcessing || assets.length === 0}
          title="Jalankan ulang analisis batch dengan Mesin AI Kurator"
        >
          {isProcessing ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Menganalisis...</span>
            </>
          ) : (
            <>
              <Zap size={13} />
              <span>Analisis Batch AI</span>
            </>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
