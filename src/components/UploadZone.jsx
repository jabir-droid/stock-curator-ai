import React, { useRef, useState } from "react";
import { Image, Sparkles, FolderUp, UploadCloud } from "lucide-react";

export function UploadZone({ onFilesSelected, onLoadSamples, isProcessing, inputRef }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const internalFileRef = useRef(null);
  const fileInputRef = inputRef || internalFileRef;
  const folderInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div
      className={`upload-zone-container ${isDragActive ? "drag-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.eps,.ai,.svg,.webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="upload-icon-box">
        <Image size={30} />
      </div>

      <div className="upload-main-text">
        Tarik &amp; Lepas (Drag &amp; Drop) file aset atau <span className="link-accent">Pilih dari Komputer</span>
      </div>

      <div className="upload-sub-text">
        Mendukung JPEG, PNG, EPS, AI, SVG, dan WebP (bisa pilih banyak file sekaligus)
      </div>

      <div className="upload-pills-row" onClick={(e) => e.stopPropagation()}>
        <span className="spec-pill">JPEG (Min 4 MP, Maks 100 MP, &lt;45 MB)</span>
        <span className="spec-pill">Vektor EPS/AI/SVG (15-65 MP, &lt;45 MB)</span>
        <span className="spec-pill" style={{ color: "var(--status-ready)", borderColor: "var(--status-ready-border)" }}>
          File Asli Terjaga 100% (Byte-Asli)
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onLoadSamples}
          disabled={isProcessing}
        >
          <Sparkles size={14} />
          <span>Muat Sampel Demo (1-Klik)</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => folderInputRef.current?.click()}
          disabled={isProcessing}
        >
          <FolderUp size={14} />
          <span>Unggah Folder</span>
        </button>
      </div>
    </div>
  );
}
