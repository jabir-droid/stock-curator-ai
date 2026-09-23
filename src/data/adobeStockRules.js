/**
 * Aturan & Panduan Resmi Pengajuan Konten Adobe Stock
 * Referensi Sumber Resmi:
 * - Ilustrasi: https://helpx.adobe.com/stock/contributor/submit-your-content/submit-illustrations/technical-legal-requirements-illustration-submission.html
 * - Generative AI: https://helpx.adobe.com/stock/contributor/submit-your-content/submit-generative-ai-content/generative-ai-content-guidelines.html
 * - Vektor: https://helpx.adobe.com/stock/contributor/submit-your-content/submit-vectors/technical-requirements-for-vector-submissions.html
 * - Editorial Ilustratif: https://helpx.adobe.com/stock/contributor/submit-your-content/submit-illustrative-editorial-content/illustrative-editorial-content-submission-overview.html
 */

export const ADOBE_STOCK_RULES = {
  version: "2026.1",
  disclaimer: {
    title: "Pemberitahuan Pra-Moderasi Independen",
    text: "STOCK CURATOR AI menyediakan bantuan diagnostik heuristik otomatis berdasarkan panduan kontributor Adobe Stock. Hasil analisis otomatis tidak menjamin penerimaan atau penolakan oleh tim kurasi Adobe Stock. Keputusan akhir sepenuhnya berada di tangan kurator resmi Adobe Stock."
  },

  verdicts: {
    READY: {
      key: "READY",
      label: "Siap Submit",
      color: "var(--status-ready)",
      badgeClass: "badge-ready",
      icon: "CheckCircle2",
      description: "Aset memenuhi persyaratan teknis dan tidak ditemukan indikasi risiko pelanggaran tinggi."
    },
    REVIEW: {
      key: "REVIEW",
      label: "Perlu Ditinjau",
      color: "var(--status-review)",
      badgeClass: "badge-review",
      icon: "AlertTriangle",
      description: "Aset berpotensi layak, namun memerlukan konfirmasi kontributor terkait rilis hak cipta, kepatuhan AI, atau variasi serupa."
    },
    HIGH_RISK: {
      key: "HIGH_RISK",
      label: "Risiko Tinggi Ditolak",
      color: "var(--status-highrisk)",
      badgeClass: "badge-highrisk",
      icon: "AlertOctagon",
      description: "Terdeteksi faktor yang sering menyebabkan penolakan kurator (seperti watermark, logo merek komersial, atau cacat teknis berat)."
    },
    NOT_RECOMMENDED: {
      key: "NOT_RECOMMENDED",
      label: "Tidak Disarankan",
      color: "var(--status-notrec)",
      badgeClass: "badge-notrec",
      icon: "XCircle",
      description: "Aset melanggar batas wajib Adobe Stock (misalnya di bawah 4 MP, melebihi 45 MB, atau format tidak didukung)."
    }
  },

  illustrationJpeg: {
    format: "JPEG",
    minMegapixels: 4.0,
    maxMegapixels: 100.0,
    maxFileSizeBytes: 45 * 1024 * 1024, // 45 MB
    colorSpace: "sRGB",
    rulesCitations: [
      "Resolusi gambar minimal 4 Megapiksel (MP) dan tidak boleh melebihi 100 Megapiksel.",
      "Ukuran file maksimal adalah 45 Megabita (MB).",
      "File wajib disimpan dalam profil warna sRGB."
    ]
  },

  vector: {
    formats: ["AI", "EPS", "SVG"],
    maxFileSizeBytes: 45 * 1024 * 1024, // 45 MB
    minArtboardMP: 15.0,
    maxArtboardMP: 65.0,
    artboardOrigin: { x: 0, y: 0 },
    colorMode: "RGB",
    rulesCitations: [
      "Artboard vektor harus berukuran antara 15 MP hingga 65 MP.",
      "Koordinat artboard wajib diposisikan pada titik offset (0, 0).",
      "Ukuran maksimal file vektor adalah 45 MB.",
      "Wajib disimpan dalam mode ruang warna RGB.",
      "Tidak boleh ada path terbuka, anchor point terisolasi, font belum di-outline, atau elemen bitmap raster yang tertanam."
    ]
  },

  generativeAI: {
    guidelines: [
      "Wajib diberi label sebagai Generative AI saat submission ke portal Adobe Stock.",
      "Orang dan properti wajib bersifat fiktif kecuali memiliki dokumen rilis yang sah.",
      "Prompt, judul, dan kata kunci DILARANG menyebut nama artis nyata, tokoh publik, atau IP berhak cipta.",
      "DILARANG menggambarkan peristiwa berita nyata atau tokoh sejarah/publik sebagai kejadian faktual.",
      "Kontributor wajib memiliki hak komersial penuh atas karya AI yang diunggah."
    ],
    checklistItems: [
      { id: "is_gen_ai", text: "Dibuat menggunakan alat AI Generatif (Wajib Centang)", defaultChecked: true },
      { id: "fictional_people", text: "Karakter orang & properti 100% fiktif", defaultChecked: false },
      { id: "rights_confirmed", text: "Memiliki hak lisensi komersial penuh untuk submit", defaultChecked: false },
      { id: "clean_prompt", text: "Bebas referensi terlarang (tanpa nama seniman nyata, tokoh publik, atau merek)", defaultChecked: false },
      { id: "no_misleading", text: "Tidak menyesatkan representasi peristiwa dunia nyata", defaultChecked: false },
      { id: "no_third_party_ip", text: "Bebas dari IP pihak ketiga, logo komersial, atau karakter berhak cipta", defaultChecked: false }
    ]
  },

  illustrativeEditorial: {
    description: "Karya visual konseptual yang mengilustrasikan peristiwa terkini atau topik berita dengan merek/tokoh nyata untuk keperluan komentar editorial.",
    eligibilityNotice: "Adobe Stock mensyaratkan akun kontributor aktif dengan minimal 100+ penjualan/unduhan yang disetujui untuk dapat mengajukan konten Editorial Ilustratif.",
    guidelines: [
      "Harus berupa ilustrasi konseptual yang merepresentasikan berita atau peristiwa aktual bernilai jurnalistik.",
      "Logo atau produk yang dapat dikenali hanya diperbolehkan dalam konteks komentar editorial, bukan sebagai stok produk tunggal.",
      "Judul wajib mengikuti format editorial Adobe: [Kota], [Negara] - [Tanggal]: [Deskripsi faktual].",
      "Tidak dapat diajukan sebagai stok komersial standar."
    ]
  }
};
