import React from "react";
import { Shield, BookOpen, Cpu, UploadCloud, Sun, Moon } from "lucide-react";

export function Header({
  theme,
  onToggleTheme,
  onOpenRules,
  onOpenRejectionLibrary,
  onOpenAiEngine,
  onOpenAdobeExport,
  readyCount = 0,
  totalAssets = 0,
  onTriggerUpload
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-shield-icon">
            <Shield size={20} />
          </div>
          <div>
            <div className="brand-title">
              STOCK CURATOR AI
              <span className="brand-badge-adobe">
                Studio Pro
              </span>
            </div>
            <div className="brand-tagline">
              Periksa Sebelum Upload. Kurangi Risiko Ditolak.
            </div>
          </div>
        </div>

        {/* Lightroom Studio Workspace Navigation Tabs */}
        <nav className="studio-workspace-tabs" aria-label="Studio Workspace">
          <button 
            className="workspace-tab" 
            onClick={onOpenRejectionLibrary}
            title="Perpustakaan Panduan Alasan Penolakan Kurator (WHAT • WHY • HOW TO FIX)"
          >
            <BookOpen size={13} style={{ color: "#38bdf8" }} />
            <span>PANDUAN KURATOR</span>
          </button>
          <button 
            className="workspace-tab" 
            onClick={onOpenRules}
            title="Panduan Kepatuhan & Standar Resmi Adobe Stock"
          >
            <Shield size={13} style={{ color: "#f59e0b" }} />
            <span>ATURAN RESMI</span>
          </button>
          <button 
            className="workspace-tab" 
            onClick={onOpenAiEngine}
            title="Pengaturan Mesin AI (Integrasi Gemini Vision & Analisis Heuristik Lokal)"
          >
            <Cpu size={13} style={{ color: "#a855f7" }} />
            <span>MESIN AI</span>
          </button>
        </nav>

        {/* Quick Studio Actions */}
        <div className="header-actions">
          {totalAssets > 0 && (
            <button
              className="btn btn-sm animate-fade-in"
              onClick={onOpenAdobeExport}
              title="Buka Pusat Pengiriman Adobe Stock (Unduh ZIP Lolos, Trik Windows, Metadata CSV)"
              style={{
                background: readyCount > 0 ? "rgba(16, 185, 129, 0.16)" : "var(--bg-surface-elevated)",
                border: `1px solid ${readyCount > 0 ? "rgba(16, 185, 129, 0.4)" : "var(--border-medium)"}`,
                color: readyCount > 0 ? "var(--status-ready)" : "var(--text-secondary)",
                fontWeight: 600,
                gap: "0.35rem"
              }}
            >
              <UploadCloud size={13} />
              <span>Kirim ke Adobe</span>
              {readyCount > 0 && (
                <span
                  style={{
                    background: "var(--status-ready)",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    padding: "0.05rem 0.4rem",
                    borderRadius: "999px",
                    fontWeight: 700,
                    lineHeight: "1.2"
                  }}
                >
                  {readyCount}
                </span>
              )}
            </button>
          )}

          <button 
            className="btn btn-primary btn-sm" 
            onClick={onTriggerUpload}
            title="Unggah Aset (JPEG, PNG, EPS, AI, SVG)"
          >
            <UploadCloud size={14} />
            <span>Unggah Aset</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onToggleTheme}
            title="Ganti Tema Terang / Gelap"
            style={{ padding: '0.42rem', marginLeft: '0.15rem' }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
