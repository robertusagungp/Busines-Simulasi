# Simulator Bisnis Asuransi (Insurance Agency Business Compensation Simulator)

Aplikasi web modern berbasis Next.js dan TypeScript untuk mensimulasikan model kompensasi keagenan asuransi jiwa. Aplikasi ini dirancang khusus untuk kemudahan agen dan pemimpin bisnis (user non-teknis) dengan antarmuka yang bersih, responsif, dan berbasis buku besar transaksi (*event-based ledger*).

---

## 1. Ikhtisar & Nilai Utama

Inti dari kalkulator ini adalah **menghormati status setiap agen pada detik transaksi ALP (*Annualized Life Premium*) diproduksi**:

> **Kaidah Emas:**
> Rate komisi dan overriding ditentukan oleh status produser dan upline **pada saat ALP dihasilkan**, bukan oleh status mereka saat ini.
> **Promosi jabatan TIDAK PERNAH berlaku surut (non-retroactive).**

Dengan arsitektur *event-based*, transaksi historis (misal Rp100 juta saat kualifikasi awal) tidak akan pernah dihitung ulang secara retroaktif menjadi overriding ketika seorang agen naik pangkat dari BE ke BP.

---

## 2. Ringkasan Aturan Bisnis (Core Business Rules)

### A. Status Agen

1. **BE (Business Executive)**
   - Status awal setiap agen baru.
   - Hanya menerima komisi dari produksi personalnya sendiri:
     $$\text{Komisi Personal Bulanan} = \frac{\text{Personal ALP} \times 23{,}25\%}{12}$$
   - Komisi personal diilustrasikan dibayarkan selama **24 bulan**.
   - **BE tidak berhak menerima overriding** dari produksi downline manapun ($0\%$).

2. **BP (Business Partner)**
   - Jenjang kemitraan setelah memenuhi kualifikasi **Rp300.000.000 ALP**.
   - Berhak menerima Direct BP Overriding dan BP-on-BP Overriding.

---

### B. 4 Skema Kualifikasi BP (Target: Rp300 Juta ALP)

| Skema | Nama Skema | Komposisi | Syarat Khusus |
| :--- | :--- | :--- | :--- |
| **Skema 1** | Full Personal | Agen Utama: Rp300jt | 100% produksi mandiri |
| **Skema 2** | 200 + 50 + 50 | Agen Utama: Rp200jt<br>Kontributor A: Rp50jt<br>Kontributor B: Rp50jt | Minimal Rp50jt per kontributor |
| **Skema 3** | 100 + 100 + 100 | Agen Utama: Rp100jt<br>Kontributor A: Rp100jt<br>Kontributor B: Rp100jt | Masing-masing Rp100jt |
| **Skema 4** | Keroyokan / Fleksibel | Agen Utama + multi-kontributor bebas | Tanpa batas minimum per orang, total $\ge$ Rp300jt |

> **Penting Mengenai Kualifikasi vs Komisi:**
> Volume kualifikasi kontributor **tidak menjadi komisi personal upline**. Agen utama hanya menerima komisi personal dari volume yang diproduksinya sendiri.

---

### C. Matriks Keputusan Overriding

| Status Upline saat ALP | Status Produser saat ALP | Hak Overriding Upline | Rate Bulanan |
| :--- | :--- | :--- | :---: |
| **BE** | **BE** | No Overriding | $0\%$ |
| **BE** | **BP** | No Overriding | $0\%$ |
| **BP** | **BE** | **Direct BP Overriding** | $\frac{12{,}7875\%}{12}$ ($23{,}25\% \times 55\%$) |
| **BP** | **BP** | **BP-on-BP Overriding** | $\frac{4{,}65\%}{12}$ ($23{,}25\% \times 20\%$) |

---

## 3. Skenario Uji Wajib (Mandatory Acceptance Test)

Aplikasi telah lulus pengujian otomatis (*automated unit tests*) untuk skenario berikut secara presisi:

1. **Kualifikasi Awal (Skema 3):**
   - Agen Utama = Rp100jt, Kontributor A = Rp100jt, Kontributor B = Rp100jt.
   - Komisi Personal Utama: $\frac{\text{Rp100jt} \times 23{,}25\%}{12} = \mathbf{Rp1.937.500/\text{bulan}}$.
   - Overriding dari A & B: $\mathbf{Rp0}$ (Agen Utama masih BE saat itu).
   - Total Utama: $\mathbf{Rp1.937.500/\text{bulan}}$.
   - Agen Utama promosi ke BP.

2. **Mitra A Bertumbuh dari Rp100jt $\to$ Rp300jt (+Rp200jt):**
   - Agen Utama sudah BP. Mitra A masih BE selama penambahan Rp200jt ini.
   - Eligible Direct OR: $\text{Rp200jt} \times 12{,}7875\% \div 12 = \mathbf{Rp2.131.250/\text{bulan}}$.
   - Total Penghasilan Utama: $\text{Rp1.937.500} + \text{Rp2.131.250} = \mathbf{Rp4.068.750/\text{bulan}}$.
   - Pada titik Rp300jt, Mitra A resmi promosi ke BP. Tidak ada BP-on-BP dari Rp300jt historis ini.

3. **Mitra A Bertumbuh dari Rp300jt $\to$ Rp400jt (+Rp100jt):**
   - Mitra A sudah resmi BP. Agen Utama sudah BP.
   - Eligible Post-BP OR: $\text{Rp100jt} \times 4{,}65\% \div 12 = \mathbf{Rp387.500/\text{bulan}}$.
   - Total Penghasilan Utama: $\text{Rp1.937.500} + \text{Rp2.131.250} + \text{Rp387.500} = \mathbf{Rp4.456.250/\text{bulan}}$.

---

## 4. Arsitektur Teknis

```text
├── app/
│   ├── layout.tsx                # Root layout & meta Bahasa Indonesia
│   ├── page.tsx                  # Home simulator controller
│   └── globals.css               # Tailwind CSS directives
├── components/
│   ├── SimulatorContext.tsx      # State management & action dispatcher
│   ├── layout/AppLayout.tsx      # Sidebar, navbar, mobile bottom bar
│   ├── dashboard/DashboardView.tsx # Metrik ringkasan, breakdown komposisi
│   ├── simulator/SimulatorWizard.tsx # Wizard 3 langkah BE -> BP
│   ├── simulator/AddDownlineModal.tsx # Modal tambah transaksi + live preview
│   ├── organization/OrganizationView.tsx # Visualisasi pohon tim & drawer audit
│   ├── timeline/TimelineView.tsx # Buku besar historis kronologis
│   ├── scenarios/ScenarioManagerView.tsx # Manajemen skenario & grafik komparasi
│   ├── rules/RulesInspectorView.tsx # Glosarium, decision table, konfigurasi rules
│   └── income/IncomeBreakdownModal.tsx # Audit transparansi rumus
├── lib/
│   ├── business/                 # Domain logic murni terisolasi dari UI
│   │   ├── rules.ts              # Konfigurasi parameter terpusat
│   │   ├── types.ts              # Data model & tipe TypeScript
│   │   ├── calculatePersonalCommission.ts
│   │   ├── calculateDirectOverride.ts
│   │   ├── calculateBpOnBp.ts
│   │   ├── classifyAlpEvent.ts   # Mesin pemecah tranche transaksi
│   │   ├── calculateQualification.ts
│   │   ├── calculateOrganization.ts
│   │   └── calculateScenarioIncome.ts
│   ├── storage/
│   │   ├── scenarioStore.ts      # Sinkronisasi ke browser localStorage
│   │   └── defaultScenarios.ts   # Skenario bawaan siap pakai
│   └── utils/
│       └── currency.ts           # Parser & pemformat Rupiah (e.g. "100jt" -> 100000000)
└── __tests__/
    └── business.test.ts          # 11 unit test Vitest mencakup semua kaidah wajib
```

---

## 5. Menjalankan Aplikasi Secara Lokal

### Prasyarat:
- Node.js versi 18 ke atas
- npm atau pnpm

### Langkah Instalasi:
```bash
# Clone repository
git clone https://github.com/robertusagungp/Busines-Simulasi.git
cd Busines-Simulasi

# Install dependencies
npm install

# Jalankan pengujian unit (Vitest)
npm test

# Jalankan server pengembangan lokal
npm run dev
```

Buka peramban di `http://localhost:3000`.

### Build Produksi:
```bash
npm run build
npm run start
```

---

## 6. Batasan Aturan Bisnis & Rekomendasi Selanjutnya

### Batasan Saat Ini:
- Model perhitungan mengikuti aturan baku yang telah terkonfirmasi.
- Faktor polis riil seperti **persistency rate**, **lapse**, **clawback komisi akibat pembatalan dini**, serta **kedalaman generasi BP-on-BP (> 1 generasi)** saat ini berada di luar lingkup aturan terkonfirmasi dan tidak diasumsikan secara sembarangan.
- Penyimpanan data saat ini menggunakan `localStorage` peramban (tanpa memerlukan login atau database eksternal).

### Rekomendasi Peningkatan Selanjutnya:
1. **Cloud Persistence & Autentikasi:** Integrasi Supabase / PostgreSQL untuk penyimpanan cloud antar perangkat dan akun agen.
2. **Export PDF / Excel:** Cetak proposal ilustrasi bisnis resmi dalam format PDF dengan kop agensi.
3. **Multi-Generation Overriding:** Menambahkan pengaturan generasi kedalaman BP-on-BP (Generasi 1, Generasi 2, dst) jika aturan resmi sudah diterbitkan.
