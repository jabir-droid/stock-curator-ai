import React from "react";

export function CopySpaceOverlay({ copySpace, imageWidth, imageHeight }) {
  if (!copySpace || !copySpace.gridVariances) return null;

  const variances = copySpace.gridVariances;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        border: "1px dashed rgba(255, 255, 255, 0.3)",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden"
      }}
    >
      {variances.map((row, rIdx) =>
        row.map((val, cIdx) => {
          const isCopySpace = val < 180;
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              style={{
                border: "1px dashed rgba(255, 255, 255, 0.2)",
                backgroundColor: isCopySpace ? "rgba(16, 185, 129, 0.18)" : "rgba(239, 68, 68, 0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.25rem",
                color: isCopySpace ? "#a7f3d0" : "#fca5a5",
                fontSize: "0.65rem",
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(0,0,0,0.8)"
              }}
            >
              <span>{isCopySpace ? "RUANG TEKS" : "SUBJEK"}</span>
              <span style={{ fontSize: "0.55rem", opacity: 0.8 }}>var: {val}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
