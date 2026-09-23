import React from "react";
import {
  LayoutGrid, List, Cpu, Compass, ShieldAlert, Users,
  UserCheck, Wrench, Sparkles, X
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
  counts
}) {
  const tabs = [
    { id: "ALL", label: "Semua", count: counts.total },
    { id: "READY", label: "Siap Submit", count: counts.ready },
    { id: "REVIEW", label: "Perlu Ditinjau", count: counts.review },
    { id: "HIGH_RISK", label: "Risiko Tinggi", count: counts.highRisk },
    { id: "NOT_RECOMMENDED", label: "Tidak Disarankan", count: counts.notRec },
    { id: "AI", label: "AI Generatif", count: counts.ai },
    { id: "VECTOR", label: "Vektor", count: counts.vector },
    { id: "IP", label: "Potensi IP/Merek", count: counts.ip },
    { id: "RELEASE", label: "Dokumen Rilis", count: counts.release },
    { id: "TECH_ISSUE", label: "Kendala Teknis", count: counts.techIssue },
    { id: "QUALITY_ISSUE", label: "Kualitas Visual", count: counts.qualityIssue },
    { id: "DUPLICATE", label: "Grup Serupa", count: counts.duplicate }
  ];

  return (
    <div className="filter-container animate-fade-in">
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

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto", flexShrink: 0 }}>
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
