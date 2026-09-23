import React, { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "./components/Header";
import { StatsOverview } from "./components/StatsOverview";
import { UploadZone } from "./components/UploadZone";
import { BulkActionBar } from "./components/BulkActionBar";
import { FilterBar } from "./components/FilterBar";
import { AssetGrid } from "./components/AssetGrid";
import { AssetDetailModal } from "./components/AssetDetailModal";
import { RejectionLibraryModal } from "./components/RejectionLibraryModal";
import { AdobeRulesModal } from "./components/AdobeRulesModal";
import { AiEngineModal } from "./components/AiEngineModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { PrintReportView } from "./components/PrintReportView";
import { AdobeStockExportModal } from "./components/AdobeStockExportModal";

import { readFileMetadata, determineInitialContentType } from "./core/analyzers/fileMetadataReader";
import { inspectVisualQuality } from "./core/analyzers/visualQuality";
import { detectGenerativeAI } from "./core/analyzers/aiDetector";
import { analyzeIpAndReleases } from "./core/analyzers/ipRiskAnalyzer";
import { analyzeCopySpace } from "./core/analyzers/copySpaceAnalyzer";
import { analyzeCommercialStockValue } from "./core/analyzers/commercialInsight";
import { computePerceptualHash, clusterSimilarAssets } from "./core/analyzers/batchSimilarity";
import { evaluateCuratorVerdict } from "./core/analyzers/curatorVerdict";
import { generateSampleAssets } from "./data/sampleAssets";
import { ADOBE_STOCK_RULES } from "./data/adobeStockRules";

import { Info, ShieldCheck, Database, UploadCloud } from "lucide-react";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("stock_curator_theme") || "dark");
  const [assets, setAssets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isolatedGroup, setIsolatedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("NAME");
  const [viewMode, setViewMode] = useState("grid");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActiveOnMain, setIsDragActiveOnMain] = useState(false);

  const [inspectingAssetId, setInspectingAssetId] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showAiEngineModal, setShowAiEngineModal] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [showAdobeExportModal, setShowAdobeExportModal] = useState(false);

  // Delete confirmation modal state
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    targetAsset: null,
    selectedCount: 0
  });

  const universalUploadInputRef = useRef(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("stock_curator_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const inspectingAsset = useMemo(() => {
    return assets.find(a => a.id === inspectingAssetId) || null;
  }, [assets, inspectingAssetId]);

  // File analysis pipeline with Instant Preview & Concurrent Progressive Updates
  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    // 1. Instantly create assets with valid previewUrl so all thumbnails appear immediately!
    const newAssets = files.map((file, idx) => {
      const ext = file.name.split('.').pop().toLowerCase();
      const isVector = ["svg", "eps", "ai"].includes(ext);
      // For raster files, create Object URL synchronously
      const previewUrl = ext === "svg" ? "" : URL.createObjectURL(file);
      const initialType = determineInitialContentType(file.name, isVector, ext);

      return {
        id: `asset-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
        status: "WAITING",
        isReviewed: false,
        metadata: {
          filename: file.name,
          rawFile: file,
          extension: ext,
          sizeBytes: file.size,
          sizeMB: Number((file.size / (1024 * 1024)).toFixed(2)),
          previewUrl: previewUrl,
          width: 0,
          height: 0,
          megapixels: 0,
          aspectRatio: "...",
          colorProfile: "sRGB",
          isVector: isVector,
          contentType: initialType.type
        },
        pHash: null,
        isIllustrativeEditorial: false,
        curatorNotes: localStorage.getItem(`curator_note_${file.name}`) || ""
      };
    });

    // Put all new assets into state immediately so all cards and images display instantly!
    setAssets(prev => [...newAssets, ...prev]);

    // 2. Fast background analysis with concurrency of 4
    const concurrency = 4;
    const queue = [...newAssets];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        // Set this asset to ANALYZING
        setAssets(prev => prev.map(a => a.id === item.id ? { ...a, status: "ANALYZING" } : a));

        try {
          const metadata = await readFileMetadata(item.metadata.rawFile, item.metadata.previewUrl);
          const pHash = await computePerceptualHash(metadata.previewUrl);
          const visualQuality = await inspectVisualQuality(metadata.previewUrl, metadata);
          const aiDetection = await detectGenerativeAI(metadata.previewUrl, metadata);
          const ipRisk = await analyzeIpAndReleases(metadata.previewUrl, metadata);
          const copySpace = await analyzeCopySpace(metadata.previewUrl);
          const commercialValue = analyzeCommercialStockValue(metadata, copySpace, visualQuality);

          const verdictData = evaluateCuratorVerdict({
            metadata,
            visualQuality,
            aiDetection,
            ipRisk,
            copySpace,
            commercialValue,
            similarityGroup: null,
            isIllustrativeEditorial: item.isIllustrativeEditorial
          });

          let status = "PASSED";
          if (verdictData.verdict.key === "NOT_RECOMMENDED") status = "REJECT_RISK";
          else if (verdictData.verdict.key === "HIGH_RISK") status = "WARNING";
          else if (verdictData.verdict.key === "REVIEW") status = "REVIEW";

          const analyzedItem = {
            ...item,
            status,
            metadata,
            pHash,
            visualQuality,
            aiDetection,
            ipRisk,
            copySpace,
            commercialValue,
            verdict: verdictData.verdict,
            verdictReason: verdictData.verdictReason,
            pros: verdictData.pros,
            issues: verdictData.issues,
            recommendedActions: verdictData.recommendedActions,
            diagnosticMeters: verdictData.diagnosticMeters
          };

          // PROGRESSIVE LIVE UPDATE: Flip this card to its verdict and update stats immediately!
          setAssets(prev => prev.map(a => a.id === item.id ? analyzedItem : a));
        } catch (err) {
          console.error("Asset analysis failed for", item.metadata.filename, err);
          setAssets(prev => prev.map(a => a.id === item.id ? {
            ...a,
            status: "ERROR",
            errorDetail: err.message
          } : a));
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, newAssets.length) }, () => worker());
    await Promise.all(workers);

    // 3. Final cross-batch clustering for similarity groups (A, B, etc.)
    setAssets(prev => {
      const clustered = clusterSimilarAssets(prev);
      return clustered.map(asset => {
        if (!asset.metadata?.rawFile || asset.status === "ERROR") return asset;
        const verdictData = evaluateCuratorVerdict({
          metadata: asset.metadata,
          visualQuality: asset.visualQuality || {},
          aiDetection: asset.aiDetection || {},
          ipRisk: asset.ipRisk || {},
          copySpace: asset.copySpace || {},
          commercialValue: asset.commercialValue || {},
          similarityGroup: asset.similarityGroup,
          isIllustrativeEditorial: asset.isIllustrativeEditorial
        });

        let status = "PASSED";
        if (verdictData.verdict.key === "NOT_RECOMMENDED") status = "REJECT_RISK";
        else if (verdictData.verdict.key === "HIGH_RISK") status = "WARNING";
        else if (verdictData.verdict.key === "REVIEW") status = "REVIEW";

        return {
          ...asset,
          status,
          verdict: verdictData.verdict,
          verdictReason: verdictData.verdictReason,
          pros: verdictData.pros,
          issues: verdictData.issues,
          recommendedActions: verdictData.recommendedActions,
          diagnosticMeters: verdictData.diagnosticMeters
        };
      });
    });

    setIsProcessing(false);
  };

  const handleLoadSamples = async () => {
    setIsProcessing(true);
    const sampleFiles = await generateSampleAssets();
    await processFiles(sampleFiles);
  };

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const allVisibleSelected = filteredAssets.length > 0 && filteredAssets.every(a => selectedIds.includes(a.id));
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredAssets.map(a => a.id));
      setSelectedIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const combined = new Set([...selectedIds, ...filteredAssets.map(a => a.id)]);
      setSelectedIds(Array.from(combined));
    }
  };

  const handleDownloadOriginal = (asset) => {
    const rawFile = asset.metadata.rawFile;
    if (!rawFile) return;

    const url = URL.createObjectURL(rawFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = asset.metadata.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  // Custom Delete Modal triggers
  const handleRequestDeleteAsset = (asset) => {
    setDeleteModalConfig({
      isOpen: true,
      targetAsset: asset,
      selectedCount: 1
    });
  };

  const handleRequestDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalConfig({
      isOpen: true,
      targetAsset: null,
      selectedCount: selectedIds.length
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModalConfig.targetAsset) {
      const id = deleteModalConfig.targetAsset.id;
      setAssets(prev => prev.filter(a => a.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      if (inspectingAssetId === id) setInspectingAssetId(null);
    } else if (deleteModalConfig.selectedCount > 0) {
      setAssets(prev => prev.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
    }
  };

  // Bulk actions: Move to Ready & Move to Review (Section 20)
  const handleMoveSelectedToReady = () => {
    if (selectedIds.length === 0) return;
    setAssets(prev => prev.map(a => {
      if (selectedIds.includes(a.id)) {
        return {
          ...a,
          verdict: ADOBE_STOCK_RULES.verdicts.READY,
          verdictReason: "Diverifikasi & disetujui secara manual oleh kontributor (Manual Ready).",
          status: "PASSED",
          isReviewed: true
        };
      }
      return a;
    }));
  };

  const handleMoveSelectedToReview = () => {
    if (selectedIds.length === 0) return;
    setAssets(prev => prev.map(a => {
      if (selectedIds.includes(a.id)) {
        return {
          ...a,
          verdict: ADOBE_STOCK_RULES.verdicts.REVIEW,
          verdictReason: "Ditandai untuk peninjauan mendalam oleh kontributor (Contributor Flagged).",
          status: "REVIEW",
          isReviewed: true
        };
      }
      return a;
    }));
  };

  const handleMarkSelectedReviewed = () => {
    if (selectedIds.length === 0) return;
    setAssets(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, isReviewed: true } : a));
  };

  const handleToggleReviewed = (assetId) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, isReviewed: !a.isReviewed } : a));
  };

  const handleReanalyzeSingle = async (assetId) => {
    const target = assets.find(a => a.id === assetId);
    if (!target) return;
    try {
      const metadata = target.metadata.rawFile ? await readFileMetadata(target.metadata.rawFile) : target.metadata;
      const pHash = await computePerceptualHash(metadata.previewUrl);
      const visualQuality = await inspectVisualQuality(metadata.previewUrl, metadata);
      const aiDetection = await detectGenerativeAI(metadata.previewUrl, metadata);
      const ipRisk = await analyzeIpAndReleases(metadata.previewUrl, metadata);
      const copySpace = await analyzeCopySpace(metadata.previewUrl);
      const commercialValue = analyzeCommercialStockValue(metadata, copySpace, visualQuality);

      const verdictData = evaluateCuratorVerdict({
        metadata, visualQuality, aiDetection, ipRisk, copySpace, commercialValue,
        similarityGroup: target.similarityGroup,
        isIllustrativeEditorial: target.isIllustrativeEditorial
      });

      setAssets(prev => prev.map(a => a.id === assetId ? {
        ...a,
        metadata, pHash, visualQuality, aiDetection, ipRisk, copySpace, commercialValue,
        verdict: verdictData.verdict,
        verdictReason: verdictData.verdictReason,
        pros: verdictData.pros,
        issues: verdictData.issues,
        recommendedActions: verdictData.recommendedActions,
        diagnosticMeters: verdictData.diagnosticMeters
      } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReanalyzeBatch = async () => {
    if (assets.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const concurrency = 4;
    const queue = [...assets];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        // Mark as analyzing
        setAssets(prev => prev.map(a => a.id === item.id ? { ...a, status: "ANALYZING" } : a));

        try {
          const metadata = item.metadata.rawFile
            ? await readFileMetadata(item.metadata.rawFile, item.metadata.previewUrl)
            : item.metadata;
          const pHash = await computePerceptualHash(metadata.previewUrl);
          const visualQuality = await inspectVisualQuality(metadata.previewUrl, metadata);
          const aiDetection = await detectGenerativeAI(metadata.previewUrl, metadata);
          const ipRisk = await analyzeIpAndReleases(metadata.previewUrl, metadata);
          const copySpace = await analyzeCopySpace(metadata.previewUrl);
          const commercialValue = analyzeCommercialStockValue(metadata, copySpace, visualQuality);

          const verdictData = evaluateCuratorVerdict({
            metadata,
            visualQuality,
            aiDetection,
            ipRisk,
            copySpace,
            commercialValue,
            similarityGroup: item.similarityGroup,
            isIllustrativeEditorial: item.isIllustrativeEditorial
          });

          let status = "PASSED";
          if (verdictData.verdict.key === "NOT_RECOMMENDED") status = "REJECT_RISK";
          else if (verdictData.verdict.key === "HIGH_RISK") status = "WARNING";
          else if (verdictData.verdict.key === "REVIEW") status = "REVIEW";

          const updatedAsset = {
            ...item,
            status,
            metadata,
            pHash,
            visualQuality,
            aiDetection,
            ipRisk,
            copySpace,
            commercialValue,
            verdict: verdictData.verdict,
            verdictReason: verdictData.verdictReason,
            pros: verdictData.pros,
            issues: verdictData.issues,
            recommendedActions: verdictData.recommendedActions,
            diagnosticMeters: verdictData.diagnosticMeters
          };

          // Progressive live card update
          setAssets(prev => prev.map(a => a.id === item.id ? updatedAsset : a));
        } catch (err) {
          console.error("Reanalysis error for", item.metadata?.filename, err);
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, assets.length) }, () => worker());
    await Promise.all(workers);

    // Final clustering pass
    setAssets(prev => {
      const clustered = clusterSimilarAssets(prev);
      return clustered.map(asset => {
        if (!asset.metadata?.rawFile || asset.status === "ERROR") return asset;
        const verdictData = evaluateCuratorVerdict({
          metadata: asset.metadata,
          visualQuality: asset.visualQuality || {},
          aiDetection: asset.aiDetection || {},
          ipRisk: asset.ipRisk || {},
          copySpace: asset.copySpace || {},
          commercialValue: asset.commercialValue || {},
          similarityGroup: asset.similarityGroup,
          isIllustrativeEditorial: asset.isIllustrativeEditorial
        });

        let status = "PASSED";
        if (verdictData.verdict.key === "NOT_RECOMMENDED") status = "REJECT_RISK";
        else if (verdictData.verdict.key === "HIGH_RISK") status = "WARNING";
        else if (verdictData.verdict.key === "REVIEW") status = "REVIEW";

        return {
          ...asset,
          status,
          verdict: verdictData.verdict,
          verdictReason: verdictData.verdictReason,
          pros: verdictData.pros,
          issues: verdictData.issues,
          recommendedActions: verdictData.recommendedActions,
          diagnosticMeters: verdictData.diagnosticMeters
        };
      });
    });

    setIsProcessing(false);
  };

  const handleUpdateNotes = (assetId, notesText) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        localStorage.setItem(`curator_note_${a.metadata.filename}`, notesText);
        return { ...a, curatorNotes: notesText };
      }
      return a;
    }));
  };

  const handleToggleEditorialMode = (assetId, isEditorial) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const updated = { ...a, isIllustrativeEditorial: isEditorial };
        const verdictData = evaluateCuratorVerdict({
          metadata: updated.metadata,
          visualQuality: updated.visualQuality || {},
          aiDetection: updated.aiDetection || {},
          ipRisk: updated.ipRisk || {},
          copySpace: updated.copySpace || {},
          commercialValue: updated.commercialValue || {},
          similarityGroup: updated.similarityGroup,
          isIllustrativeEditorial: isEditorial
        });
        return {
          ...updated,
          verdict: verdictData.verdict,
          verdictReason: verdictData.verdictReason,
          pros: verdictData.pros,
          issues: verdictData.issues,
          recommendedActions: verdictData.recommendedActions,
          diagnosticMeters: verdictData.diagnosticMeters
        };
      }
      return a;
    }));
  };

  const handleExportCsv = () => {
    if (assets.length === 0) return;
    const headers = [
      "Filename", "Extension", "Content Type", "Width", "Height", "Megapixels", "File Size (MB)",
      "Color Profile", "Curator Verdict", "Status", "Reviewed", "Generative AI", "IP Risk",
      "Model Release Required", "Similarity Group", "Critical Issues", "Recommended Action"
    ];

    const rows = assets.map(a => [
      `"${a.metadata.filename}"`,
      `"${a.metadata.extension}"`,
      `"${a.metadata.contentType || 'ILLUSTRATION'}"`,
      a.metadata.width,
      a.metadata.height,
      a.metadata.megapixels,
      a.metadata.sizeMB,
      `"${a.metadata.colorProfile}"`,
      `"${a.verdict?.label || 'N/A'}"`,
      `"${a.status}"`,
      a.isReviewed ? "YES" : "NO",
      a.aiDetection?.isLikelyAi ? "YES" : "NO",
      `"${a.ipRisk?.riskLevel || 'LOW'}"`,
      a.ipRisk?.modelReleaseRequired ? "YES" : "NO",
      `"${a.similarityGroup || 'None'}"`,
      `"${(a.issues || []).map(i => i.title).join('; ')}"`,
      `"${(a.recommendedActions || []).join('; ')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `adobe_stock_curator_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (assets.length === 0) return;
    const cleanData = assets.map(a => ({
      filename: a.metadata.filename,
      extension: a.metadata.extension,
      contentType: a.metadata.contentType,
      dimensions: `${a.metadata.width}x${a.metadata.height}`,
      megapixels: a.metadata.megapixels,
      sizeMB: a.metadata.sizeMB,
      colorProfile: a.metadata.colorProfile,
      verdict: a.verdict?.label,
      isReviewed: !!a.isReviewed,
      diagnosticMeters: a.diagnosticMeters,
      isLikelyAi: a.aiDetection?.isLikelyAi,
      ipRiskLevel: a.ipRisk?.riskLevel,
      modelReleaseRequired: a.ipRisk?.modelReleaseRequired,
      propertyReleaseRequired: a.ipRisk?.propertyReleaseRequired,
      similarityGroup: a.similarityGroup,
      issues: a.issues,
      recommendedActions: a.recommendedActions,
      curatorNotes: a.curatorNotes
    }));

    const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock_curator_audit_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  // Comprehensive Counts for 8+ Filters
  const counts = useMemo(() => {
    return {
      total: assets.length,
      ready: assets.filter(a => a.verdict?.key === "READY").length,
      review: assets.filter(a => a.verdict?.key === "REVIEW").length,
      highRisk: assets.filter(a => a.verdict?.key === "HIGH_RISK").length,
      notRec: assets.filter(a => a.verdict?.key === "NOT_RECOMMENDED").length,
      ai: assets.filter(a => a.aiDetection?.isLikelyAi).length,
      vector: assets.filter(a => a.metadata?.isVector).length,
      ip: assets.filter(a => a.ipRisk?.issues?.some(i => i.category === "TRADEMARK")).length,
      release: assets.filter(a => a.ipRisk?.modelReleaseRequired || a.ipRisk?.propertyReleaseRequired).length,
      techIssue: assets.filter(a => (a.issues || []).some(i => i.category === "TECHNICAL")).length,
      qualityIssue: assets.filter(a => (a.issues || []).some(i => i.category === "VISUAL_QUALITY")).length,
      duplicate: assets.filter(a => !!a.similarityGroup).length
    };
  }, [assets]);

  // Filtered Assets Engine
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!asset.metadata.filename.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 2. Similarity Group Isolation
      if (isolatedGroup) {
        return asset.similarityGroup === isolatedGroup;
      }

      // 3. Tab Filter
      switch (activeFilter) {
        case "READY": return asset.verdict?.key === "READY";
        case "REVIEW": return asset.verdict?.key === "REVIEW";
        case "HIGH_RISK": return asset.verdict?.key === "HIGH_RISK";
        case "NOT_RECOMMENDED": return asset.verdict?.key === "NOT_RECOMMENDED";
        case "AI": return !!asset.aiDetection?.isLikelyAi;
        case "VECTOR": return !!asset.metadata?.isVector;
        case "IP": return (asset.ipRisk?.issues || []).some(i => i.category === "TRADEMARK");
        case "RELEASE": return !!(asset.ipRisk?.modelReleaseRequired || asset.ipRisk?.propertyReleaseRequired);
        case "TECH_ISSUE": return (asset.issues || []).some(i => i.category === "TECHNICAL");
        case "QUALITY_ISSUE": return (asset.issues || []).some(i => i.category === "VISUAL_QUALITY");
        case "DUPLICATE": return !!asset.similarityGroup;
        default: return true;
      }
    }).sort((a, b) => {
      if (sortBy === "MEGAPIXELS") return (b.metadata.megapixels || 0) - (a.metadata.megapixels || 0);
      if (sortBy === "SIZE") return (b.metadata.sizeBytes || 0) - (a.metadata.sizeBytes || 0);
      if (sortBy === "STATUS") {
        const order = { NOT_RECOMMENDED: 0, HIGH_RISK: 1, REVIEW: 2, READY: 3 };
        return (order[a.verdict?.key] ?? 4) - (order[b.verdict?.key] ?? 4);
      }
      return a.metadata.filename.localeCompare(b.metadata.filename);
    });
  }, [assets, activeFilter, isolatedGroup, searchQuery, sortBy]);

  // Drag & drop handlers
  const handleMainDragOver = (e) => {
    e.preventDefault();
    if (!isDragActiveOnMain) setIsDragActiveOnMain(true);
  };

  const handleMainDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragActiveOnMain(false);
  };

  const handleMainDrop = (e) => {
    e.preventDefault();
    setIsDragActiveOnMain(false);
    if (e.dataTransfer.files?.length) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      className="app-container"
      onDragOver={handleMainDragOver}
      onDragLeave={handleMainDragLeave}
      onDrop={handleMainDrop}
    >
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenRejectionLibrary={() => setShowRejectionModal(true)}
        onOpenAiEngine={() => setShowAiEngineModal(true)}
        onOpenAdobeExport={() => setShowAdobeExportModal(true)}
        readyCount={counts.ready}
        totalAssets={assets.length}
        onTriggerUpload={() => universalUploadInputRef.current?.click()}
      />

      <main className="main-content">
        {/* Notice Banners */}
        {assets.length === 0 ? (
          <div className="notice-banner notice-info animate-fade-in">
            <Info size={15} style={{ color: "#38bdf8", flexShrink: 0 }} />
            <span>
              <strong>Pra-Moderasi Independen:</strong> Aplikasi ini memberikan evaluasi berbasis panduan resmi Adobe Stock. Keputusan akhir mutlak ditentukan oleh tim kurator internal Adobe Stock.
            </span>
          </div>
        ) : (
          <div className="notice-banner notice-shield animate-fade-in">
            <ShieldCheck size={15} style={{ color: "#10b981", flexShrink: 0 }} />
            <span>
              <strong>Tanpa Kompresi Ulang:</strong> File asli dipertahankan tanpa manipulasi byte (100% byte-original) selama sesi peramban.
            </span>
          </div>
        )}

        {/* Hero Section if 0 assets */}
        {assets.length === 0 ? (
          <div>
            <div className="hero-section animate-fade-in">
              <h1 className="hero-title">Penganalisis Pra-Submission Adobe Stock</h1>
              <p className="hero-subtitle">
                Analisis kepatuhan teknis, kualitas visual, artefak AI, risiko IP &amp; hak cipta, kemiripan batch, serta nilai komersial sebelum melakukan submission.
              </p>
            </div>

            <UploadZone
              onFilesSelected={processFiles}
              onLoadSamples={handleLoadSamples}
              isProcessing={isProcessing}
            />
          </div>
        ) : (
          <>
            {/* 6 Stats Overview cards */}
            <StatsOverview assets={assets} />

            {/* Action & Search Bar */}
            <BulkActionBar
              assets={filteredAssets}
              selectedIds={selectedIds}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onReanalyzeBatch={handleReanalyzeBatch}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
              onOpenPrintReport={() => setShowPrintReport(true)}
              onOpenAdobeExport={() => setShowAdobeExportModal(true)}
              readyCount={counts.ready}
              onDeleteSelected={handleRequestDeleteSelected}
              onMarkSelectedReviewed={handleMarkSelectedReviewed}
              onMoveSelectedToReady={handleMoveSelectedToReady}
              onMoveSelectedToReview={handleMoveSelectedToReview}
              isProcessing={isProcessing}
            />

            {/* Filter Pills Bar */}
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              isolatedGroup={isolatedGroup}
              onClearIsolatedGroup={() => setIsolatedGroup(null)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              counts={counts}
            />

            {/* Banner Khusus Tab Siap Submit */}
            {activeFilter === "READY" && counts.ready > 0 && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "0.9rem 1.25rem",
                  marginBottom: "0.85rem",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.08))",
                  border: "1px solid rgba(16, 185, 129, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(16, 185, 129, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--status-ready)"
                    }}
                  >
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                      {counts.ready} Foto Lolos Kurasi Siap Submit ke Adobe Stock
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Gunakan Hub Pengiriman untuk mengunduh ZIP bersih, salin nama file untuk Windows File Picker, atau download CSV metadata.
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-sm"
                  onClick={() => setShowAdobeExportModal(true)}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "none",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.45)",
                    padding: "0.45rem 1.1rem",
                    gap: "0.4rem"
                  }}
                >
                  <UploadCloud size={15} />
                  <span>Kirim {counts.ready} Foto ke Adobe Stock</span>
                </button>
              </div>
            )}

            {/* Drag feedback indicator */}
            {isDragActiveOnMain && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  padding: "1rem",
                  marginBottom: "0.85rem",
                  textAlign: "center",
                  border: "2px dashed var(--brand-primary)",
                  background: "rgba(99, 102, 241, 0.12)",
                  color: "#c7d2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontWeight: 600
                }}
              >
                <UploadCloud size={18} />
                <span>Lepaskan file untuk menambahkan aset ke sesi kurasi batch saat ini</span>
              </div>
            )}

            {/* Asset Grid / Table */}
            <AssetGrid
              assets={filteredAssets}
              totalUploaded={assets.length}
              selectedIds={selectedIds}
              isolatedGroup={isolatedGroup}
              onClearIsolatedGroup={() => setIsolatedGroup(null)}
              onIsolateGroup={(grp) => setIsolatedGroup(grp)}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onInspectAsset={(a) => setInspectingAssetId(a.id)}
              onDownloadOriginal={handleDownloadOriginal}
              onDeleteAsset={handleRequestDeleteAsset}
              onLoadSamples={handleLoadSamples}
              viewMode={viewMode}
            />
          </>
        )}

        {/* Universal upload input */}
        <input
          ref={universalUploadInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.eps,.ai,.svg,.webp"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) {
              processFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <strong>STOCK CURATOR AI &bull; Asisten Pra-Submission Adobe Stock</strong>
            <div>Alat independen untuk kontributor microstock. Bukan produk resmi dari Adobe Inc.</div>
          </div>

          <div className="footer-badges">
            <div className="footer-badge-item">
              <ShieldCheck size={14} style={{ color: "#38bdf8" }} />
              <span>Privasi Terjaga: Pemrosesan Lokal</span>
            </div>
            <div className="footer-badge-item">
              <Database size={14} style={{ color: "#10b981" }} />
              <span>Sesi Memori Aman</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      {inspectingAsset && (
        <AssetDetailModal
          asset={inspectingAsset}
          onClose={() => setInspectingAssetId(null)}
          onDownloadOriginal={handleDownloadOriginal}
          onDeleteAsset={handleRequestDeleteAsset}
          onUpdateNotes={handleUpdateNotes}
          onToggleEditorialMode={handleToggleEditorialMode}
          onToggleReviewed={handleToggleReviewed}
          onReanalyzeSingle={handleReanalyzeSingle}
        />
      )}

      {/* Adobe Stock Rules Modal */}
      {showRulesModal && (
        <AdobeRulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {/* Rejection Reasons Knowledge Base Modal */}
      {showRejectionModal && (
        <RejectionLibraryModal onClose={() => setShowRejectionModal(false)} />
      )}

      {/* AI Engine Settings Modal */}
      {showAiEngineModal && (
        <AiEngineModal onClose={() => setShowAiEngineModal(false)} />
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        targetAsset={deleteModalConfig.targetAsset}
        selectedCount={deleteModalConfig.selectedCount}
        onClose={() => setDeleteModalConfig({ isOpen: false, targetAsset: null, selectedCount: 0 })}
        onConfirm={handleConfirmDelete}
      />

      {/* Printable / PDF Curation Sheet View */}
      {showPrintReport && (
        <PrintReportView
          assets={assets}
          onClose={() => setShowPrintReport(false)}
        />
      )}

      {/* Adobe Stock Submission Hub Modal */}
      <AdobeStockExportModal
        isOpen={showAdobeExportModal}
        onClose={() => setShowAdobeExportModal(false)}
        assets={assets}
        selectedIds={selectedIds}
      />
    </div>
  );
}
