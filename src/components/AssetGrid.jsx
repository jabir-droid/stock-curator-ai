import React from "react";
import {
  Folder, Eye, Download, Trash2, Zap, Sparkles, Loader2,
  CheckCircle2, AlertTriangle, AlertOctagon, XCircle, CheckCheck,
  FileText, Users, X
} from "lucide-react";

export function AssetGrid({
  assets,
  totalUploaded,
  selectedIds,
  isolatedGroup,
  onClearIsolatedGroup,
  onIsolateGroup,
  onToggleSelect,
  onToggleSelectAll,
  onInspectAsset,
  onDownloadOriginal,
  onDeleteAsset,
  onLoadSamples,
  viewMode
}) {
  const isAllSelected = assets.length > 0 && selectedIds.length === assets.length;

  if (totalUploaded === 0) {
    return (
      <div className="empty-state-box animate-fade-in">
        <div className="empty-folder-icon">
          <Folder size={28} />
        </div>
        <h3 className="empty-title">Belum ada aset yang di-upload</h3>
        <p className="empty-subtitle">
          Upload file gambar JPEG, PNG, vector EPS, AI, atau SVG Anda untuk memulai inspeksi pra-moderasi Adobe Stock.
        </p>
        <div style={{ marginTop: "1.25rem" }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={onLoadSamples}
            style={{ gap: "0.4rem" }}
          >
            <Sparkles size={14} />
            <span>Muat Sampel Demo (1-Klik)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Isolated Group Banner if user filtered to a specific similarity group */}
      {isolatedGroup && (
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: "0.75rem 1.25rem",
            marginBottom: "0.85rem",
            background: "var(--status-similars-bg)",
            border: "1px solid var(--status-similars-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <Users size={16} style={{ color: "var(--status-similars)" }} />
            <div>
              <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>
                Menampilkan Variasi Serupa: {isolatedGroup} ({assets.length} aset)
              </strong>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Rekomendasi Adobe Stock: Pilih hanya 1 variasi terkuat dalam seri prompt ini untuk menghindari penolakan spam katalog.
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClearIsolatedGroup}
            style={{ fontSize: "0.75rem", gap: "0.3rem" }}
          >
            <X size={12} />
            <span>Tampilkan Semua Aset</span>
          </button>
        </div>
      )}

      {/* Batch Select Row */}
      <div className="batch-select-row">
        <label className="select-all-label">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            className="checklist-checkbox"
          />
          <span>Pilih Semua Aset ({assets.length})</span>
        </label>
        <span>Klik aset untuk membuka panel kurasi lengkap</span>
      </div>

      {assets.length === 0 ? (
        <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>
            Tidak ada aset yang cocok dengan filter atau kata kunci pencarian.
          </p>
          <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
            Coba ganti filter atau hapus kata kunci pencarian.
          </span>
        </div>
      ) : viewMode === "table" ? (
        <div className="asset-table-wrapper animate-fade-in">
          <table className="asset-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th style={{ width: "60px" }}>Pratinjau</th>
                <th>Nama File</th>
                <th>Format</th>
                <th>Resolusi &amp; MP</th>
                <th>Ukuran</th>
                <th>Hasil Kurator</th>
                <th>Status</th>
                <th>Grup Serupa</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                return (
                  <tr key={asset.id} onClick={() => onInspectAsset(asset)} style={{ cursor: "pointer" }}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(asset.id)}
                        className="checklist-checkbox"
                      />
                    </td>
                    <td>
                      <img
                        src={asset.metadata.previewUrl}
                        alt={asset.metadata.filename}
                        className="table-thumb"
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span>{asset.metadata.filename}</span>
                        {asset.isReviewed && (
                          <CheckCheck size={13} style={{ color: "var(--status-ready)" }} title="Sudah Ditinjau" />
                        )}
                        {asset.curatorNotes && (
                          <FileText size={12} style={{ color: "#f59e0b" }} title="Ada Catatan Pribadi" />
                        )}
                      </div>
                      {asset.aiDetection?.isLikelyAi && (
                        <span className="badge badge-info" style={{ fontSize: "0.65rem", marginTop: "2px" }}>
                          AI Generatif
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="spec-pill">{asset.metadata.extension.toUpperCase()}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {asset.metadata.width}×{asset.metadata.height} ({asset.metadata.megapixels} MP)
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {asset.metadata.sizeMB} MB
                    </td>
                    <td>
                      {renderVerdictBadge(asset.verdict)}
                    </td>
                    <td>
                      {renderStatusBadge(asset.status)}
                    </td>
                    <td>
                      {asset.similarityGroup ? (
                        <button
                          className="badge badge-similars"
                          style={{ fontSize: "0.7rem", border: "none", cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onIsolateGroup && onIsolateGroup(asset.similarityGroup);
                          }}
                          title={`Bandingkan seluruh variasi dalam ${asset.similarityGroup}`}
                        >
                          {asset.similarityGroup}
                        </button>
                      ) : (
                        <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.3rem 0.5rem" }}
                          onClick={() => onInspectAsset(asset)}
                          title="Inspeksi Kurasi Lengkap"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.3rem 0.5rem" }}
                          onClick={() => onDownloadOriginal(asset)}
                          title="Unduh File Asli (Byte-Asli)"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: "0.3rem 0.5rem" }}
                          onClick={() => onDeleteAsset(asset)}
                          title="Hapus Aset dari Sesi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* 4-Column Grid matching Image 1 Reference */
        <div className="asset-grid">
          {assets.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            const extUpper = (asset.metadata.extension || "JPG").toUpperCase();
            const formatLabel = extUpper === "JPEG" ? "JPG" : extUpper;

            const verdictKey = asset.verdict?.key || (asset.status === "ANALYZING" ? "ANALYZING" : "UNKNOWN");
            let labelColorClass = "card-label-neutral";
            if (verdictKey === "READY") labelColorClass = "card-label-ready";
            else if (verdictKey === "REVIEW") labelColorClass = "card-label-review";
            else if (verdictKey === "HIGH_RISK") labelColorClass = "card-label-highrisk";
            else if (verdictKey === "NOT_RECOMMENDED") labelColorClass = "card-label-notrec";
            else if (asset.status === "ANALYZING") labelColorClass = "card-label-analyzing";

            return (
              <div
                key={asset.id}
                className={`asset-card-pro ${labelColorClass} animate-fade-in`}
                onClick={() => onInspectAsset(asset)}
              >
                {/* Image Container with overlay badges */}
                <div className="asset-card-thumb-wrap">
                  <img
                    src={asset.metadata.previewUrl}
                    alt=""
                    aria-label={asset.metadata.filename}
                    className="asset-card-img"
                    loading="lazy"
                    style={{ color: "transparent" }}
                  />

                  {/* Top-Left: Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSelect(asset.id);
                    }}
                    className="card-select-checkbox"
                    style={{ zIndex: 10 }}
                  />

                  {/* Top-Right: Format Pill & Similarity Group Pill */}
                  <div className="card-top-right-badges" style={{ zIndex: 10 }}>
                    <span className="badge-format-pill">
                      {formatLabel}
                    </span>
                    {asset.similarityGroup && (
                      <span
                        className="badge-group-pill"
                        title={`Klik untuk membandingkan grup ${asset.similarityGroup}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onIsolateGroup && onIsolateGroup(asset.similarityGroup);
                        }}
                      >
                        {asset.similarityGroup}
                      </span>
                    )}
                  </div>

                  {/* Bottom-Left: Megapixels Pill */}
                  <div className="badge-resolution-pill" style={{ zIndex: 10 }}>
                    <Zap size={10} style={{ color: "#38bdf8" }} />
                    <span>
                      {asset.metadata.megapixels > 0
                        ? `${asset.metadata.megapixels} MP`
                        : "Memuat..."}
                    </span>
                  </div>

                  {/* Bottom-Right: Quick Indicators (Reviewed & Note) */}
                  <div style={{ position: "absolute", bottom: "7px", right: "7px", display: "flex", gap: "4px", zIndex: 10 }}>
                    {asset.isReviewed && (
                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.9)",
                          color: "#ffffff",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.4rem",
                          borderRadius: "3px",
                          display: "flex",
                          alignItems: "center",
                          gap: "2px"
                        }}
                        title="Telah Ditinjau"
                      >
                        <CheckCheck size={10} />
                      </span>
                    )}
                    {asset.curatorNotes && (
                      <span
                        style={{
                          background: "rgba(245, 158, 11, 0.9)",
                          color: "#ffffff",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.4rem",
                          borderRadius: "3px"
                        }}
                        title="Ada Catatan Kontributor"
                      >
                        📝
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Details (Filename & Specs) */}
                <div className="asset-card-details">
                  <div className="card-filename-text" title={asset.metadata.filename}>
                    {asset.metadata.filename}
                  </div>

                  <div className="card-specs-text">
                    {asset.metadata.width > 0
                      ? `${asset.metadata.width} × ${asset.metadata.height} • ${asset.metadata.sizeMB} MB`
                      : `${asset.metadata.sizeMB} MB`}
                  </div>

                  {/* Clean Verdict Row */}
                  <div className="card-verdict-row">
                    {asset.status === "ANALYZING" ? (
                      <span className="badge badge-info animate-pulse" style={{ fontSize: "0.68rem" }}>
                        <Loader2 size={10} className="animate-spin" /> Menganalisis...
                      </span>
                    ) : (
                      renderVerdictBadge(asset.verdict)
                    )}
                    {asset.aiDetection?.isLikelyAi && (
                      <span className="badge badge-neutral" style={{ fontSize: "0.62rem" }} title="Aset AI Generatif">
                        AI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderVerdictBadge(verdict) {
  if (!verdict) return null;
  let icon = null;
  if (verdict.key === "READY") icon = <CheckCircle2 size={11} />;
  else if (verdict.key === "REVIEW") icon = <AlertTriangle size={11} />;
  else if (verdict.key === "HIGH_RISK") icon = <AlertOctagon size={11} />;
  else if (verdict.key === "NOT_RECOMMENDED") icon = <XCircle size={11} />;

  return (
    <span className={`badge ${verdict.badgeClass}`} style={{ fontSize: "0.68rem", padding: "0.18rem 0.55rem" }}>
      {icon}
      <span>{verdict.label}</span>
    </span>
  );
}

function renderStatusBadge(status) {
  switch (status) {
    case "ANALYZING":
      return (
        <span className="badge badge-info animate-pulse" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>
          <Loader2 size={10} className="animate-spin" /> MENGANALISIS
        </span>
      );
    case "PASSED":
      return <span className="badge badge-ready" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>LOLOS</span>;
    case "REVIEW":
      return <span className="badge badge-review" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>DITINJAU</span>;
    case "WARNING":
      return <span className="badge badge-review" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>PERINGATAN</span>;
    case "REJECT_RISK":
      return <span className="badge badge-highrisk" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>RISIKO</span>;
    case "ERROR":
      return <span className="badge badge-notrec" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>GAGAL</span>;
    default:
      return null;
  }
}
