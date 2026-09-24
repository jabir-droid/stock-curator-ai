import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Database, X, Search, Trash2, Download, Upload, ShieldCheck,
  Calendar, Zap, CheckCircle2, AlertTriangle, FileImage, RefreshCw, Loader2
} from "lucide-react";
import {
  getAllHistoricalFingerprints,
  deleteFromPortfolioMemory,
  clearPortfolioMemory,
  exportPortfolioMemoryJson,
  importPortfolioMemoryJson
} from "../core/storage/portfolioMemory";

export function PortfolioMemoryModal({
  isOpen,
  onClose,
  onMemoryUpdated,
  currentAssets = [],
  onSaveSessionToMemory
}) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHistoricalFingerprints();
      // Newest first
      setItems((data || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)));
    } catch (err) {
      console.error("Error loading portfolio memory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setConfirmClear(false);
      setStatusMsg("");
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => (item.filename || "").toLowerCase().includes(q));
  }, [items, searchQuery]);

  // Fast map to look up current active assets by id, hash, or filename for high-res previews
  const currentAssetMap = useMemo(() => {
    const map = new Map();
    for (const a of currentAssets) {
      if (a.id) map.set(a.id, a);
      if (a.pHash) map.set(a.pHash, a);
      if (a.metadata?.filename) map.set(a.metadata.filename, a);
    }
    return map;
  }, [currentAssets]);

  // Check how many assets in current session are NOT yet stored in memory
  const unsavedCount = useMemo(() => {
    if (!currentAssets || currentAssets.length === 0) return 0;
    const savedIds = new Set(items.map(i => i.id));
    const savedHashes = new Set(items.map(i => i.pHash));
    const savedNames = new Set(items.map(i => i.filename));
    return currentAssets.filter(a => !savedIds.has(a.id) && !savedHashes.has(a.pHash) && !savedNames.has(a.metadata?.filename)).length;
  }, [currentAssets, items]);

  const handleSaveSession = async () => {
    if (!currentAssets || currentAssets.length === 0) return;
    setIsSavingSession(true);
    try {
      if (onSaveSessionToMemory) {
        const count = await onSaveSessionToMemory();
        await loadData();
        onMemoryUpdated && onMemoryUpdated();
        setStatusMsg(`Berhasil menyimpan ${count || currentAssets.length} aset sesi aktif ke Memori Portofolio!`);
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch (err) {
      alert("Gagal menyimpan sesi: " + err.message);
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleDeleteItem = async (id, filename) => {
    if (!window.confirm(`Hapus "${filename}" dari memori riwayat portofolio?`)) return;
    const ok = await deleteFromPortfolioMemory(id);
    if (ok) {
      setItems(prev => prev.filter(i => i.id !== id));
      onMemoryUpdated && onMemoryUpdated();
      setStatusMsg(`Aset "${filename}" dihapus dari memori.`);
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleClearAll = async () => {
    const ok = await clearPortfolioMemory();
    if (ok) {
      setItems([]);
      setConfirmClear(false);
      onMemoryUpdated && onMemoryUpdated();
      setStatusMsg("Seluruh memori riwayat portofolio berhasil dibersihkan.");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleExportJson = async () => {
    try {
      const json = await exportPortfolioMemoryJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stock_curator_memory_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal mengekspor riwayat: " + err.message);
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importPortfolioMemoryJson(text);
      await loadData();
      onMemoryUpdated && onMemoryUpdated();
      setStatusMsg(`Berhasil mengimpor ${count} sidik jari aset ke dalam memori.`);
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      alert("Gagal mengimpor file: " + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 2050 }}>
      <div
        className="glass-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "1120px",
          width: "95vw",
          height: "90vh",
          maxHeight: "920px",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          border: "1px solid var(--border-medium)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9)"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0.85rem 1.35rem",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(79, 70, 229, 0.4))",
                border: "1px solid rgba(167, 139, 250, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c4b5fd"
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Memori Portofolio (Anti-Spam Lintas Sesi)
                <span
                  style={{
                    fontSize: "0.68rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    fontWeight: 700
                  }}
                >
                  <ShieldCheck size={11} style={{ display: "inline", marginRight: "3px" }} />
                  Aktif
                </span>
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                Mengingat sidik jari visual (dHash) seluruh gambar yang pernah diunggah agar sesi baru tidak menduplikasi foto masa lalu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: "0.4rem", borderRadius: "var(--radius-full)" }}
            title="Tutup Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats & Information Ribbon */}
        <div
          style={{
            padding: "0.6rem 1.35rem",
            background: "rgba(124, 58, 237, 0.08)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.8rem",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", fontSize: "0.78rem" }}>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>Total Aset Diingat: </span>
              <strong style={{ color: "#a78bfa" }}>{items.length} Gambar</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>Database: </span>
              <strong style={{ color: "var(--text-primary)" }}>IndexedDB (Aman Lokal)</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>Toleransi Perlindungan: </span>
              <strong style={{ color: "#10b981" }}>Mirip ≥ 73% (Threshold Hamming: 17)</strong>
            </div>
            {currentAssets.length > 0 && unsavedCount === 0 && (
              <span style={{ color: "#34d399", fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "0.12rem 0.5rem", borderRadius: "999px", fontWeight: 600 }}>
                ✓ {currentAssets.length} Aset Sesi Aktif Tersimpan
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              style={{ display: "none" }}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              title="Impor cadangan data riwayat JSON"
              style={{ fontSize: "0.75rem" }}
            >
              <Upload size={12} />
              <span>Impor JSON</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExportJson}
              disabled={items.length === 0}
              title="Unduh cadangan data riwayat JSON"
              style={{ fontSize: "0.75rem" }}
            >
              <Download size={12} />
              <span>Ekspor JSON</span>
            </button>

            {confirmClear ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleClearAll}
                  style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}
                >
                  Ya, Bersihkan Semua
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setConfirmClear(false)}
                  style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setConfirmClear(true)}
                disabled={items.length === 0}
                style={{ fontSize: "0.75rem", color: "#f87171" }}
                title="Hapus seluruh riwayat memori"
              >
                <Trash2 size={12} />
                <span>Reset Memori</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Alert Notification if any */}
        {statusMsg && (
          <div
            className="animate-fade-in"
            style={{
              padding: "0.5rem 1.4rem",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderBottom: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexShrink: 0
            }}
          >
            <CheckCircle2 size={14} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Active Session Sync Card (Only shown when there are unsaved assets) */}
        {unsavedCount > 0 && (
          <div
            className="animate-fade-in"
            style={{
              margin: "0.75rem 1.4rem 0.2rem 1.4rem",
              padding: "0.75rem 1.2rem",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.16), rgba(59, 130, 246, 0.16))",
              border: "1px solid rgba(167, 139, 250, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              flexShrink: 0
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "#c4b5fd", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Zap size={14} style={{ color: "#a855f7" }} />
                <span>{unsavedCount} Aset Sesi Aktif Belum Masuk Memori</span>
              </div>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Simpan ke memori agar sesi berikutnya otomatis mendeteksi kemiripan dan duplikat.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveSession}
              disabled={isSavingSession}
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                border: "1px solid #8b5cf6",
                fontWeight: 700,
                padding: "0.4rem 0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 2px 10px rgba(139, 92, 246, 0.35)"
              }}
            >
              {isSavingSession ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Database size={13} />
                  <span>Simpan {unsavedCount} Aset Baru</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div
          style={{
            padding: "0.6rem 1.4rem",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.35rem 0.75rem",
              width: "100%",
              maxWidth: "400px"
            }}
          >
            <Search size={14} style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Cari nama file dalam riwayat portofolio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: "0.82rem",
                width: "100%",
                outline: "none"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ border: "none", background: "transparent", color: "var(--text-tertiary)", cursor: "pointer", padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Menampilkan {filteredItems.length} dari {items.length} aset tersimpan
          </span>
        </div>

        {/* Gallery / Asset Cards Grid */}
        <div
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            overflowY: "auto",
            padding: "1rem 1.4rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))",
            gap: "1rem",
            alignContent: "start"
          }}
        >
          {isLoading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 0.75rem auto", display: "block" }} />
              <span>Memuat memori portofolio...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "3.5rem 1.5rem",
                color: "var(--text-tertiary)",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border-subtle)"
              }}
            >
              <Database size={36} style={{ color: "var(--text-tertiary)", margin: "0 auto 1rem auto", opacity: 0.5 }} />
              <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", margin: "0 0 0.4rem 0" }}>
                {searchQuery ? "Tidak ditemukan aset yang cocok dengan pencarian" : "Belum Ada Aset dalam Memori Riwayat"}
              </h4>
              <p style={{ fontSize: "0.8rem", maxWidth: "460px", margin: "0 auto", lineHeight: "1.5" }}>
                {searchQuery
                  ? "Coba gunakan kata kunci pencarian yang lain."
                  : "Setiap aset yang Anda analisis di aplikasi ini otomatis disimpan ke dalam memori portofolio. Saat Anda mengunggah batch berikutnya di kemudian hari, sistem akan mendeteksi apakah ada duplikat dari riwayat ini."}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const matchedCurrent = currentAssetMap.get(item.id) || currentAssetMap.get(item.pHash) || currentAssetMap.get(item.filename);
              const displayThumbnail = matchedCurrent?.metadata?.previewUrl || item.thumbnail;

              return (
                <div
                  key={item.id}
                  className="glass-card animate-fade-in"
                  style={{
                    padding: "0.65rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.55rem",
                    border: "1px solid var(--border-subtle)",
                    position: "relative",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface-elevated)"
                  }}
                >
                  {/* Thumbnail Preview */}
                  <div
                    style={{
                      width: "100%",
                      height: "140px",
                      borderRadius: "var(--radius-sm)",
                      background: "#080c14",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}
                  >
                    {displayThumbnail ? (
                      <img
                        src={displayThumbnail}
                        alt={item.filename}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <FileImage size={28} style={{ color: "var(--text-tertiary)" }} />
                    )}

                    {/* Format & Megapixels Pill */}
                    <span
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        left: "6px",
                        background: "rgba(0, 0, 0, 0.8)",
                        color: "#38bdf8",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        padding: "0.12rem 0.4rem",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                    >
                      <Zap size={9} />
                      {item.megapixels ? `${item.megapixels.toFixed(1)} MP` : item.format || "IMG"}
                    </span>

                    {item.isChampion && (
                      <span
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          background: "#10b981",
                          color: "#ffffff",
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          padding: "0.12rem 0.4rem",
                          borderRadius: "4px"
                        }}
                      >
                        🏆 Champion
                      </span>
                    )}
                  </div>

                {/* Filename & Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    title={item.filename}
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {item.filename}
                  </div>

                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--text-tertiary)",
                      marginTop: "3px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Calendar size={10} />
                    <span>
                      {item.uploadedAt
                        ? new Date(item.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "Riwayat Sesi"}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.4rem",
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: "0.68rem"
                  }}
                >
                  <span
                    style={{
                      color: item.verdictKey === "READY" ? "#10b981" : "var(--text-tertiary)",
                      fontWeight: 600
                    }}
                  >
                    {item.verdictKey === "READY" ? "✓ Siap Submit" : "Tersimpan"}
                  </span>

                  <button
                    onClick={() => handleDeleteItem(item.id, item.filename)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "0.2rem 0.4rem", color: "#f87171", border: "none" }}
                    title="Hapus dari memori riwayat"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.8rem 1.4rem",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <ShieldCheck size={14} style={{ color: "#10b981" }} />
            <span>Setiap batch baru yang Anda unggah otomatis dicocokkan dengan {items.length} sidik jari di atas.</span>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Tutup &amp; Lanjutkan Kurasi
          </button>
        </div>
      </div>
    </div>
  );
}
