# Pelan Peningkatan: Misi Taman Lestari – Pengembaraan Wira Alam (Cinematic 3D Adventure)

Menaik taraf projek sedia ada menjadi permainan pengembaraan 3D dunia terbuka bertaraf premium untuk murid Tahun 3, menggabungkan eksplorasi persekitaran ala *The Legend of Zelda* dengan kebebasan navigasi terbuka ala *GTA V*, sambil mengekalkan identiti aplikasi dan 4 Misi Pembelajaran Bahasa Melayu (Standard 2.2.1: Kosa Kata, Isi Tersurat, Isi Tersirat, dan KBAT).

---

## Audit Teknikal Projek Sedia Ada

| Komponen / Sistem | Status Semasa | Analisis Audit Teknikal | Pelan Peningkatan |
| :--- | :--- | :--- | :--- |
| **Enjin & Rendering 3D** | **3D Sebenar (Three.js)** | Menggunakan WebGL2 asli dengan `THREE.PerspectiveCamera`, bayang-bayang, ketinggian muka bumi (`getTerrainHeight`), dan zarah cuaca. Namun geometri masih berupa blok asas bergaya *low-poly*. | Tingkatkan ke PBR realistik: shader air sungai beralun dengan buih dan kedalaman, bahan permukaan tanah dengan *normal/roughness* prosedural, pepohon tropika rimbun (*banyan, palma, paku-pakis*), pencahayaan sinaran suria volumetrik dan kabus atmosfera. |
| **Kawalan Avatar & Kamera** | **Berfungsi Sepenuhnya** | Kamera *third-person over-the-shoulder* dengan kawalan tetikus 360°, pergerakan WASD/sentuh, lompatan, larian, dan pengesanan permukaan tapak kaki. | Perhalusi fizik momentum avatar: pusingan badan bergradien, animasi sendi lebih organik, penyesuaian sudut lereng bukit, dan *camera collision avoidance* yang lebih pintar agar tidak menembusi dedaun tebal. |
| **Kandungan Pendidikan BM (2.2.1)** | **Lengkap & Berfungsi** | 8 Kosa Kata teras dengan takrifan kamus dan ayat contoh, 3 papan maklumat interaktif, 3 NPC dengan soalan isi tersurat, 3 cabaran inferens isi tersirat, dan pentaksiran PBD (TP1–TP6). | Kekalkan 100% kandungan kurikulum sedia ada. Tambah penanda misi visual (*quest beacons*), animasi reaksi NPC yang lebih ekspresif, dan paparan petikan membaca yang lebih sinematik. |
| **Mini-Permainan & Khazanah** | **Berfungsi Sepenuhnya** | Mini-game pengasingan sisa kitar semula, mini-game teka kicauan burung rimba, dan 6 khazanah flora & fauna tersembunyi dengan kosa kata bonus. | Tambah maklum balas visual pemulihan alam masa nyata apabila misi diselesaikan (air sungai bertukar jernih kristal, ikan melompat, anak pokok bertumbuh secara animasi). |
| **Sistem Audio & TTS** | **Berfungsi (Web Speech & Azure Proxy)** | Enjin audio prosedural (BGM pentatonik, ambien zon, derapan tapak kaki mengikut permukaan, kesan tindakan) dan laluan proksi Azure Speech. | Tambah penyedia utama **Google Gemini TTS** (`gemini-3.8-flash-lite-tts` / `gemini-3.8-flash-tts`) melalui SDK pelayan `@google/genai` dengan bahasa `ms-MY` dan *caching* audio, nod audio spatial (*PannerNode*) untuk air terjun dan burung, serta kawalan kelantangan terperinci. |
| **Cuaca Dinamik** | **Berfungsi Sepenuhnya** | 4 mod cuaca (Cerah, Hujan, Berangin, Senja) dengan zarah titisan hujan, daun melayang, dan kesan fizik kelicinan tanah. | Tambahkan kesan lopak air berkilau (*wet ground specular highlights*) semasa hujan dan peralihan warna langit sinematik. |
| **Skrin Utama & Persembahan** | **Berfungsi** | Menu permulaan dengan pemilihan watak (Wira Amir / Wira Aina) dan kualiti grafik. | Tambah lawatan kamera sinematik (*live world camera tour*) di latar belakang menu utama sebelum butang Mula ditekan. |

---

## Keputusan Kritikal Pengguna (User Review & Critical Decisions)

> [!IMPORTANT]
> 1. **Pengekalan Struktur**: Sifar pemadaman atau penulisan semula kod dari awal. Semua fail sedia ada (`curriculumData.ts`, `rules.ts`, modal-modal pendidikan BM) dikekalkan dan dinaik taraf secara modular.
> 2. **Sintesis Suara (TTS)**: Menambah laluan backend `/api/gemini/tts` menggunakan SDK pelayan `@google/genai` (`gemini-3.8-flash-lite-tts`) dengan bahasa Melayu standard (`ms-MY`) dan sokongan ekspresi kanak-kanak, sambil mengekalkan Azure Speech dan Web Speech API sebagai sandaran automatik tanpa memerlukan kunci mandatori untuk bermain.
> 3. **Prestasi Komputer Sekolah**: Mengoptimumkan geometri Three.js dengan *InstancedMesh* untuk rumpun rumput dan paku-pakis, memastikan kadar bingkai lancar pada perkakasan sekolah.

---

## 1. Konsep & Pengalaman Pengguna (Cinematic Tropical Open-World)

Permainan ini mengekalkan identiti wira cilik sekolah rendah Malaysia yang menjelajah **Taman Lestari**:
- **Penerokaan Bebas**: Tiada lorong terkurung; murid bebas berjalan ke puncak bukit tinjau, menyeberangi jambatan kayu di atas jeram air terjun, meneroka gua batu kecil, melawat kiosk kitar semula, dan meneroka denai rimba.
- **Persekitaran Bertindak Balas (Living World)**: Apabila sampah dikutip, kawasan sungai bertukar jernih dengan ikan akuatik berenang riang; apabila anak pokok ditanam di Kawasan Pemuliharaan, pokok membesar dengan animasi dedaun mekar.
- **Aliran Pendidikan Semula Jadi**: Papan tanda maklumat, watak NPC dan cabaran inferens diletakkan secara bersepadu di lokasi geografi yang sepadan dengan konteks teks bacaan.

---

## 2. Reka Bentuk Visual & Grafik 3D Realistik

### A. Seni Bina Alam Tropika Malaysia
- **Rupa Muka Bumi (Terrain PBR)**: Tekstur kanvas prosedural dengan lapisan tanah rumput tropika (*Centipede grass*), batu kerikil denai, dan pasir tebing sungai yang mempunyai *bump map* dan *roughness* berbeza.
- **Pepohon Tropika Majmuk**: Menggantikan kon ringkas dengan pokok multi-bahagian (*Beringin berakar liana, Kelapa Sawit/Palma kipas, Pokok Cengal dan Meranti*) dengan variasi warna dedaun dan pergerakan goyangan angin lembut (*vertex oscillation*).
- **Shader Air Sungai & Jeram**: Air sungai lut sinar dengan pantulan persekitaran (*PBR metalness/roughness*), ombak berriak kecil, dan buih putih di sekitar tiang jambatan dan jeram air terjun.
- **Pencahayaan & Suasana Sinematik**: Gabungan cahaya matahari hangat (*Directional Key Light* dengan bayang lembut), cahaya pantulan langit biru tropika (*Hemisphere Light*), dan kabus berjarak (*FogExp2*) yang berpadu dengan warna ufuk langit.

---

## 3. Pelan Seni Bina Teknikal & Aliran Data

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PELAYAR KLIEN (FRONTEND)                        │
├────────────────────────────────┬───────────────────────────────────────┤
│    Enjin 3D (ThreeEngine)      │         Antara Muka HUD & Modals      │
│  - Three.js WebGL2 Renderer    │  - GameHUD (Minimap GPS, Kompas)      │
│  - PBR Terrain & River Water   │  - DialogueModal (Pak Osman, Oyen)    │
│  - Procedural Foliage & Trees  │  - ReadingBoardModal (Kosa Kata 2.2.1)│
│  - 3rd-Person Avatar & Camera  │  - InferencePuzzleModal (Isi Tersirat)│
│  - Dynamic Weather (Hujan/Ribut│  - Mini-Games (Kitar Semula & Burung) │
│  - Spatial Audio Panners       │  - PbdAssessmentModal & Sijil TP1-TP6 │
└────────────────────────────────┴───────────────────┬───────────────────┘
                                                     │ Panggilan API
                                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PELAYAN TEMPATAN (SERVER.TS)                      │
├────────────────────────────────────────────────────────────────────────┤
│  - POST /api/gemini/tts: Gemini 3.8 Flash Lite TTS (ms-MY Audio/WAV)   │
│  - POST /api/tts: Azure Cognitive Speech REST Proxy (ms-MY-Yasmin)     │
│  - Fallback Automatik: Web Speech API Pelayar Tempatan                 │
│  - Cache Fail Audio dalam Memori / Penyajian Aset Statik               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Fasa Pelaksanaan Langkah Demi Langkah

1. **Fasa 1: Pelayan & Enjin Audio TTS Bahasa Melayu (Server Upgrade)**
   - Sambungkan SDK `@google/genai` pada `server.ts` untuk laluan `/api/gemini/tts` dengan model `gemini-3.8-flash-lite-tts` dan gaya bahasa Melayu Malaysia yang ramah kanak-kanak.
   - Sediakan cache memori audio untuk mengelakkan panggilan berulang bagi ayat dialog tetap.
   - Lengkapkan nod audio spatial (*Web Audio PannerNode*) untuk jeram air dan kicauan burung.

2. **Fasa 2: Menaik Taraf Visual Dunia 3D (ThreeEngine Realism Upgrade)**
   - Perkayakan rupa bentuk pokok dan tumbuhan tropika (pelbagai lapisan kanopi, akar banir, tumbuhan herba).
   - Tambah menara tinjau kayu (*scenic viewpoint*), air terjun kecil dengan jeram air sungai, dan batuan sungai.
   - Tingkatkan shader permukaan air sungai dengan buih dan kedalaman lut sinar.
   - Tambah lawatan kamera sinematik berpanorama (*panoramic flyover*) pada skrin tajuk sebelum pengembaraan bermula.

3. **Fasa 3: Avatar Controller & Animasi Persekitaran Hidup**
   - Perhalusi animasi pergerakan avatar (lenggokan bahu, beg penjelajah, animasi idle bernafas).
   - Pastikan interaksi pemulihan alam menghasilkan tindak balas visual ketara: air sungai menjadi jernih serta-merta, sampah lenyap dengan efek kelip bintang, dan pokok semaian membesar.
   - Tambahkan haiwan rimba (kancil yang melintas, burung enggang berterbangan di dahan tinggi).

4. **Fasa 4: Pengesahan & Ujian Kualiti Penuh (QA Testing)**
   - Jalankan ujian unit logic KSSR (`tsx --test src/game/rules.test.ts`).
   - Lakukan semakan kompilasi dan linting (`compile_applet` & `lint_applet`).
   - Uji perjalanan lengkap dari skrin permulaan, keempat-empat misi BM 2.2.1, dua mini-game, pencarian khazanah, hingga penjanaan Sijil PBD.
