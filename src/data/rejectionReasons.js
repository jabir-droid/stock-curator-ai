/**
 * Knowledge Base Alasan Penolakan Resmi Adobe Stock
 * Menjelaskan APA YANG TERJADI (WHAT), MENGAPA ADOBE MENOLAK (WHY), dan CARA MEMPERBAIKI (HOW TO FIX).
 */

export const REJECTION_REASONS = [
  {
    id: "tech_resolution_low",
    category: "Kendala Teknis",
    title: "Resolusi Gambar di Bawah 4 MP",
    what: "Resolusi gambar lebih rendah dari syarat wajib minimal 4 Megapiksel (lebar × tinggi < 4.000.000 piksel).",
    why: "Adobe Stock mewajibkan seluruh pengajuan ilustrasi memiliki resolusi komersial tinggi agar dapat dicetak format besar dan tajam di layar resolusi tinggi.",
    howToFix: "Render ulang atau ekspor karya dari file mentah asli dengan dimensi minimal 2000×2000 piksel atau lebih besar (4 MP hingga 100 MP). Hindari upscale buatan (bicubic enlargement).",
    priority: "CRITICAL",
    tags: ["resolusi", "megapiksel", "dimensi", "pixel"]
  },
  {
    id: "tech_filesize_limit",
    category: "Kendala Teknis",
    title: "Ukuran File Melebihi 45 MB",
    what: "Ukuran file yang diunggah melebihi batas 45 Megabita (MB).",
    why: "Sistem server Adobe Stock menerapkan batasan ketat maksimal 45 MB per file unggahan.",
    howToFix: "Simpan dengan pengaturan kompresi JPEG optimal (level 10-11, jangan 12 uncompressed) atau hapus layer tersembunyi/tidak terpakai pada file vektor.",
    priority: "CRITICAL",
    tags: ["ukuran file", "storage", "limit", "kapasitas"]
  },
  {
    id: "tech_color_profile",
    category: "Kendala Teknis",
    title: "Profil Warna Bukan sRGB",
    what: "Gambar disimpan dalam mode CMYK, Adobe RGB (1998), Display P3, atau tidak memiliki profil warna yang disematkan.",
    why: "Standar Adobe Stock mewajibkan profil sRGB untuk gambar raster agar tampilan warna konsisten di seluruh web browser dan perangkat pembeli.",
    howToFix: "Di Photoshop / Lightroom / Illustrator, pilih menu 'Convert to Profile' -> 'sRGB IEC61966-2.1' dan pastikan centang opsi 'Embed Color Profile' saat menyimpan.",
    priority: "HIGH",
    tags: ["warna", "sRGB", "CMYK", "profil warna"]
  },
  {
    id: "tech_compression_artifacts",
    category: "Kendala Teknis",
    title: "Artefak Kompresi & Pikselasi Berat",
    what: "Terlihat pola kotak-kotak blok 8x8 (JPEG artifact), ringing di sekitar tepi kontras, atau detail pecah akibat kompresi berulang.",
    why: "Pembeli stok menginginkan kualitas prima. Artefak kompresi merusak nilai komersial gambar dan membuat aset tidak dapat di-zoom atau dicetak.",
    howToFix: "Selalu ekspor langsung dari file master tanpa kompresi (PSD/TIFF/RAW/SVG) dengan kualitas maksimal (JPEG level 10-12) tanpa menyimpan berulang-ulang.",
    priority: "HIGH",
    tags: ["kompresi", "artefak", "pikselasi", "kualitas"]
  },
  {
    id: "quality_out_of_focus",
    category: "Kualitas Visual",
    title: "Subjek Buram / Salah Titik Fokus / Motion Blur",
    what: "Subjek utama gambar tidak tajam, fokus meleset, atau mengalami goyangan kamera (motion blur).",
    why: "Foto dan ilustrasi stok komersial wajib tajam pada titik fokus utama sehingga pembeli dapat melakukan cropping dengan fleksibel.",
    howToFix: "Selalu periksa aset pada zoom 100% sebelum dikirim. Pilih hanya karya yang subjek utamanya tajam sempurna. Untuk AI render, gunakan upscaler dengan penajaman detail.",
    priority: "HIGH",
    tags: ["blur", "fokus", "ketajaman", "goyang"]
  },
  {
    id: "quality_color_banding",
    category: "Kualitas Visual",
    title: "Garis Patah pada Gradasi (Color Banding / Posterisasi)",
    what: "Terlihat garis-garis kasar bertingkat pada area gradasi halus (langit cerah, background studio, glow cahaya) alih-alih transisi warna yang mulus.",
    why: "Banding terlihat tidak profesional pada cetakan dan iklan digital, menandakan kedalaman warna rendah atau over-processing.",
    howToFix: "Bekerjalah pada mode 16-bit saat mengedit. Berikan lapisan noise monokromatik tipis sekitar 0,5% atau dither pada area gradasi sebelum mengekspor ke JPEG 8-bit.",
    priority: "MEDIUM",
    tags: ["banding", "gradasi", "posterisasi", "transisi"]
  },
  {
    id: "ip_trademark_logo",
    category: "Hak Kekayaan Intelektual",
    title: "Terlihat Logo / Merek Dagang / Simbol Terdaftar",
    what: "Adanya logo perusahaan, merek dagang, lambang produk, atau motif berhak cipta (seperti logo Apple, centang Nike, lambang mobil, karakter komersial).",
    why: "Lisensi stok komersial menjamin pembeli bebas dari tuntutan hukum. Menggunakan merek dagang tanpa izin melanggar hak cipta pihak ketiga.",
    howToFix: "Hapus dan bersihkan (retouch / inpaint) semua logo, merek, label pakaian, nomor plat, dan emblem mobil sebelum diunggah untuk stok komersial.",
    priority: "CRITICAL",
    tags: ["merek", "logo", "hak cipta", "trademark", "brand"]
  },
  {
    id: "ip_copyrighted_character",
    category: "Hak Kekayaan Intelektual",
    title: "Karakter Berhak Cipta & Properti Fiksi",
    what: "Gambar menggambarkan atau sangat mirip dengan karakter fiksi berhak cipta (Disney, Marvel, Anime, Video Game, mainan paten).",
    why: "Hak cipta karakter dilindungi undang-undang secara ketat. Mengunggah fan-art atau gambar AI berbasis karakter berlisensi adalah pelanggaran hak cipta berat.",
    howToFix: "Pastikan seluruh desain karakter, kostum, jubah, dan maskot adalah 100% karya orisinal ciptaan Anda dan tidak meniru properti intelektual milik pihak lain.",
    priority: "CRITICAL",
    tags: ["karakter", "hak cipta", "fanart", "disney", "anime"]
  },
  {
    id: "genai_anatomy_glitches",
    category: "Masalah AI Generatif",
    title: "Cacat Anatomi AI (Jari, Tangan, Wajah Meleleh)",
    what: "Jari lebih dari 5, jari menyatu, sendi terpelintir, mata asimetris, atau fitur wajah aneh khas cacat model difusi AI.",
    why: "Adobe Stock menolak tegas aset AI Generatif yang memiliki cacat fisik, kesalahan proporsi tubuh, atau halusinasi geometris yang tidak wajar.",
    howToFix: "Gunakan inpainting di Photoshop atau editor gambar untuk memperbaiki tangan, mata, dan anggota tubuh sebelum diunggah. Jangan submit output mentah AI yang cacat.",
    priority: "CRITICAL",
    tags: ["ai", "anatomi", "tangan", "jari", "wajah", "glitch"]
  },
  {
    id: "genai_unlabelled",
    category: "Masalah AI Generatif",
    title: "Tidak Menandai Opsi Konten AI Generatif",
    what: "Mengajukan gambar buatan AI tanpa mencentang kotak pengakuan 'Created using generative AI tools' pada portal kontributor.",
    why: "Adobe Stock mewajibkan transparansi penuh. Tidak mendeklarasikan konten buatan AI melanggar ketentuan kontributor dan dapat menyebabkan akun dibekukan.",
    howToFix: "Selalu aktifkan centang 'Created using generative AI tools' di portal kontributor Adobe Stock pada saat pengajuan aset.",
    priority: "CRITICAL",
    tags: ["ai", "label", "transparansi", "kepatuhan"]
  },
  {
    id: "genai_celebrity_reference",
    category: "Masalah AI Generatif",
    title: "Menyebut Nama Tokoh / Seniman Nyata di Metadata",
    what: "Menyertakan nama selebriti, tokoh publik yang masih hidup, atau seniman terkenal pada prompt, judul, maupun tag kata kunci gambar AI.",
    why: "Kebijakan Adobe Stock melarang keras mencatut nama orang nyata atau seniman hidup pada metadata AI untuk melindungi hak publisitas dan reputasi.",
    howToFix: "Hapus semua nama seniman (misalnya 'style of Greg Rutkowski') dan nama tokoh publik dari catatan prompt, judul, serta daftar tag kata kunci Anda.",
    priority: "CRITICAL",
    tags: ["ai", "selebriti", "seniman", "prompt", "metadata"]
  },
  {
    id: "similar_spam_variation",
    category: "Konten Serupa / Duplikat",
    title: "Variasi Terlalu Mirip / Spam Katalog (Near Duplicates)",
    what: "Mengunggah banyak variasi yang sangat mirip dari satu prompt, sudut pandang, atau komposisi yang sama hanya dengan sedikit ubahan warna/zoom.",
    why: "Adobe Stock menindak tegas spam katalog. Membanjiri antrean moderasi dengan variasi identik tidak memberi nilai tambah bagi pembeli dan menurunkan kualitas pencarian.",
    howToFix: "Kurasi dengan cermat! Bandingkan batch Anda dan pilih HANYA 1 variasi terbaik dan terkuat dari satu tema. Hapus atau simpan variasi repetitif lainnya.",
    priority: "HIGH",
    tags: ["duplikat", "kemiripan", "spam", "batch", "variasi"]
  },
  {
    id: "legal_model_release",
    category: "Dokumen Rilis & Hukum",
    title: "Model Release Tidak Dilampirkan",
    what: "Gambar menampilkan wajah orang nyata yang dapat dikenali, siluet tubuh unik, atau tato tanpa dokumen Adobe Model Release yang ditandatangani.",
    why: "Lisensi komersial memerlukan persetujuan hukum tertulis dari setiap individu nyata yang tampil dalam karya visual.",
    howToFix: "Lampirkan dokumen Model Release resmi Adobe dengan tanda tangan subjek dan saksi yang sah. Jika orang tersebut 100% buatan AI fiktif, pastikan mencentang konfirmasi fiktif.",
    priority: "HIGH",
    tags: ["model release", "potret", "orang", "hukum"]
  },
  {
    id: "legal_property_release",
    category: "Dokumen Rilis & Hukum",
    title: "Property Release Tidak Dilampirkan",
    what: "Gambar menampilkan properti privat yang dapat dikenali, landmark arsitektur berhak cipta, tempat bertiket, atau desain kendaraan komersial.",
    why: "Undang-undang hak cipta arsitektur dan properti swasta melarang monetisasi komersial tanpa izin pemilik properti yang sah.",
    howToFix: "Lampirkan Property Release resmi yang ditandatangani oleh pemilik properti. Alternatifnya, ajukan melalui kategori Editorial Ilustratif jika memenuhi kriteria.",
    priority: "HIGH",
    tags: ["property release", "arsitektur", "gedung", "landmark"]
  },
  {
    id: "vector_open_paths",
    category: "Teknis File Vektor",
    title: "Path Terbuka & Titik Jangkar Liar (Open Paths / Stray Points)",
    what: "File vektor EPS/AI/SVG mengandung garis path yang tidak tertutup, anchor point liar yang terisolasi, atau objek tersembunyi di luar kanvas artboard.",
    why: "Pembeli memerlukan objek vektor yang rapi dan mudah diedit. Path terbuka menghasilkan cacat visual saat diisi warna atau di-expand pada software desain.",
    howToFix: "Di Adobe Illustrator, jalankan Object > Path > Clean Up... (hapus stray points & unpainted objects) dan gunakan Pathfinder untuk menutup seluruh garis path.",
    priority: "HIGH",
    tags: ["vektor", "path", "anchor point", "cleanup"]
  },
  {
    id: "vector_embedded_raster",
    category: "Teknis File Vektor",
    title: "Terdapat Gambar Bitmap Raster di Dalam File Vektor",
    what: "File vektor mengandung elemen gambar bitmap (PNG/JPEG) yang disematkan, bukan berupa bentuk path vektor murni yang dapat diskalakan.",
    why: "Pembeli membeli file vektor untuk fleksibilitas ukuran tak terbatas tanpa pecah. Gambar bitmap di dalam vektor akan pecah/buram saat diperbesar.",
    howToFix: "Lakukan Image Trace untuk mengubah bitmap menjadi path vektor asli, atau hapus elemen foto raster dan buat ulang menggunakan gradient/mesh vektor murni.",
    priority: "CRITICAL",
    tags: ["vektor", "raster", "bitmap", "skalabilitas"]
  },
  {
    id: "editorial_eligibility",
    category: "Kelayakan Akun Editorial",
    title: "Akun Belum Memenuhi Syarat Editorial Ilustratif",
    what: "Mengajukan konten editorial ilustratif padahal akun kontributor belum mencapai batas minimal 100+ unduhan/penjualan yang disetujui.",
    why: "Adobe Stock membatasi hak pengajuan editorial khusus untuk kontributor mapan yang telah memiliki rekam jejak kepatuhan dan penjualan positif.",
    howToFix: "Periksa statistik akun Anda. Setelah mencapai 100+ unduhan dengan reputasi baik, ajukan konten editorial konseptual dengan format judul tanggal/kota yang sesuai standar.",
    priority: "MEDIUM",
    tags: ["editorial", "kelayakan", "unduhan", "akun"]
  }
];
