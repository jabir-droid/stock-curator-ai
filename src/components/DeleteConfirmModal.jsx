import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetAsset = null,
  selectedCount = 0
}) {
  if (!isOpen) return null;

  const isBulk = selectedCount > 1;
  const promptText = isBulk
    ? `Hapus ${selectedCount} aset yang dipilih?`
    : targetAsset
      ? `Hapus aset ini dari sesi kurasi?`
      : `Hapus aset terpilih?`;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} style={{ zIndex: 2200 }}>
      <div
        className="glass-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "420px",
          width: "90%",
          padding: "1.5rem",
          background: "var(--bg-surface-elevated)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          position: "relative"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "none",
            color: "var(--text-tertiary)",
            cursor: "pointer"
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--status-notrec)",
              flexShrink: 0
            }}
          >
            <Trash2 size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 0.4rem 0", color: "#ffffff", fontSize: "1.05rem", fontWeight: 700 }}>
              {promptText}
            </h4>

            {!isBulk && targetAsset && (
              <p
                style={{
                  margin: "0 0 0.6rem 0",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  color: "#94a3b8",
                  wordBreak: "break-all"
                }}
              >
                {targetAsset.metadata?.filename}
              </p>
            )}

            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Aset hanya dihapus dari sesi kurasi peramban aktif. File asli pada penyimpanan lokal komputer Anda tidak akan terhapus.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.65rem",
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border-subtle)"
          }}
        >
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Batal
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ gap: "0.35rem" }}
          >
            <Trash2 size={13} />
            <span>Konfirmasi Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}
