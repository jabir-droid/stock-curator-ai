import React from "react";
import { X, ExternalLink, ShieldCheck, FileCheck, Cpu, Newspaper } from "lucide-react";
import { ADOBE_STOCK_RULES } from "../data/adobeStockRules";

export function AdobeRulesModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "880px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--bg-surface)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShieldCheck size={22} style={{ color: "var(--brand-primary)" }} />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                Panduan Resmi Kontributor Adobe Stock
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Standar kurasi & spesifikasi teknis kurator (Mesin Aturan v{ADOBE_STOCK_RULES.version})
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "0.35rem" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem 1rem", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--text-primary)" }}>{ADOBE_STOCK_RULES.disclaimer.title}:</strong> {ADOBE_STOCK_RULES.disclaimer.text}
          </div>

          {/* Section 1: Illustration */}
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <FileCheck size={18} style={{ color: "var(--status-ready)" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>1. Pengajuan Ilustrasi Raster (JPEG)</h4>
            </div>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {ADOBE_STOCK_RULES.illustrationJpeg.rulesCitations.map((cite, i) => (
                <li key={i}>{cite}</li>
              ))}
              <li>Dilarang menyertakan tanda air (watermark), tanda tangan kreator, tanggal (timestamp), atau bingkai batas visual.</li>
            </ul>
          </div>

          {/* Section 2: Vector */}
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <FileCheck size={18} style={{ color: "var(--brand-primary)" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>2. Pengajuan File Vektor (AI, EPS, SVG)</h4>
            </div>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {ADOBE_STOCK_RULES.vector.rulesCitations.map((cite, i) => (
                <li key={i}>{cite}</li>
              ))}
            </ul>
          </div>

          {/* Section 3: Generative AI */}
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Cpu size={18} style={{ color: "var(--status-info)" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>3. Pedoman Konten AI Generatif</h4>
            </div>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {ADOBE_STOCK_RULES.generativeAI.guidelines.map((guide, i) => (
                <li key={i}>{guide}</li>
              ))}
            </ul>
          </div>

          {/* Section 4: Illustrative Editorial */}
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Newspaper size={18} style={{ color: "var(--status-review)" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>4. Konten Editorial Ilustratif</h4>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              {ADOBE_STOCK_RULES.illustrativeEditorial.description}
            </p>
            <div style={{ padding: "0.6rem 0.85rem", background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--status-review-border)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--status-review)", marginBottom: "0.5rem" }}>
              <strong>Syarat Wajib Akun:</strong> {ADOBE_STOCK_RULES.illustrativeEditorial.eligibilityNotice}
            </div>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {ADOBE_STOCK_RULES.illustrativeEditorial.guidelines.map((guide, i) => (
                <li key={i}>{guide}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
