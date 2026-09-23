import React, { useState, useMemo } from "react";
import { X, Search, Copy, Check, RotateCcw, HelpCircle } from "lucide-react";
import { REJECTION_REASONS } from "../data/rejectionReasons";

const CATEGORY_COLORS = {
  "ALL": "#38bdf8",
  "Kendala Teknis": "#f59e0b",
  "Kualitas Visual": "#ec4899",
  "Hak Kekayaan Intelektual": "#ef4444",
  "Masalah AI Generatif": "#a855f7",
  "Konten Serupa / Duplikat": "#6366f1",
  "Dokumen Rilis & Hukum": "#14b8a6",
  "Teknis File Vektor": "#06b6d4",
  "Kelayakan Akun Editorial": "#3b82f6"
};

export function RejectionLibraryModal({ onClose }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);

  const categories = useMemo(() => {
    return ["ALL", ...new Set(REJECTION_REASONS.map(r => r.category))];
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { ALL: REJECTION_REASONS.length };
    REJECTION_REASONS.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredReasons = useMemo(() => {
    return REJECTION_REASONS.filter(item => {
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const q = search.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.what.toLowerCase().includes(q) ||
        item.why.toLowerCase().includes(q) ||
        item.howToFix.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const handleCopySolution = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "980px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#0f131c",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "14px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: "1.1rem 1.6rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#141923"
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
              Panduan Alasan Penolakan Adobe Stock
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginTop: "3px" }}>
              Standar kurasi, penyebab penolakan, dan rekomendasi perbaikan aset
            </span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{
              padding: "0.35rem 0.5rem",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#94a3b8",
              cursor: "pointer"
            }}
            title="Tutup (ESC)"
          >
            <X size={17} />
          </button>
        </div>

        {/* Search & Category Filter Section */}
        <div
          style={{
            padding: "1rem 1.6rem 0.85rem 1.6rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            background: "#111622"
          }}
        >
          {/* Clean Search Input */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
              background: "#0a0e16",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "8px"
            }}
          >
            <Search
              size={15}
              style={{
                marginLeft: "0.85rem",
                color: search ? "var(--brand-primary)" : "#64748b",
                flexShrink: 0
              }}
            />
            <input
              type="text"
              placeholder="Cari alasan penolakan (contoh: watermark, blur, rilis, hak cipta, anatomi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "0.55rem 0.75rem",
                fontSize: "0.84rem",
                color: "#f1f5f9",
                fontFamily: "inherit"
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "0 0.5rem"
                }}
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
            <div
              style={{
                marginRight: "0.85rem",
                fontSize: "0.72rem",
                color: "#64748b",
                whiteSpace: "nowrap",
                borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                paddingLeft: "0.65rem",
                flexShrink: 0
              }}
            >
              {filteredReasons.length} dari {REJECTION_REASONS.length} Alasan
            </div>
          </div>

          {/* Clean Filter Pills (No redundant icons, wrap cleanly without horizontal scrollbar) */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.35rem 0.45rem",
              alignItems: "center"
            }}
          >
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              const label = cat === "ALL" ? "Semua" : cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: isActive
                      ? "var(--brand-primary)"
                      : "rgba(255, 255, 255, 0.04)",
                    border: isActive
                      ? "1px solid var(--brand-primary)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    borderRadius: "6px",
                    padding: "0.28rem 0.65rem",
                    fontSize: "0.74rem",
                    fontWeight: isActive ? 600 : 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    outline: "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.color = "#f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <span>{label}</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      opacity: isActive ? 0.9 : 0.6,
                      background: isActive ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.06)",
                      padding: "0.05rem 0.3rem",
                      borderRadius: "4px"
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.2rem 1.6rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            background: "#0c1017"
          }}
        >
          {/* Active Filter Note if filtered */}
          {(selectedCategory !== "ALL" || search.trim()) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.4rem 0.75rem",
                background: "rgba(56, 189, 248, 0.07)",
                border: "1px solid rgba(56, 189, 248, 0.15)",
                borderRadius: "6px",
                fontSize: "0.75rem",
                color: "#93c5fd"
              }}
            >
              <span>
                Menampilkan: <strong>{selectedCategory === "ALL" ? "Semua" : selectedCategory}</strong>
                {search.trim() && ` • Kata kunci: "${search}"`}
              </span>

              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.72rem",
                  fontWeight: 600
                }}
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>
          )}

          {filteredReasons.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3.5rem 1.5rem",
                color: "#64748b",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.6rem"
              }}
            >
              <HelpCircle size={36} style={{ color: "#475569" }} />
              <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "#94a3b8", margin: 0 }}>
                Tidak ada alasan penolakan yang sesuai
              </p>
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Coba gunakan kata kunci lain seperti "blur", "watermark", "resolusi", atau "hak cipta".
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                style={{ marginTop: "0.4rem" }}
              >
                <RotateCcw size={12} />
                <span>Tampilkan Semua</span>
              </button>
            </div>
          ) : (
            filteredReasons.map((item) => {
              const isCritical = item.priority === "CRITICAL";
              const isHigh = item.priority === "HIGH";

              const priorityBg = isCritical
                ? "rgba(239, 68, 68, 0.12)"
                : isHigh
                ? "rgba(249, 115, 22, 0.12)"
                : "rgba(245, 158, 11, 0.12)";
              const priorityBorder = isCritical
                ? "rgba(239, 68, 68, 0.3)"
                : isHigh
                ? "rgba(249, 115, 22, 0.3)"
                : "rgba(245, 158, 11, 0.3)";
              const priorityColor = isCritical
                ? "#f87171"
                : isHigh
                ? "#fb923c"
                : "#fbbf24";

              const catColor = CATEGORY_COLORS[item.category] || "#94a3b8";

              return (
                <div
                  key={item.id}
                  style={{
                    padding: "1.1rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "8px",
                    background: "#131822",
                    transition: "border-color 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                  }}
                >
                  {/* Clean Card Top Row: Category text badge & Priority */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: catColor
                      }}
                    >
                      {item.category}
                    </span>

                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        background: priorityBg,
                        border: `1px solid ${priorityBorder}`,
                        color: priorityColor,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase"
                      }}
                    >
                      {item.priority === "CRITICAL" ? "KRITIS" : item.priority === "HIGH" ? "TINGGI" : item.priority === "MEDIUM" ? "SEDANG" : "INFO"}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 style={{ fontSize: "1.02rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                    {item.title}
                  </h4>

                  {/* Structured Details: What & Why (Clean & readable, no emojis) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.82rem" }}>
                    <div style={{ lineHeight: 1.5 }}>
                      <span style={{ color: "#94a3b8", fontWeight: 600, marginRight: "0.4rem" }}>
                        Penyebab:
                      </span>
                      <span style={{ color: "#cbd5e1" }}>
                        {item.what}
                      </span>
                    </div>

                    <div style={{ lineHeight: 1.5 }}>
                      <span style={{ color: "#f59e0b", fontWeight: 600, marginRight: "0.4rem" }}>
                        Aturan Adobe:
                      </span>
                      <span style={{ color: "#cbd5e1" }}>
                        {item.why}
                      </span>
                    </div>
                  </div>

                  {/* Clean Solution Box (Soft green accent, copy button) */}
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.07)",
                      border: "1px solid rgba(16, 185, 129, 0.22)",
                      borderRadius: "6px",
                      padding: "0.65rem 0.85rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#34d399", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.03em" }}>
                        SOLUSI PERBAIKAN:
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopySolution(item.id, item.howToFix)}
                        style={{
                          background: copiedId === item.id ? "#059669" : "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                          borderRadius: "4px",
                          padding: "0.15rem 0.45rem",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: copiedId === item.id ? "#ffffff" : "#a7f3d0",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={11} />
                            <span>Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Salin Solusi</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p style={{ color: "#e2e8f0", margin: 0, fontSize: "0.82rem", lineHeight: 1.5, fontWeight: 500 }}>
                      {item.howToFix}
                    </p>
                  </div>

                  {/* Clean Tags Chips (No redundant tag icon) */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.1rem" }}>
                      {item.tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSearch(t)}
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            color: "#8593a6",
                            fontSize: "0.68rem",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--brand-primary)";
                            e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#8593a6";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                          }}
                          title={`Filter kata kunci "${t}"`}
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
