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
