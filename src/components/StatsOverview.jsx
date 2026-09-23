import React from "react";
import { Layers, CheckCircle2, AlertTriangle, AlertOctagon, XCircle, Copy } from "lucide-react";

export function StatsOverview({ assets }) {
  const total = assets.length;
  const ready = assets.filter(a => a.verdict?.key === "READY").length;
  const review = assets.filter(a => a.verdict?.key === "REVIEW").length;
  const highRisk = assets.filter(a => a.verdict?.key === "HIGH_RISK").length;
  const notRec = assets.filter(a => a.verdict?.key === "NOT_RECOMMENDED").length;
  const batchSimilars = assets.filter(a => !!a.similarityGroup).length;

  return (
    <div className="stats-filmstrip-container animate-fade-in">
      {/* 1. Total Aset */}
      <div className="filmstrip-card stat-total">
        <div className="filmstrip-header">
          <span>Total Aset</span>
          <Layers size={14} />
        </div>
        <div className="filmstrip-val">{total}</div>
      </div>

      {/* 2. Likely Ready */}
      <div className="filmstrip-card stat-ready">
        <div className="filmstrip-header">
          <span>Siap Submit</span>
          <CheckCircle2 size={14} style={{ color: "var(--status-ready)" }} />
        </div>
        <div className="filmstrip-val text-ready">{ready}</div>
      </div>

      {/* 3. Needs Review */}
      <div className="filmstrip-card stat-review">
        <div className="filmstrip-header">
          <span>Perlu Ditinjau</span>
          <AlertTriangle size={14} style={{ color: "var(--status-review)" }} />
        </div>
        <div className="filmstrip-val text-review">{review}</div>
      </div>

      {/* 4. High Risk */}
      <div className="filmstrip-card stat-highrisk">
        <div className="filmstrip-header">
          <span>Risiko Tinggi</span>
          <AlertOctagon size={14} style={{ color: "var(--status-highrisk)" }} />
        </div>
        <div className="filmstrip-val text-highrisk">{highRisk}</div>
      </div>

      {/* 5. Not Recommended */}
      <div className="filmstrip-card stat-notrec">
        <div className="filmstrip-header">
          <span>Tidak Disarankan</span>
          <XCircle size={14} style={{ color: "var(--status-notrec)" }} />
        </div>
        <div className="filmstrip-val text-notrec">{notRec}</div>
      </div>

      {/* 6. Batch Similars */}
      <div className="filmstrip-card stat-similars">
        <div className="filmstrip-header">
          <span>Aset Serupa</span>
          <Copy size={14} style={{ color: "var(--status-similars)" }} />
        </div>
        <div className="filmstrip-val text-similars">{batchSimilars}</div>
      </div>
    </div>
  );
}
