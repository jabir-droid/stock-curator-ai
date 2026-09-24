import React from "react";
import {
  LayoutGrid, List, Trophy, ShieldAlert, ShieldCheck, X
} from "lucide-react";

export function FilterBar({
  activeFilter,
  onFilterChange,
  isolatedGroup,
  onClearIsolatedGroup,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  counts,
  strictnessMode = "BALANCED",
  onToggleStrictness
}) {
  const tabs = [
    { id: "ALL", label: "Semua", count: counts.total },
    { id: "READY", label: "🏆 Siap Submit", count: counts.ready },
    { id: "REVIEW", label: "Perlu Ditinjau", count: counts.review },
    { id: "DUPLICATE_RISK", label: "⛔ Duplikat Batch", count: counts.duplicateRisks },
    ...(counts.historicalDuplicates > 0 ? [{ id: "HISTORICAL_DUPLICATE", label: "🏛️ Duplikat Riwayat", count: counts.historicalDuplicates }] : []),
    { id: "HIGH_RISK", label: "Risiko Tinggi", count: counts.highRisk },
    { id: "NOT_RECOMMENDED", label: "Tidak Disarankan", count: counts.notRec },
    { id: "QUALITY_ISSUE", label: "Kualitas Visual (100%)", count: counts.qualityIssue },
    { id: "AI", label: "AI Generatif", count: counts.ai },
    { id: "VECTOR", label: "Vektor", count: counts.vector },
    { id: "IP", label: "Potensi IP/Merek", count: counts.ip },
    { id: "RELEASE", label: "Dokumen Rilis", count: counts.release },
    { id: "TECH_ISSUE", label: "Kendala Teknis", count: counts.techIssue }
  ];

  const isStrict = strictnessMode === "STRICT_ADOBE";

  return (
    <div className="filter-container animate-fade-in" style={{ position: "relative", zIndex: 4 }}>
      <span className="filter-label">FILTER:</span>

      <div className="filter-pills-list">
        {/* Isolated Group Pill if active */}
        {isolatedGroup && (
          <button
            className="filter-pill-btn active"
            style={{ background: "#4f46e5", borderColor: "#818cf8" }}
            onClick={onClearIsolatedGroup}
            title="Klik untuk keluar dari grup kemiripan dan menampilkan semua aset"
          >
            <span>Grup: {isolatedGroup}</span>
            <X size={11} style={{ marginLeft: "3px" }} />
          </button>
        )}

        {tabs.map((tab) => {
          const isActive = !isolatedGroup && activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              className={`filter-pill-btn ${isActive ? "active" : ""}`}
              onClick={() => {
                if (isolatedGroup) onClearIsolatedGroup();
                onFilterChange(tab.id);
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span style={{ fontSize: "0.7rem", opacity: 0.8, marginLeft: "1px" }}>
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto", flexShrink: 0, position: "relative", zIndex: 1 }}>
        {/* Strictness Mode Selector */}
        {onToggleStrictness && (
          <button
            className={`btn btn-sm ${isStrict ? "btn-danger" : "btn-secondary"}`}
            style={{
              padding: "0.3rem 0.6rem",
              fontSize: "0.72rem",
              gap: "0.3rem",
              borderColor: isStrict ? "#ef4444" : "var(--border-medium)",
              boxShadow: isStrict ? "0 0 10px rgba(239, 68, 68, 0.4)" : "none"
            }}
            onClick={onToggleStrictness}
            title={
              isStrict
                ? "Mode Kurator Ketat Adobe AKTIF: Toleransi nol untuk micro-blur 100% dan submission duplikat serupa."
                : "Mode Standar Aktif: Klik untuk beralih ke Mode Kurator Ketat Adobe."
            }
          >
            {isStrict ? <ShieldAlert size={13} style={{ color: "#fff" }} /> : <ShieldCheck size={13} style={{ color: "#38bdf8" }} />}
            <span>{isStrict ? "Mode Kurator Ketat" : "Mode Standar"}</span>
          </button>
        )}

        <select
          className="search-field-input"
          style={{ width: "auto", padding: "0.32rem 0.6rem", fontSize: "0.775rem" }}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="NAME">Urutkan: Nama File</option>
          <option value="MEGAPIXELS">Urutkan: Megapiksel</option>
          <option value="SIZE">Urutkan: Ukuran File</option>
          <option value="STATUS">Urutkan: Tingkat Risiko</option>
          <option value="CHAMPION">Urutkan: Champion Teratas</option>
        </select>

        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "0.15rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
          <button
            className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-outline"}`}
            style={{ padding: "0.25rem 0.45rem", border: "none" }}
            onClick={() => onViewModeChange("grid")}
            title="Tampilan Grid"
          >
            <LayoutGrid size={13} />
          </button>
          <button
            className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-outline"}`}
            style={{ padding: "0.25rem 0.45rem", border: "none" }}
            onClick={() => onViewModeChange("table")}
            title="Tampilan Tabel"
          >
            <List size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
