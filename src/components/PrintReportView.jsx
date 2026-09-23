import React from "react";
import { Printer, X, Shield, FileCheck, CheckCircle2, AlertTriangle, AlertOctagon, XCircle } from "lucide-react";

export function PrintReportView({ assets, onClose }) {
  if (!assets || assets.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const counts = {
    total: assets.length,
    ready: assets.filter(a => a.verdict?.key === "READY").length,
    review: assets.filter(a => a.verdict?.key === "REVIEW").length,
    highRisk: assets.filter(a => a.verdict?.key === "HIGH_RISK").length,
    notRec: assets.filter(a => a.verdict?.key === "NOT_RECOMMENDED").length
  };

  return (
    <div className="modal-backdrop print-modal-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="glass-card print-modal-container animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "1050px",
          width: "95%",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--bg-surface-elevated)",
          padding: "2rem",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.7)"
        }}
      >
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <FileCheck size={20} style={{ color: "var(--brand-primary)" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#ffffff" }}>
              Lembar Audit Pra-Submission Adobe Stock
            </h3>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ gap: "0.4rem" }}>
              <Printer size={14} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="printable-audit-doc">
          {/* Document Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #3b82f6", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <Shield size={24} style={{ color: "#3b82f6" }} />
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                  STOCK CURATOR AI
                </h1>
                <span style={{ fontSize: "0.75rem", background: "#dbeafe", color: "#1e40af", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                  LAPORAN AUDIT ADOBE STOCK
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Analisis Pra-Moderasi &amp; Audit Kualitas Independen Adobe Stock
              </p>
            </div>

            <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#64748b" }}>
              <div><strong>Tanggal Audit:</strong> {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</div>
              <div><strong>Total Aset:</strong> {counts.total} File</div>
            </div>
          </div>

          {/* Statistics Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ border: "1px solid #e2e8f0", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>TOTAL ASET</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{counts.total}</div>
            </div>
            <div style={{ border: "1px solid #10b981", background: "#ecfdf5", padding: "0.75rem", borderRadius: "6px", textAlign: "center", color: "#065f46" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600 }}>SIAP SUBMIT</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{counts.ready}</div>
            </div>
            <div style={{ border: "1px solid #f59e0b", background: "#fffbeb", padding: "0.75rem", borderRadius: "6px", textAlign: "center", color: "#92400e" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600 }}>PERLU DITINJAU</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{counts.review}</div>
            </div>
            <div style={{ border: "1px solid #f97316", background: "#fff7ed", padding: "0.75rem", borderRadius: "6px", textAlign: "center", color: "#9a3412" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600 }}>RISIKO TINGGI</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{counts.highRisk}</div>
            </div>
            <div style={{ border: "1px solid #ef4444", background: "#fef2f2", padding: "0.75rem", borderRadius: "6px", textAlign: "center", color: "#991b1b" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600 }}>TIDAK DISARANKAN</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{counts.notRec}</div>
            </div>
          </div>

          {/* Assets Detailed Audit Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "0.6rem 0.5rem" }}>#</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Nama File</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Format &amp; Tipe</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Dimensi / MP</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Ukuran</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Hasil Kurator</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Catatan &amp; Rekomendasi</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, idx) => {
                const issues = asset.issues || [];
                const acts = asset.recommendedActions || [];
                return (
                  <tr key={asset.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "0.6rem 0.5rem", verticalAlign: "top", fontFamily: "monospace" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem", verticalAlign: "top", fontWeight: 600 }}>
                      {asset.metadata.filename}
                      {asset.aiDetection?.isLikelyAi && (
                        <span style={{ display: "inline-block", fontSize: "0.65rem", background: "#e0e7ff", color: "#3730a3", padding: "0.1rem 0.35rem", borderRadius: "3px", marginLeft: "4px" }}>
                          AI
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem", verticalAlign: "top" }}>
                      {asset.metadata.extension.toUpperCase()} ({asset.metadata.contentType || "Raster"})
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem", verticalAlign: "top", fontFamily: "monospace" }}>
                      {asset.metadata.width}×{asset.metadata.height} ({asset.metadata.megapixels} MP)
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem", verticalAlign: "top", fontFamily: "monospace" }}>
                      {asset.metadata.sizeMB} MB
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem", verticalAlign: "top" }}>
                      <span style={{ fontWeight: 700, color: asset.verdict?.color || "#000" }}>
                        {asset.verdict?.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem", verticalAlign: "top" }}>
                      {issues.length > 0 ? (
                        <div style={{ color: "#b91c1c", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                          <strong>Masalah:</strong> {issues.map(i => `[${i.priority === "CRITICAL" ? "KRITIS" : i.priority === "HIGH" ? "TINGGI" : i.priority === "MEDIUM" ? "SEDANG" : "INFO"}] ${i.title}`).join("; ")}
                        </div>
                      ) : (
                        <div style={{ color: "#047857", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                          ✓ Lolos pemeriksaan standar Adobe Stock.
                        </div>
                      )}
                      {acts.length > 0 && (
                        <div style={{ color: "#475569", fontSize: "0.72rem" }}>
                          <strong>Rekomendasi Tindakan:</strong> {acts[0]}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Advisory Footer */}
          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #cbd5e1", fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>
              <strong>Disclaimer Resmi:</strong> Laporan ini dihasilkan secara otomatis oleh <strong>STOCK CURATOR AI</strong> berdasarkan panduan teknis resmi Adobe Stock (Ilustrasi JPEG, Vektor SVG/AI/EPS, Generative AI Guidelines, dan Illustrative Editorial). Hasil analisis ini bersifat pra-moderasi independen untuk membantu kontributor mengurangi risiko penolakan dan tidak menjamin penerimaan akhir oleh kurator Adobe Stock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
