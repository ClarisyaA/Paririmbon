# 🪷 Paririmbon

**Paririmbon: Sistem Knowledge Graph dan Pencarian Semantik Terminologi Sunda Kuno pada Naskah Klasik Berbasis RDF dan SPARQL**

Paririmbon adalah aplikasi website interaktif untuk menjelajahi, mencari, dan memahami terminologi Sunda Kuno yang berasal dari berbagai naskah klasik (manuskrip). Aplikasi ini memanfaatkan data semantik berbasis **RDF** (Resource Description Framework), di-query menggunakan **SPARQL** melalui **Apache Jena Fuseki** sebagai triple store, dan dibangun menggunakan **Next.js**, **React**, **Tailwind CSS**, serta **GSAP** untuk animasi.

---

## 📑 Daftar Isi

1. [Gambaran Umum Proyek](#-gambaran-umum-proyek)
2. [Arsitektur Sistem](#-arsitektur-sistem)
3. [Model Data / Ontologi](#-model-data--ontologi)
4. [Prasyarat yang Harus Diinstal](#-prasyarat-yang-harus-diinstal)
5. [Langkah 1 — Instal Node.js](#langkah-1--instal-nodejs)
6. [Langkah 2 — Instal Java JDK](#langkah-2--instal-java-jdk)
7. [Langkah 3 — Download & Jalankan Apache Jena Fuseki](#langkah-3--download--jalankan-apache-jena-fuseki)
8. [Langkah 4 — Upload Dataset RDF ke Fuseki](#langkah-4--upload-dataset-rdf-ke-fuseki)
9. [Langkah 5 — Verifikasi Dataset dengan SPARQL](#langkah-5--verifikasi-dataset-dengan-sparql)
10. [Langkah 6 — Setup Aplikasi Web (Next.js)](#langkah-6--setup-aplikasi-web-nextjs)
11. [Langkah 7 — Jalankan Aplikasi](#langkah-7--jalankan-aplikasi)
12. [Struktur Folder Proyek](#-struktur-folder-proyek)
13. [Penjelasan File Penting](#-penjelasan-file-penting)
14. [SPARQL Query yang Digunakan](#-sparql-query-yang-digunakan)
15. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
16. [Tentang Dataset Generator (Python)](#-tentang-dataset-generator-python)
17. [Troubleshooting / FAQ](#-troubleshooting--faq)

---

## 🌐 Gambaran Umum Proyek

### Apa itu Paririmbon?

Paririmbon adalah kamus digital terminologi Sunda Kuno yang diambil dari 11 naskah klasik (manuskrip) bersejarah. Setiap entri kosakata memiliki:

- **Istilah Latin** — transliterasi huruf Latin dari kata Sunda Kuno
- **Aksara Sunda Kuno** — penulisan dalam aksara asli (ᮃᮘ, ᮃᮘᮤ, dll)
- **Definisi** — arti kata dalam Bahasa Indonesia
- **Konteks Penggunaan** — penjelasan kapan/bagaimana kata tersebut digunakan
- **Kategori Kata** — klasifikasi hierarkis (Konsep, Atribut, Tindakan, Entitas)
- **Sumber Naskah** — naskah manuskrip tempat kata ditemukan
- **Relasi Antar Kata** — sinonim, antonim, turunan, relasi semantik

### Statistik Dataset

| Metrik | Jumlah |
|--------|--------|
| Total entri kosakata | **1.411** |
| Total naskah (manuskrip) sumber | **11** |
| Total triple RDF | **~18.630 baris** |
| Ukuran file dataset (.ttl) | **~990 KB** |

### Daftar 11 Naskah Sumber

| No | Nama Naskah | Periode Penulisan |
|----|-------------|-------------------|
| 1 | Sanghyang Hayu | Abad ke-15 |
| 2 | Carita Parahiyangan | Akhir abad ke-15 |
| 3 | Bujangga Manik | Akhir abad ke-15 |
| 4 | Siksa Kandang Karesiyan | Akhir abad ke-15 – awal abad ke-16 |
| 5 | Sewaka Darma | Abad ke-15 |
| 6 | Jatiniskala | Abad ke-16 |
| 7 | Pantun Ramayana | Abad ke-16 |
| 8 | Amanat Galunggung | Abad ke-16 |
| 9 | Sri Ajnyana | Abad ke-16 |
| 10 | Prasasti Tembaga Kabantenan di Bekasi | Abad ke-15 |
| 11 | Kamus Umum | Sunda Kuno |

---

## 🏗 Arsitektur Sistem

Berikut adalah alur data dari pengguna hingga database semantik:

```
┌──────────────┐     HTTP Request      ┌────────────────────┐
│              │ ───────────────────►   │                    │
│   Browser    │                       │   Next.js App      │
│  (Pengguna)  │ ◄───────────────────  │   (port 3000)      │
│              │     Rendered HTML      │                    │
└──────────────┘                       └─────────┬──────────┘
                                                 │
                                                 │ API Route
                                                 │ /api/search?q=...
                                                 │
                                                 ▼
                                       ┌────────────────────┐
                                       │                    │
                                       │ Apache Jena Fuseki │
                                       │   (port 3030)      │
                                       │                    │
                                       │  ┌──────────────┐  │
                                       │  │  Dataset:    │  │
                                       │  │  paririmbon  │  │
                                       │  │  (.ttl file) │  │
                                       │  └──────────────┘  │
                                       └────────────────────┘
```

**Alur kerja:**

1. **Pengguna** membuka website dan memasukkan kata kunci pencarian
2. **Frontend (Next.js)** mengirim HTTP request ke API Route internal `/api/search?q=kata_kunci`
3. **API Route** membangun SPARQL query dan mengirimkannya ke **Apache Jena Fuseki** (port 3030) via HTTP POST
4. **Fuseki** menjalankan query terhadap dataset RDF (file `.ttl` yang sudah di-upload)
5. **Fuseki** mengembalikan hasil dalam format JSON
6. **API Route** memformat hasil JSON dan mengirimkannya kembali ke frontend
7. **Frontend** menampilkan hasil dengan highlight kata yang cocok

---

## 📊 Model Data / Ontologi

### Prefix Namespace

```turtle
@prefix paririmbon: <https://paririmbon.org/> .
@prefix owl:        <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:       <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:        <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms:    <http://purl.org/dc/terms/> .
```

### Hierarki Kelas (Class Hierarchy)

```
owl:Thing
├── paririmbon:Word (Kata) ← kelas akar semua entri kosakata
│   ├── paririmbon:Concept (Konsep)
│   │   ├── Concept.ReligiousConcept      — Konsep Keagamaan
│   │   ├── Concept.PhilosophicalConcept  — Konsep Filosofis
│   │   ├── Concept.PoliticalConcept      — Konsep Politik
│   │   ├── Concept.SocialConcept         — Konsep Sosial
│   │   ├── Concept.CosmologicalConcept   — Konsep Kosmologis
│   │   └── Concept.LiteraryWork          — Karya Sastra
│   ├── paririmbon:Attribute (Atribut)
│   │   ├── Attribute.AestheticAttribute  — Atribut Estetika
│   │   ├── Attribute.EmotionalAttribute  — Atribut Emosional
│   │   ├── Attribute.MoralAttribute      — Atribut Moral
│   │   ├── Attribute.PhysicalAttribute   — Atribut Fisik
│   │   └── Attribute.SpiritualAttribute  — Atribut Spiritual
│   ├── paririmbon:Action (Tindakan)
│   │   ├── Action.RitualAction           — Tindakan Ritual
│   │   ├── Action.SocialAction           — Tindakan Sosial
│   │   ├── Action.CommunicationAction    — Tindakan Komunikasi
│   │   └── Action.MovementAction         — Tindakan Pergerakan
│   └── paririmbon:Entity (Entitas)
│       ├── Entity.Person                 — Orang
│       ├── Entity.Place                  — Tempat
│       ├── Entity.Artifact               — Artefak
│       ├── Entity.NaturalEntity          — Entitas Alam
│       ├── Entity.MythologicalEntity     — Entitas Mitologi
│       └── Entity.RoyalTitle             — Gelar Kerajaan
│
└── paririmbon:Manuscript (Naskah) ← kelas untuk naskah sumber
```

### Object Properties (Relasi Antar Entitas)

| Property | Label (ID) | Domain | Range | Keterangan |
|----------|------------|--------|-------|------------|
| `isRelatedTo` | berhubungan dengan | Word | Word | Hubungan semantik umum |
| `isSynonymOf` | sinonim dari | Word | Word | Dua kata bermakna setara (simetris) |
| `isOppositeOf` | lawan kata dari | Word | Word | Dua kata bermakna berlawanan/antonim (simetris) |
| `isDerivedFrom` | diturunkan dari | Word | Word | Derivasi morfologis/etimologis |
| `isPartOf` | bagian dari | Word | Word | Relasi meronim |
| `hasPart` | memiliki bagian | Word | Word | Inverse dari isPartOf |
| `foundInManuscript` | ditemukan dalam | Word | Manuscript | Menghubungkan kata ke naskah sumber |

### Data Properties (Properti Bernilai Literal)

| Property | Deskripsi | Contoh |
|----------|-----------|--------|
| `entryID` | ID unik entri kosakata | `"W0001"` |
| `latinTerm` | Transliterasi huruf Latin | `"aba"` |
| `scriptTerm` | Penulisan dalam aksara Sunda Kuno | `"ᮃᮘ"` |
| `definition` | Definisi/arti dalam Bahasa Indonesia | `"keindahan, gaya, suara"` |
| `usageContext` | Konteks penggunaan kata | `"Menyebut keindahan bunyi..."` |
| `wordClass` | Kategori/kelas kata | `"Concept.ReligiousConcept"` |
| `manuscriptTitle` | Judul naskah sumber | `"Sanghyang Hayu"` |
| `creationPeriod` | Periode penulisan naskah | `"Abad ke-15"` |

### Contoh Data (1 Entri Lengkap)

```turtle
paririmbon:W0001 a paririmbon:Concept.ReligiousConcept ;
    rdfs:label "aba"@su ;
    paririmbon:entryID "W0001"^^xsd:string ;
    paririmbon:latinTerm "aba"^^xsd:string ;
    paririmbon:scriptTerm "ᮃᮘ"^^xsd:string ;
    paririmbon:definition "keindahan, gaya, suara, kata, perintah"^^xsd:string ;
    paririmbon:usageContext "Menyebut keindahan bunyi, gaya bahasa, atau keelapan kata dalam mantra dan pupuh."^^xsd:string ;
    paririmbon:wordClass "Concept.ReligiousConcept"^^xsd:string ;
    paririmbon:manuscriptTitle "Sanghyang Hayu"^^xsd:string ;
    paririmbon:creationPeriod "Abad ke-15"^^xsd:string ;
    paririmbon:foundInManuscript paririmbon:Manuscript_Sanghyang_Hayu ;
    paririmbon:isRelatedTo paririmbon:W1120 .
```

---

## 📋 Prasyarat yang Harus Diinstal

Sebelum memulai, pastikan komputer kamu sudah memiliki software berikut:

| No | Software | Versi Minimum | Kegunaan |
|----|----------|---------------|----------|
| 1 | **Node.js** | 18.x atau lebih baru | Menjalankan Next.js |
| 2 | **npm** | 9.x (biasanya sudah terinstal bersama Node.js) | Package manager |
| 3 | **Java JDK** | 11 atau lebih baru | Menjalankan Apache Jena Fuseki |
| 4 | **Browser modern** | Chrome / Firefox / Edge terbaru | Membuka website |

> **Catatan:** Python **tidak diperlukan** untuk menjalankan aplikasi. Python hanya digunakan jika kamu ingin me-regenerate dataset dari file Excel (lihat bagian [Tentang Dataset Generator](#-tentang-dataset-generator-python)).

---

## Langkah 1 — Instal Node.js

### Windows

1. Buka **https://nodejs.org/**
2. Download versi **LTS** (Long Term Support) — contoh: `v20.x.x LTS`
3. Jalankan installer `.msi` yang sudah di-download
4. Pada halaman installer:
   - ✅ Centang **"Add to PATH"** (biasanya sudah dicentang secara default)
   - Klik **Next** terus sampai selesai
5. Buka **Command Prompt** atau **PowerShell**, lalu verifikasi instalasi:

```bash
node --version
# Harus muncul sesuatu seperti: v20.11.0

npm --version
# Harus muncul sesuatu seperti: 10.2.4
```

> **Jika sudah muncul versi**, artinya Node.js berhasil terinstal. Lanjut ke Langkah 2.

---

## Langkah 2 — Instal Java JDK

Apache Jena Fuseki membutuhkan Java untuk berjalan.

### Windows

1. Buka **https://adoptium.net/** (Eclipse Temurin / OpenJDK)
2. Download **JDK 17** atau **JDK 21** (pilih `.msi` installer untuk Windows x64)
3. Jalankan installer dan ikuti langkah-langkahnya
4. Verifikasi instalasi di **Command Prompt** atau **PowerShell**:

```bash
java -version
# Harus muncul sesuatu seperti:
# openjdk version "17.0.10" 2024-01-16
```

> **Jika muncul error `'java' is not recognized`**, artinya Java belum terinstal atau belum masuk PATH. Ulangi instalasi dan pastikan centang "Add to PATH".

---

## Langkah 3 — Download & Jalankan Apache Jena Fuseki

Apache Jena Fuseki adalah **triple store** yang menyimpan data RDF dan menyediakan endpoint SPARQL untuk query.

### 3.1 Download Fuseki

1. Buka halaman download resmi:
   **https://jena.apache.org/download/**

2. Scroll ke bagian **"Apache Jena Fuseki"**

3. Download file **`apache-jena-fuseki-X.X.X.zip`** (pilih versi terbaru, misal `5.x.x`)
   - Klik link `.zip` (untuk Windows)

4. Setelah download selesai, **extract / unzip** file tersebut ke lokasi yang mudah diakses, contoh:
   ```
   C:\Tools\apache-jena-fuseki-5.2.0\
   ```

### 3.2 Jalankan Fuseki Server

1. Buka **Command Prompt** atau **PowerShell**

2. Pindah ke folder Fuseki yang sudah di-extract:
   ```bash
   cd C:\Tools\apache-jena-fuseki-5.2.0
   ```

3. Jalankan Fuseki:

   **Windows (Command Prompt):**
   ```bash
   fuseki-server.bat
   ```

   **Windows (PowerShell):**
   ```powershell
   .\fuseki-server.bat
   ```

4. Tunggu sampai muncul pesan seperti:
   ```
   [2026:05:20 23:00:00] INFO  Fuseki :: Start Fuseki (port=3030)
   ```

5. **Biarkan terminal ini tetap terbuka** (jangan ditutup). Fuseki harus terus berjalan selama kamu menggunakan aplikasi.

### 3.3 Buka Dashboard Fuseki

1. Buka browser
2. Akses: **http://localhost:3030**
3. Kamu akan melihat halaman dashboard Fuseki:

```
┌─────────────────────────────────────┐
│   Apache Jena Fuseki                │
│                                     │
│   Server Status: Running            │
│   Datasets: (belum ada)             │
│                                     │
│   [manage datasets]  [info]  [query]│
└─────────────────────────────────────┘
```

> ✅ Jika halaman ini muncul, Fuseki sudah berhasil berjalan!

---

## Langkah 4 — Upload Dataset RDF ke Fuseki

### 4.1 Buat Dataset Baru

1. Di dashboard Fuseki (**http://localhost:3030**), klik tab **"manage datasets"** atau **"Manage"**

2. Klik tombol **"add new dataset"**

3. Isi form:
   - **Dataset name:** `paririmbon`
   - **Dataset type:** Pilih **Persistent (TDB2)** — agar data tersimpan permanen meskipun Fuseki di-restart
     > Jika tidak ada pilihan TDB2, pilih **In-memory** (data akan hilang jika Fuseki dimatikan)

4. Klik **"Create dataset"**

### 4.2 Upload File TTL

1. Setelah dataset `paririmbon` dibuat, klik nama dataset **"paririmbon"** di daftar

2. Klik tab **"upload data"** atau **"Upload"**

3. Klik **"Select files..."** atau drag-and-drop file berikut:
   ```
   paririmbon_dataset.ttl
   ```
   > File ini ada di folder `Archive/Paririmbon/paririmbon_dataset.ttl` (ukuran ~990 KB)

4. Klik tombol **"Upload"** atau **"Upload all"**

5. Tunggu proses upload selesai. Kamu akan melihat pesan sukses:
   ```
   Uploaded: paririmbon_dataset.ttl (18630 triples)
   ```

### 4.3 Verifikasi Dataset Berhasil Di-Upload

1. Klik tab **"info"** pada dataset `paririmbon`
2. Periksa bahwa jumlah triple menunjukkan angka yang tidak nol (seharusnya sekitar **18.000+** triple)
3. Pastikan endpoint SPARQL bisa diakses di:
   ```
   http://localhost:3030/paririmbon/sparql
   ```

---

## Langkah 5 — Verifikasi Dataset dengan SPARQL

Sebelum menjalankan aplikasi, pastikan dataset sudah benar dengan menjalankan beberapa query SPARQL di dashboard Fuseki.

### 5.1 Buka Query Editor

1. Di dashboard Fuseki, klik tab **"query"**
2. Pastikan dataset yang dipilih adalah **paririmbon**

### 5.2 Query 1: Hitung Total Entri Kosakata

Paste query ini dan klik **"Run Query"** (atau tombol ▶):

```sparql
PREFIX paririmbon: <https://paririmbon.org/>

SELECT (COUNT(?word) AS ?total) WHERE {
  ?word paririmbon:entryID ?id .
}
```

**Hasil yang diharapkan:**
| total |
|-------|
| 1411 |

### 5.3 Query 2: Lihat 10 Entri Pertama

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?entryID ?latinTerm ?scriptTerm ?definition ?wordClass WHERE {
  ?word paririmbon:entryID ?entryID ;
        paririmbon:latinTerm ?latinTerm ;
        paririmbon:scriptTerm ?scriptTerm ;
        paririmbon:definition ?definition ;
        paririmbon:wordClass ?wordClass .
}
ORDER BY ?entryID
LIMIT 10
```

### 5.4 Query 3: Lihat Semua Naskah (Manuscript)

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?manuscript ?title ?period (COUNT(?word) AS ?jumlahKata) WHERE {
  ?manuscript a paririmbon:Manuscript ;
              rdfs:label ?title .
  OPTIONAL { ?manuscript paririmbon:creationPeriod ?period }
  ?word paririmbon:foundInManuscript ?manuscript .
}
GROUP BY ?manuscript ?title ?period
ORDER BY ?title
```

### 5.5 Query 4: Cari Kata Berdasarkan Keyword

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?entryID ?latinTerm ?definition ?scriptTerm ?wordClass ?manuscriptTitle WHERE {
  ?word paririmbon:entryID ?entryID ;
        paririmbon:latinTerm ?latinTerm ;
        paririmbon:definition ?definition ;
        paririmbon:scriptTerm ?scriptTerm ;
        paririmbon:wordClass ?wordClass ;
        paririmbon:manuscriptTitle ?manuscriptTitle .
  FILTER (
    CONTAINS(LCASE(STR(?latinTerm)), LCASE("raja")) ||
    CONTAINS(LCASE(STR(?definition)), LCASE("raja"))
  )
}
ORDER BY ?latinTerm
LIMIT 50
```

> Ganti `"raja"` dengan kata lain yang ingin kamu cari.

### 5.6 Query 5: Lihat Relasi Antar Kata (Knowledge Graph)

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?source ?sourceLabel ?relationType ?target ?targetLabel WHERE {
  ?source rdfs:label ?sourceLabel .
  {
    ?source paririmbon:isSynonymOf ?target .
    BIND("sinonim" AS ?relationType)
  } UNION {
    ?source paririmbon:isOppositeOf ?target .
    BIND("antonim" AS ?relationType)
  } UNION {
    ?source paririmbon:isDerivedFrom ?target .
    BIND("turunan" AS ?relationType)
  } UNION {
    ?source paririmbon:isPartOf ?target .
    BIND("bagian dari" AS ?relationType)
  }
  ?target rdfs:label ?targetLabel .
}
LIMIT 50
```

> ✅ Jika semua query di atas mengembalikan hasil, artinya dataset sudah benar dan siap digunakan oleh aplikasi web!

---

## Langkah 6 — Setup Aplikasi Web (Next.js)

### 6.1 Buka Terminal Baru

Buka **Command Prompt** atau **PowerShell** baru (jangan menutup terminal Fuseki yang sebelumnya).

### 6.2 Pindah ke Folder Proyek

```bash
cd d:\Kuliah\semester6\semweb\TugasAkhir\Archive\Paririmbon
```

### 6.3 Inisialisasi Proyek Next.js

Karena proyek Next.js belum disetup, kamu perlu membuatnya terlebih dahulu. Jalankan perintah berikut satu per satu:

```bash
# 1. Buat proyek Next.js baru di folder ini
npx -y create-next-app@latest ./app --yes --js --no-tailwind --eslint --app --src-dir --no-turbopack --import-alias "@/*"
```

> **Catatan:** Perintah di atas akan membuat folder `app/` berisi proyek Next.js. Jika kamu mau menaruhnya di folder lain, ganti `./app` menjadi path yang diinginkan.

Atau, jika kamu sudah punya template proyek Next.js yang siap dipakai (seperti referensi dari proyek Hanacaraka), kamu bisa meng-copy strukturnya langsung.

### 6.4 Install Dependencies

```bash
cd app
npm install
npm install gsap
```

### 6.5 Konfigurasi Endpoint Fuseki

Pastikan API route di aplikasi mengarah ke endpoint Fuseki yang benar:

```
http://localhost:3030/paririmbon/sparql
```

> Nama dataset di URL (`paririmbon`) harus **persis sama** dengan nama dataset yang kamu buat di Langkah 4.1.

---

## Langkah 7 — Jalankan Aplikasi

### 7.1 Pastikan Fuseki Masih Berjalan

Cek terminal Fuseki — pastikan masih aktif dan tidak ada error. Jika sudah ditutup, jalankan ulang:

```bash
cd C:\Tools\apache-jena-fuseki-5.2.0
fuseki-server.bat
```

### 7.2 Jalankan Aplikasi Next.js

Di terminal yang berbeda (bukan terminal Fuseki):

```bash
cd d:\Kuliah\semester6\semweb\TugasAkhir\Archive\Paririmbon\app
npm run dev
```

Tunggu sampai muncul:
```
▲ Next.js 15.x.x
- Local:   http://localhost:3000
✓ Ready in 2.1s
```

### 7.3 Buka Aplikasi di Browser

1. Buka browser
2. Akses: **http://localhost:3000**
3. Coba ketikkan kata kunci di halaman pencarian, misalnya:
   - `raja`
   - `agung`
   - `dewa`
   - `api`

### 7.4 Checklist Sebelum Presentasi

- [ ] Java sudah terinstal (`java -version`)
- [ ] Node.js sudah terinstal (`node --version`)
- [ ] Apache Jena Fuseki berjalan di **http://localhost:3030**
- [ ] Dataset `paririmbon` sudah di-upload (cek di dashboard Fuseki)
- [ ] Query SPARQL bisa dijalankan di tab Query Fuseki
- [ ] Aplikasi Next.js berjalan di **http://localhost:3000**
- [ ] Pencarian mengembalikan hasil yang benar

---

## 📂 Struktur Folder Proyek

```
Archive/Paririmbon/
├── README.md                           # 📄 File ini
├── paririmbon_dataset.ttl              # 📊 Dataset RDF (Turtle format) — 990 KB
├── generate_dataset_new.py             # 🐍 Script Python untuk generate TTL dari Excel
├── Dokumentasi_Ontologi_Paririmbon.docx# 📝 Dokumentasi ontologi (Word)
│
└── app/                                # 🌐 Aplikasi Next.js (dibuat di Langkah 6)
    ├── src/
    │   └── app/
    │       ├── page.js                 # Halaman utama (Home)
    │       ├── layout.js               # Layout utama + font
    │       ├── globals.css             # Styling global
    │       ├── search/
    │       │   └── page.js             # Halaman pencarian
    │       ├── about/
    │       │   └── page.js             # Halaman tentang
    │       └── api/
    │           └── search/
    │               └── route.js        # API endpoint SPARQL search
    ├── components/                     # Komponen React reusable
    ├── public/                         # Asset statis (gambar, ikon)
    ├── package.json                    # Dependency list
    └── ...
```

---

## 📄 Penjelasan File Penting

### `paririmbon_dataset.ttl`

File dataset utama dalam format **Turtle** (`.ttl`). Berisi:
- **T-Box (Terminological Box):** Definisi kelas, properti, dan hierarki ontologi
- **A-Box (Assertional Box):** Instance/individu data (1.411 entri kosakata + 11 naskah)

File ini yang di-upload ke Apache Jena Fuseki.

### `generate_dataset_new.py`

Script Python untuk me-generate file `paririmbon_dataset.ttl` dari file Excel sumber. Script ini:
1. Membaca file Excel (`paririmbon_dataset.xlsx`) yang berisi 2 sheet:
   - **KOSAKATA** — data entri kosakata dengan kolom: entryID, latinTerm, scriptTerm, definition, usageContext, wordClass, manuscriptTitle, creationPeriod, relationType, targetWordID
   - **SPO** — data relasi tambahan dengan kolom: Subject_ID, Predicate, Object_ID
2. Membangun graph RDF menggunakan library `rdflib`
3. Menyimpan hasilnya ke file `.ttl`

> **Kamu TIDAK perlu menjalankan script ini** kecuali ingin me-regenerate dataset dari Excel.

### `Dokumentasi_Ontologi_Paririmbon.docx`

Dokumen Word berisi penjelasan detail tentang desain ontologi, termasuk:
- Tujuan dan ruang lingkup ontologi
- Penjelasan setiap kelas dan properti
- Diagram hubungan antar kelas
- Contoh instance data

### `app/api/search/route.js`

API endpoint yang menjadi jembatan antara frontend dan Fuseki. File ini:
1. Menerima parameter query `?q=keyword`
2. Membangun SPARQL query dengan `FILTER CONTAINS()`
3. Mengirim query ke `http://localhost:3030/paririmbon/sparql` via HTTP POST
4. Mengembalikan hasil dalam format JSON

---

## 🔍 SPARQL Query yang Digunakan

### Query Pencarian Utama (digunakan oleh `/api/search`)

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?entryID ?latinTerm ?scriptTerm ?definition ?usageContext 
       ?wordClass ?manuscriptTitle ?creationPeriod WHERE {
  ?word paririmbon:entryID ?entryID ;
        paririmbon:latinTerm ?latinTerm ;
        paririmbon:definition ?definition .
  OPTIONAL { ?word paririmbon:scriptTerm ?scriptTerm }
  OPTIONAL { ?word paririmbon:usageContext ?usageContext }
  OPTIONAL { ?word paririmbon:wordClass ?wordClass }
  OPTIONAL { ?word paririmbon:manuscriptTitle ?manuscriptTitle }
  OPTIONAL { ?word paririmbon:creationPeriod ?creationPeriod }
  FILTER (
    CONTAINS(LCASE(STR(?latinTerm)), LCASE("KEYWORD")) ||
    CONTAINS(LCASE(STR(?definition)), LCASE("KEYWORD")) ||
    CONTAINS(LCASE(STR(?usageContext)), LCASE("KEYWORD"))
  )
}
ORDER BY ?latinTerm
LIMIT 50
```

### Query Detail Kata (untuk halaman detail `/api/term/[id]`)

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?property ?value WHERE {
  paririmbon:W0001 ?property ?value .
}
```

Atau menggunakan DESCRIBE:
```sparql
DESCRIBE paririmbon:W0001
```

### Query Daftar Naskah (untuk halaman `/api/naskah`)

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?ms ?title ?period (COUNT(?word) AS ?jumlahKata) WHERE {
  ?ms a paririmbon:Manuscript ;
      rdfs:label ?title .
  OPTIONAL { ?ms paririmbon:creationPeriod ?period }
  ?word paririmbon:foundInManuscript ?ms .
}
GROUP BY ?ms ?title ?period
ORDER BY ?title
```

### Query Knowledge Graph (untuk visualisasi relasi antar kata)

```sparql
PREFIX paririmbon: <https://paririmbon.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

CONSTRUCT {
  ?source ?relation ?target .
  ?source rdfs:label ?sourceLabel .
  ?target rdfs:label ?targetLabel .
}
WHERE {
  ?source rdfs:label ?sourceLabel .
  ?target rdfs:label ?targetLabel .
  ?source ?relation ?target .
  VALUES ?relation {
    paririmbon:isRelatedTo
    paririmbon:isSynonymOf
    paririmbon:isOppositeOf
    paririmbon:isDerivedFrom
    paririmbon:isPartOf
  }
}
LIMIT 200
```

---

## 🧱 Teknologi yang Digunakan

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 15.x | Framework React (App Router) untuk frontend + API routes |
| **React** | 19.x | Library UI untuk membangun komponen interaktif |
| **Tailwind CSS** | 4.x | Utility-first CSS framework untuk styling |
| **GSAP** | 3.13+ | Library animasi untuk transisi halus dan efek visual |
| **Apache Jena Fuseki** | 5.x | Triple store dan SPARQL endpoint server |
| **RDF / Turtle (.ttl)** | - | Format data semantik untuk knowledge graph |
| **SPARQL** | 1.1 | Bahasa query untuk data RDF |
| **OWL** | 2 | Ontology Web Language untuk definisi kelas dan properti |
| **Python** + rdflib + pandas | 3.x | (Opsional) Untuk generate dataset dari Excel |

---

## 🐍 Tentang Dataset Generator (Python)

> **Bagian ini OPSIONAL** — hanya perlu dijalankan jika kamu ingin me-regenerate file `paririmbon_dataset.ttl` dari file Excel sumber.

### Prasyarat Python

1. Instal Python 3.8+ dari **https://python.org**
2. Instal library yang diperlukan:
   ```bash
   pip install rdflib pandas openpyxl
   ```

### Cara Menjalankan

1. Siapkan file Excel `paririmbon_dataset.xlsx` dengan 2 sheet:

   **Sheet "KOSAKATA"** — kolom:
   | entryID | latinTerm | scriptTerm | definition | usageContext | wordClass | manuscriptTitle | creationPeriod | relationType | targetWordID |
   |---------|-----------|------------|------------|--------------|-----------|-----------------|----------------|--------------|--------------|

   **Sheet "SPO"** — kolom:
   | Subject_ID | Predicate | Object_ID |
   |------------|-----------|-----------|

2. Edit file `generate_dataset_new.py`, sesuaikan path:
   ```python
   EXCEL_PATH = r"C:\path\ke\paririmbon_dataset.xlsx"
   OUTPUT_TTL = r"C:\path\ke\paririmbon_dataset.ttl"
   ```

3. Jalankan:
   ```bash
   python generate_dataset_new.py
   ```

4. Output:
   ```
   ============================================================
     BERHASIL: file TTL siap di-upload ke Apache Jena Fuseki
   ============================================================
     Total triple        : 18630
     Entri kosakata      : 1411  (dilewati: 0)
     Relasi inline       : XXX   (kolom KOSAKATA)
     Relasi SPO          : XXX   (sheet SPO)
     Individu Manuscript : 11
   ============================================================
   ```

---

## ❓ Troubleshooting / FAQ

### 1. Fuseki tidak bisa dijalankan / muncul error Java

**Masalah:** `'java' is not recognized as an internal or external command`

**Solusi:**
- Pastikan Java JDK sudah terinstal: `java -version`
- Jika belum, instal dari https://adoptium.net/
- Pastikan `JAVA_HOME` environment variable sudah di-set:
  ```bash
  # Windows (PowerShell)
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.10+7"
  ```
- Restart terminal setelah instalasi

### 2. Fuseki berjalan tapi dataset kosong

**Masalah:** Query SPARQL tidak mengembalikan hasil apapun

**Solusi:**
- Pastikan file `paririmbon_dataset.ttl` sudah di-upload ke dataset bernama `paririmbon`
- Cek di tab **info** bahwa jumlah triple > 0
- Pastikan nama dataset di URL endpoint cocok: `http://localhost:3030/paririmbon/sparql`

### 3. Error saat upload file TTL

**Masalah:** Fuseki menolak file TTL / muncul parse error

**Solusi:**
- Pastikan file `paririmbon_dataset.ttl` tidak rusak atau terpotong
- Coba upload ulang
- Ukuran file seharusnya ~990 KB

### 4. Aplikasi web tidak bisa konek ke Fuseki

**Masalah:** Pencarian mengembalikan error "Failed to fetch data"

**Solusi:**
- Pastikan Fuseki masih berjalan di terminal terpisah
- Pastikan port **3030** tidak dipakai aplikasi lain
- Cek apakah endpoint bisa diakses: buka `http://localhost:3030` di browser
- Pastikan nama dataset di kode API route cocok: `paririmbon`

### 5. `npm install` gagal

**Masalah:** Error saat instal dependency Node.js

**Solusi:**
- Pastikan Node.js versi 18+ sudah terinstal
- Hapus folder `node_modules` dan file `package-lock.json`, lalu jalankan ulang:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### 6. Port 3000 sudah dipakai

**Masalah:** `Port 3000 is already in use`

**Solusi:**
- Jalankan di port lain:
  ```bash
  npm run dev -- -p 3001
  ```
- Atau matikan proses yang menggunakan port 3000

### 7. Aksara Sunda Kuno tidak tampil / muncul kotak-kotak

**Masalah:** Browser menampilkan □□□ alih-alih aksara Sunda

**Solusi:**
- Instal font yang mendukung aksara Sunda, seperti **Noto Sans Sundanese**
- Download dari: https://fonts.google.com/noto/specimen/Noto+Sans+Sundanese
- Instal font di sistem operasi, atau embed via CSS:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sundanese&display=swap');
  ```

---

## 🤝 Kontribusi

Pull Request terbuka untuk:
- Penambahan entri kosakata baru
- Penambahan relasi antar kata
- Perbaikan UI/UX
- Penyempurnaan sistem pencarian
- Visualisasi Knowledge Graph
- Penambahan naskah sumber baru
