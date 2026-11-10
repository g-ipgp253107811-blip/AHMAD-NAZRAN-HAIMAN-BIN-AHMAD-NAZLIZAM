/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Data Kurikulum Bahasa Melayu Tahun 3 (DSKP Standard Pembelajaran 2.2.1)
 */

import {
  ZoneInfo,
  KosaKataItem,
  ReadingBoardData,
  NpcData,
  InferencePuzzleData,
  TrashItem,
  PlantingSpot,
  RiverPollutionSpot,
  PbdQuizQuestion,
  FloraFaunaCollectible,
  BirdCallData,
  WeatherState,
} from '../types/game.ts';

export const ZONES: Record<string, ZoneInfo> = {
  PINTU_MASUK: {
    id: 'PINTU_MASUK',
    name: 'Pintu Masuk Taman',
    description: 'Pintu gerbang utama taman lestari, pusat maklumat dan titik permulaan wira.',
    landmark: 'Gerbang Kayu Ukir & Pusat Maklumat',
    coordinates: { x: -35, z: -35 },
    color: '#10b981',
    ambience: 'entrance',
  },
  HUTAN_HIJAU: {
    id: 'HUTAN_HIJAU',
    name: 'Hutan Hijau',
    description: 'Hutan tropika rendang dengan pelbagai pokok, kupu-kupu riang dan habitat hidupan liar.',
    landmark: 'Pohon Beringin Megah & Denai Alam',
    coordinates: { x: -45, z: 25 },
    color: '#059669',
    ambience: 'forest',
  },
  SUNGAI_LESTARI: {
    id: 'SUNGAI_LESTARI',
    name: 'Sungai Lestari',
    description: 'Sungai berliku dengan air terjun kecil dan jambatan kayu yang memerlukan penjagaan kebersihan.',
    landmark: 'Jambatan Kayu Lengkung & Jeram Air',
    coordinates: { x: 5, z: 10 },
    color: '#0ea5e9',
    ambience: 'river',
  },
  PUSAT_KITAR_SEMULA: {
    id: 'PUSAT_KITAR_SEMULA',
    name: 'Pusat Kitar Semula',
    description: 'Fasiliti pengasingan sisa terpakai mengikut kategori kertas, plastik dan logam.',
    landmark: 'Kiosk Kitar Semula Tiga Warna',
    coordinates: { x: 40, z: -30 },
    color: '#f59e0b',
    ambience: 'recycling',
  },
  TAMAN_REKREASI: {
    id: 'TAMAN_REKREASI',
    name: 'Taman Rekreasi',
    description: 'Kawasan riadah kanak-kanak dengan buaian, papan gelongsor dan bangku rehat selesa.',
    landmark: 'Gelanggang Permainan Kanak-Kanak',
    coordinates: { x: 40, z: 35 },
    color: '#ec4899',
    ambience: 'playground',
  },
  KAWASAN_PEMULIHARAAN: {
    id: 'KAWASAN_PEMULIHARAAN',
    name: 'Kawasan Pemuliharaan',
    description: 'Tapak semaian anak pokok dan pemulihan habitat semula jadi flora dan fauna.',
    landmark: 'Pusat Semaian Pokok & Tempat Santuari Haiwan',
    coordinates: { x: -20, z: 45 },
    color: '#84cc16',
    ambience: 'forest',
  },
};

export const INITIAL_KOSA_KATA: KosaKataItem[] = [
  {
    id: 'kitar_semula',
    word: 'kitar semula',
    rootWord: 'kitar',
    definition: 'Amalan memproses semula bahan terpakai untuk menghasilkan barangan baharu yang bermanfaat.',
    exampleSentence: 'Kita boleh mengitar semula kertas, plastik dan tin untuk mengurangkan sampah di taman.',
    category: 'amalan',
    sourceBoardId: 'board_a',
    collected: false,
  },
  {
    id: 'bahan_terpakai',
    word: 'bahan terpakai',
    rootWord: 'pakai',
    definition: 'Barangan atau sisa yang telah digunakan tetapi masih boleh diguna semula atau dikitar semula.',
    exampleSentence: 'Surat khabar lama dan botol minuman kosong ialah contoh bahan terpakai yang berguna.',
    category: 'amalan',
    sourceBoardId: 'board_a',
    collected: false,
  },
  {
    id: 'habitat',
    word: 'habitat',
    rootWord: 'habitat',
    definition: 'Tempat tinggal semula jadi bagi haiwan dan tumbuhan untuk hidup, membesar dan membiak.',
    exampleSentence: 'Hutan tebal merupakan habitat yang aman bagi burung enggang dan monyet.',
    category: 'alam',
    sourceBoardId: 'board_b',
    collected: false,
  },
  {
    id: 'semula_jadi',
    word: 'semula jadi',
    rootWord: 'jadi',
    definition: 'Keadaan asal tanpa sebarang buatan atau campur tangan manusia.',
    exampleSentence: 'Sungai yang jernih dan pepohon rendang mencantikkan pemandangan alam semula jadi.',
    category: 'alam',
    sourceBoardId: 'board_b',
    collected: false,
  },
  {
    id: 'tercemar',
    word: 'tercemar',
    rootWord: 'cemar',
    definition: 'Keadaan yang menjadi kotor, beracun atau rosak akibat kemasukan kotoran dan sampah.',
    exampleSentence: 'Air sungai menjadi tercemar apabila orang yang tidak bertanggungjawab membuang sisa plastik.',
    category: 'alam',
    sourceBoardId: 'board_c',
    collected: false,
  },
  {
    id: 'hidupan_air',
    word: 'hidupan air',
    rootWord: 'hidup',
    definition: 'Semua jenis makhluk seperti ikan, udang dan rumpai yang tinggal di dalam air.',
    exampleSentence: 'Pencemaran sungai boleh membunuh pelbagai hidupan air yang berharga.',
    category: 'alam',
    sourceBoardId: 'board_c',
    collected: false,
  },
  {
    id: 'kebersihan',
    word: 'kebersihan',
    rootWord: 'bersih',
    definition: 'Perihal bersih, kemas, suci dan bebas daripada kotoran serta penyakit.',
    exampleSentence: 'Amalan menjaga kebersihan persekitaran menjamin kesihatan semua warga taman.',
    category: 'tindakan',
    sourceBoardId: 'board_c',
    collected: false,
  },
  {
    id: 'membahayakan',
    word: 'membahayakan',
    rootWord: 'bahaya',
    definition: 'Mendatangkan bahaya, kecederaan atau kesan buruk kepada diri atau makhluk lain.',
    exampleSentence: 'Sampah plastik yang bertaburan boleh membahayakan haiwan liar yang sedang mencari makanan.',
    category: 'tindakan',
    sourceBoardId: 'board_c',
    collected: false,
  },
];

export const READING_BOARDS: ReadingBoardData[] = [
  {
    id: 'board_a',
    title: 'PAPAN A: KITAR SEMULA',
    subtitle: 'Kawasan Pusat Kitar Semula',
    zoneId: 'PUSAT_KITAR_SEMULA',
    passage:
      'Kitar semula ialah amalan memproses semula bahan terpakai untuk menghasilkan barangan baharu. Kita boleh mengitar semula kertas, plastik dan tin.',
    targetWords: ['kitar semula', 'bahan terpakai'],
    coordinates: { x: 34, z: -26 },
    hasRead: false,
  },
  {
    id: 'board_b',
    title: 'PAPAN B: HABITAT',
    subtitle: 'Kawasan Hutan Hijau',
    zoneId: 'HUTAN_HIJAU',
    passage:
      'Habitat ialah tempat tinggal semula jadi haiwan dan tumbuhan. Hutan menjadi habitat kepada burung, monyet dan pelbagai jenis serangga.',
    targetWords: ['habitat', 'semula jadi'],
    coordinates: { x: -38, z: 20 },
    hasRead: false,
  },
  {
    id: 'board_c',
    title: 'PAPAN C: SUNGAI TERCEMAR',
    subtitle: 'Kawasan Sungai Lestari',
    zoneId: 'SUNGAI_LESTARI',
    passage:
      'Sungai tercemar apabila sampah dibuang ke dalam air. Air yang kotor boleh membahayakan ikan dan hidupan air yang lain. Oleh itu, kebersihan sungai perlu sentiasa kita pelihara.',
    targetWords: ['tercemar', 'membahayakan', 'hidupan air', 'kebersihan'],
    coordinates: { x: -3, z: 6 },
    hasRead: false,
  },
];

export const NPCS: NpcData[] = [
  {
    id: 'pak_osman',
    name: 'Pak Osman',
    role: 'Penjaga Taman Lestari',
    avatarIcon: '🌳',
    zoneId: 'PINTU_MASUK',
    dialogueText:
      'Selamat datang, adik wira alam! Pokok memberikan udara yang segar dan menjadi tempat perlindungan kepada haiwan. Mari kita jaga taman ini bersama-sama.',
    voiceName: 'ms-MY-OsmanNeural',
    pitch: 0.95,
    coordinates: { x: -28, z: -30 },
    question: {
      prompt: 'Berdasarkan penerangan Pak Osman, apakah yang diberikan oleh pokok kepada manusia?',
      options: [
        { id: 'opt_a', text: 'Udara yang segar dan tempat perlindungan' },
        { id: 'opt_b', text: 'Air minuman manis berkarbonat' },
        { id: 'opt_c', text: 'Batu-bata untuk membuat jalan raya' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Betul! Pokok menghasilkan oksigen yang memberikan udara segar kepada kita.',
    },
    hasAnswered: false,
  },
  {
    id: 'si_oyen',
    name: 'Si Oyen',
    role: 'Kucing Sahabat Rimba',
    avatarIcon: '🐱',
    zoneId: 'TAMAN_REKREASI',
    dialogueText:
      'Meow! Hai kawan! Sampah yang dibuang merata-rata boleh membahayakan haiwan seperti saya. Kaca tajam dan plastik boleh mencederakan kaki kami.',
    voiceName: 'ms-MY-YasminNeural',
    pitch: 1.35,
    coordinates: { x: 32, z: 28 },
    question: {
      prompt: 'Berdasarkan luahan Si Oyen, apakah perkara yang boleh membahayakan haiwan di taman?',
      options: [
        { id: 'opt_a', text: 'Sampah yang dibuang merata-rata' },
        { id: 'opt_b', text: 'Rumput hijau yang segar' },
        { id: 'opt_c', text: 'Tiupan angin sepoi-sepoi bahasa' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Tepat sekali! Sampah yang bertaburan boleh mencemari alam dan membahayakan keselamatan haiwan.',
    },
    hasAnswered: false,
  },
  {
    id: 'puan_aminah',
    name: 'Puan Aminah',
    role: 'Penyelia Pusat Kitar Semula',
    avatarIcon: '♻️',
    zoneId: 'PUSAT_KITAR_SEMULA',
    dialogueText:
      'Kertas, plastik dan tin boleh dikumpulkan untuk dikitar semula. Mengasingkan sampah mengikut warna tong ialah langkah wira alam yang bijak!',
    voiceName: 'ms-MY-YasminNeural',
    pitch: 1.05,
    coordinates: { x: 36, z: -22 },
    question: {
      prompt: 'Berdasarkan ucapan Puan Aminah, nyatakan bahan yang boleh dikitar semula.',
      options: [
        { id: 'opt_a', text: 'Kertas, plastik dan tin' },
        { id: 'opt_b', text: 'Minyak enjin dan tayar terbakar' },
        { id: 'opt_c', text: 'Batu batan dan pasir pantai' },
      ],
      correctOptionId: 'opt_a',
      explanation: 'Hebat! Kertas, plastik dan tin ialah bahan terpakai yang mudah diproses semula menjadi barangan baharu.',
    },
    hasAnswered: false,
  },
];

export const INFERENCE_PUZZLES: InferencePuzzleData[] = [
  {
    id: 'puzzle_river',
    title: 'SITUASI 1: SUNGAI DAN HIDUPAN AIR',
    zoneId: 'SUNGAI_LESTARI',
    clue: 'Sampah plastik terapung di sungai. Beberapa ekor ikan berenang berhampiran kawasan tersebut dan air kelihatan keruh.',
    question: 'Mengapakah kita perlu mengelakkan perbuatan membuang sampah ke dalam sungai?',
    hint: 'Fikirkan tentang keselamatan hidupan air sekiranya air menjadi beracun atau tersumbat.',
    options: [
      {
        id: 'inf_1_a',
        text: 'Supaya hidupan air tidak terancam dan habitat air kekal bersih serta selamat',
      },
      {
        id: 'inf_1_b',
        text: 'Supaya ikan boleh bermain dengan botol plastik terapung',
      },
      {
        id: 'inf_1_c',
        text: 'Kerana sampah plastik akan menukarkan air menjadi manis',
      },
    ],
    correctOptionId: 'inf_1_a',
    explanation:
      'Isi tersirat: Walaupun petikan tidak menyatakan terus kata larangan, kita membuat kesimpulan bahawa sampah membahayakan ikan dan hidupan akuatik.',
    coordinates: { x: 4, z: 18 },
    completed: false,
  },
  {
    id: 'puzzle_forest',
    title: 'SITUASI 2: HUTAN DAN HIDUPAN LIAR',
    zoneId: 'HUTAN_HIJAU',
    clue: 'Burung berkicau di dahan pokok. Monyet berlindung di celah-celah pokok yang rendang.',
    question: 'Apakah yang mungkin berlaku jika banyak pokok ditebang secara sesuka hati?',
    hint: 'Apakah erti pokok kepada burung dan monyet sebagai rumah semula jadi mereka?',
    options: [
      {
        id: 'inf_2_a',
        text: 'Haiwan akan kehilangan tempat perlindungan, makanan dan habitat asalnya',
      },
      {
        id: 'inf_2_b',
        text: 'Burung akan lebih gembira kerana mempunyai lebih banyak ruang terbang',
      },
      {
        id: 'inf_2_c',
        text: 'Monyet akan mula berenang di dalam laut dalam',
      },
    ],
    correctOptionId: 'inf_2_a',
    explanation:
      'Isi tersirat: Pokok merupakan tempat tinggal haiwan. Penebangan pokok menyebabkan kemusnahan habitat haiwan liar.',
    coordinates: { x: -42, z: 32 },
    completed: false,
  },
  {
    id: 'puzzle_recycle',
    title: 'SITUASI 3: AMALAN PENGASINGAN SISA',
    zoneId: 'PUSAT_KITAR_SEMULA',
    clue: 'Amir mengasingkan botol plastik dan kertas ke dalam tong kitar semula mengikut warna yang betul.',
    question: 'Apakah kesan baik daripada tindakan terpuji Amir itu?',
    hint: 'Fikirkan tentang kebersihan persekitaran dan faedah memproses bahan terpakai.',
    options: [
      {
        id: 'inf_3_a',
        text: 'Bahan terpakai dapat diproses semula dan jumlah sampah di bumi dapat dikurangkan',
      },
      {
        id: 'inf_3_b',
        text: 'Amir boleh menyimpan sampah itu di dalam bilik tidurnya',
      },
      {
        id: 'inf_3_c',
        text: 'Semua tong sampah akan cepat rosak dan pecah',
      },
    ],
    correctOptionId: 'inf_3_a',
    explanation:
      'Isi tersirat: Mengasingkan sampah membolehkan bahan diproses semula, sekaligus menjimatkan sumber bumi dan mengurangkan pencemaran.',
    coordinates: { x: 44, z: -25 },
    completed: false,
  },
];

export const INITIAL_TRASH_ITEMS: TrashItem[] = [
  {
    id: 'trash_1',
    name: 'Botol Plastik Mineral',
    category: 'plastik_aluminium',
    coordinates: { x: 2, y: 0.1, z: 8 },
    collected: false,
    sorted: false,
  },
  {
    id: 'trash_2',
    name: 'Tin Minuman Aluminium',
    category: 'plastik_aluminium',
    coordinates: { x: 8, y: 0.1, z: 14 },
    collected: false,
    sorted: false,
  },
  {
    id: 'trash_3',
    name: 'Surat Khabar Lama',
    category: 'kertas',
    coordinates: { x: 28, y: 0.1, z: 22 },
    collected: false,
    sorted: false,
  },
  {
    id: 'trash_4',
    name: 'Kotak Minuman Kertas',
    category: 'kertas',
    coordinates: { x: 38, y: 0.1, z: 26 },
    collected: false,
    sorted: false,
  },
  {
    id: 'trash_5',
    name: 'Botol Kaca Sos Lama',
    category: 'kaca_logam',
    coordinates: { x: -10, y: 0.1, z: -15 },
    collected: false,
    sorted: false,
  },
  {
    id: 'trash_6',
    name: 'Tin Biskut Logam',
    category: 'kaca_logam',
    coordinates: { x: -18, y: 0.1, z: -24 },
    collected: false,
    sorted: false,
  },
];

export const INITIAL_PLANTING_SPOTS: PlantingSpot[] = [
  {
    id: 'plant_1',
    name: 'Tapak Anak Pokok Meranti',
    coordinates: { x: -24, y: 0, z: 42 },
    planted: false,
  },
  {
    id: 'plant_2',
    name: 'Tapak Anak Pokok Cengal',
    coordinates: { x: -18, y: 0, z: 48 },
    planted: false,
  },
  {
    id: 'plant_3',
    name: 'Tapak Pokok Bunga Raya Kebangsaan',
    coordinates: { x: -12, y: 0, z: 44 },
    planted: false,
  },
];

export const INITIAL_RIVER_SPOTS: RiverPollutionSpot[] = [
  {
    id: 'river_pollute_1',
    coordinates: { x: 3, y: -0.2, z: 4 },
    cleaned: false,
  },
  {
    id: 'river_pollute_2',
    coordinates: { x: 6, y: -0.2, z: 12 },
    cleaned: false,
  },
  {
    id: 'river_pollute_3',
    coordinates: { x: 10, y: -0.2, z: -6 },
    cleaned: false,
  },
];

export const PBD_QUESTIONS: PbdQuizQuestion[] = [
  {
    id: 'q_vocab_1',
    type: 'kosa_kata',
    title: 'Bahagian A: Mengecam Kosa Kata',
    stimulus: 'Hutan tebal menjadi ________ kepada pelbagai jenis haiwan liar dan burung.',
    prompt: 'Pilih perkataan yang paling tepat untuk melengkapkan ayat di atas.',
    options: [
      { id: 'opt_1_a', text: 'habitat' },
      { id: 'opt_1_b', text: 'bahan terpakai' },
      { id: 'opt_1_c', text: 'kitar semula' },
    ],
    correctOptionId: 'opt_1_a',
  },
  {
    id: 'q_vocab_2',
    type: 'kosa_kata',
    title: 'Bahagian A: Mengecam Kosa Kata',
    stimulus: 'Kitar semula ialah amalan memproses semula bahan yang telah digunakan.',
    prompt: 'Apakah perkataan yang seerti dengan "barangan atau sisa yang telah digunakan"?',
    options: [
      { id: 'opt_2_a', text: 'bahan terpakai' },
      { id: 'opt_2_b', text: 'hidupan air' },
      { id: 'opt_2_c', text: 'semula jadi' },
    ],
    correctOptionId: 'opt_2_a',
  },
  {
    id: 'q_tersurat_1',
    type: 'isi_tersurat',
    title: 'Bahagian B: Memahami Isi Tersurat',
    stimulus:
      'Petikan: "Pokok memberikan udara yang segar dan menjadi tempat perlindungan kepada haiwan."',
    prompt: 'Berdasarkan petikan di atas, apakah faedah pokok kepada haiwan?',
    options: [
      { id: 'opt_3_a', text: 'Menjadi tempat perlindungan' },
      { id: 'opt_3_b', text: 'Menjadi alat mainan' },
      { id: 'opt_3_c', text: 'Menghasilkan pakaian' },
    ],
    correctOptionId: 'opt_3_a',
  },
  {
    id: 'q_tersirat_1',
    type: 'isi_tersirat',
    title: 'Bahagian C: Menginferens Isi Tersirat',
    stimulus:
      'Situasi: "Penduduk kampung bergotong-royong membersihkan sungai yang dipenuhi plastik setiap hujung minggu."',
    prompt: 'Apakah isi tersirat daripada amalan murni penduduk kampung tersebut?',
    options: [
      {
        id: 'opt_4_a',
        text: 'Mereka prihatin terhadap kesihatan alam dan ingin menyelamatkan hidupan air',
      },
      {
        id: 'opt_4_b',
        text: 'Mereka mahu mengumpulkan sampah untuk dijual ke pasar malam',
      },
      {
        id: 'opt_4_c',
        text: 'Mereka mahu mengurangkan air sungai agar kering kontang',
      },
    ],
    correctOptionId: 'opt_4_a',
  },
  {
    id: 'q_kbat_1',
    type: 'kbat',
    title: 'Bahagian D: Kemahiran Berfikir Aras Tinggi (KBAT)',
    stimulus: 'Bayangkan kamu sedang beriadah di tepi tasik atau sungai bersama keluarga.',
    prompt:
      'Jika kamu melihat sungai yang dipenuhi sampah, apakah tindakan yang akan kamu lakukan untuk menjaga kebersihannya? Berikan satu alasan.',
    rubricNotes:
      'Murid dinilai atas keupayaan mencadangkan tindakan proaktif (cth: mengutip sampah / melaporkan / memasang papan tanda peringatan) berserta alasan logik (cth: agar hidupan air tidak terancam / air tidak berbau busuk).',
  },
];

export const FLORA_FAUNA_COLLECTIBLES: FloraFaunaCollectible[] = [
  {
    id: 'col_rafflesia',
    name: 'Bunga Pakma (Rafflesia)',
    type: 'flora',
    scientificName: 'Rafflesia kerrii',
    malayStatus: 'Bunga Terbesar di Dunia (Spesies Terancam)',
    zoneId: 'HUTAN_HIJAU',
    description:
      'Bunga terbesar di dunia yang tumbuh di hutan hujan tropika Malaysia. Bunga ini tidak mempunyai daun, batang atau akar sebenar dan menumpang pada akar pokok liana.',
    funFact:
      'Bunga Pakma mengeluarkan bau seperti daging reput untuk memikat lalat dan serangga bagi membantu proses pendebungaan!',
    newVocabulary: {
      word: 'endemik',
      definition: 'Spesies hidupan yang hanya dijumpai secara semula jadi di sesuatu kawasan geografi tertentu sahaja.',
    },
    coordinates: { x: -48, y: 0.1, z: 28 },
    found: false,
  },
  {
    id: 'col_hornbill',
    name: 'Burung Enggang Badak',
    type: 'fauna',
    scientificName: 'Buceros rhinoceros',
    malayStatus: 'Burung Lambang Kebanggaan Negara',
    zoneId: 'HUTAN_HIJAU',
    description:
      'Burung hutan yang megah dengan paruh bertanduk melengkung ke atas berwarna merah keemasan. Burung ini sangat setia kepada pasangannya seumur hidup.',
    funFact:
      'Burung enggang digelar "petani rimba" kerana ia menyebarkan biji benih buah-buahan hutan sejauh berpuluh-puluh kilometer semasa terbang!',
    newVocabulary: {
      word: 'kanopi',
      definition: 'Lapisan silara dedaun pokok hutan yang rendang dan bersambung-sambung di bahagian atas.',
    },
    coordinates: { x: -32, y: 0.5, z: 38 },
    found: false,
  },
  {
    id: 'col_meranti',
    name: 'Pokok Meranti Tembaga',
    type: 'flora',
    scientificName: 'Shorea leprosula',
    malayStatus: 'Pokok Hutan Dipterokarpa Bernilai Tinggi',
    zoneId: 'KAWASAN_PEMULIHARAAN',
    description:
      'Salah satu spesies pokok balak hutan hujan yang mampu tumbuh mencecah ketinggian lebih 60 meter. Pokok ini menyerap sejumlah besar gas karbon dioksida.',
    funFact:
      'Biji benih pokok meranti mempunyai sayap nipis seperti kipas helikopter yang membantunya melayang jauh ditiup angin!',
    newVocabulary: {
      word: 'pemuliharaan',
      definition: 'Usaha memelihara, melindungi dan memulihkan sumber alam semula jadi daripada kemusnahan.',
    },
    coordinates: { x: -14, y: 0.2, z: 38 },
    found: false,
  },
  {
    id: 'col_tapir',
    name: 'Tapir Malaya (Cipan)',
    type: 'fauna',
    scientificName: 'Tapirus indicus',
    malayStatus: 'Haiwan Mamalia Unik (Spesies Dilindungi)',
    zoneId: 'KAWASAN_PEMULIHARAAN',
    description:
      'Haiwan berbadan dua tona warna (hitam dan putih) dengan muncung fleksibel yang comel. Tapir ialah haiwan pemalu yang aktif pada waktu malam.',
    funFact:
      'Warna dwi-tona tapir bertindak seperti penyamaran (kamuflaj) di bawah bayang-bayang hutan apabila cahaya bulan menyinar!',
    newVocabulary: {
      word: 'nokturnal',
      definition: 'Sifat haiwan yang aktif bergerak, berburu atau mencari makanan pada waktu malam.',
    },
    coordinates: { x: -26, y: 0.1, z: 52 },
    found: false,
  },
  {
    id: 'col_kancil',
    name: 'Kancil Rimba (Pelanduk)',
    type: 'fauna',
    scientificName: 'Tragulus kanchil',
    malayStatus: 'Haiwan Paling Pintar Cerita Rakyat Malaysia',
    zoneId: 'TAMAN_REKREASI',
    description:
      'Salah satu mamalia berkuku terkecil di dunia. Kancil terkenal dalam kisah rakyat Melayu warisan zaman berzaman kerana kebijaksanaan dan kecerdikannya.',
    funFact:
      'Walaupun bersaiz sekecil kucing peliharaan, kancil mampu melompat dengan pantas untuk melarikan diri daripada pemangsa!',
    newVocabulary: {
      word: 'cerdik',
      definition: 'Cepat faham, pintar berfikir dan pandai mencari akal untuk menyelesaikan sesuatu masalah.',
    },
    coordinates: { x: 44, y: 0.1, z: 42 },
    found: false,
  },
  {
    id: 'col_katak_puru',
    name: 'Katak Pokok Belukar',
    type: 'fauna',
    scientificName: 'Polypedates leucomystax',
    malayStatus: 'Amfibia Penunjuk Kesihatan Ekosistem Air',
    zoneId: 'SUNGAI_LESTARI',
    description:
      'Amfibia kecil yang gemar tinggal berhampiran tebing sungai jernih. Kulit katak yang sensitif menjadikannya penunjuk sama ada air sungai bersih atau tercemar.',
    funFact:
      'Katak ini membina sarang berbuih putih di atas dahan pokok yang merentangi air untuk melindungi telurnya daripada pemangsa!',
    newVocabulary: {
      word: 'ekosistem',
      definition: 'Sistem interaksi antara hidupan bernyawa dengan persekitaran fizikal semula jadi di sekelilingnya.',
    },
    coordinates: { x: 7, y: 0.1, z: 2 },
    found: false,
  },
];

export const BIRD_CALLS_GAME: BirdCallData[] = [
  {
    id: 'bird_enggang',
    name: 'Burung Enggang Badak',
    localName: 'Enggang Rimba',
    soundType: 'deep_resonant',
    description: 'Bunyi "KOK-KOK-KAAAH" yang garau, dalam dan bergema luas di segenap silara kanopi pokok hutan.',
    habitat: 'Hutan Tebal Tropika Hujan Rendang',
    hint: 'Burung ini mempunyai paruh besar melengkung dan menjadi lambang negeri Sarawak.',
  },
  {
    id: 'bird_murai',
    name: 'Burung Murai Batu',
    localName: 'Murai Kicau',
    soundType: 'flute_trill',
    description: 'Kicauan merdu bersiul-siul beralun seperti tiupan seruling buluh yang amat manis di waktu pagi.',
    habitat: 'Kawasan Belukar dan Tepi Denai Alam',
    hint: 'Burung kecil berekor panjang yang terkenal dengan kepelbagaian melodi nyanyiannya.',
  },
  {
    id: 'bird_ungka',
    name: 'Ungka Rimba (Gibbon)',
    localName: 'Ungka Tangan Putih',
    soundType: 'whoop_call',
    description: 'Laungan nada tinggi "WUUP-WUUP-HUUU" berirama yang dilaungkan oleh keluarga ungka pada awal fajar.',
    habitat: 'Kawasan Atas Kanopi Pokok Tinggi',
    hint: 'Haiwan primat berkaki tangan panjang yang gemar bergayut dari dahan ke dahan.',
  },
  {
    id: 'animal_katak',
    name: 'Katak Pokok Sungai',
    localName: 'Katak Hujan',
    soundType: 'croak_rhythm',
    description: 'Bunyi dengkur berulang-ulang "KROK-KROK... KROK-KROK" yang bersahut-sahutan menandakan hujan bakal tiba.',
    habitat: 'Tebing Sungai dan Daun Tumbuhan Lembap',
    hint: 'Amfibia kecil yang melompat dan sangat suka akan suasana sejuk selepas hujan lebat.',
  },
];

export const WEATHER_PRESETS: Record<string, WeatherState> = {
  cerah: {
    current: 'cerah',
    temperature: 30,
    windSpeed: 8,
    rainIntensity: 0,
    wetness: 0,
    label: 'Cerah Berawan',
    effectDescription: 'Matahari pagi menyinari taman dengan indah. Kupu-kupu berterbangan riang di celah bunga.',
  },
  hujan: {
    current: 'hujan',
    temperature: 24,
    windSpeed: 16,
    rainIntensity: 0.8,
    wetness: 0.9,
    label: 'Hujan Tropika Nyaman',
    effectDescription: 'Titisan hujan menyegarkan daun pokok. Permukaan batu basah dan sungai mengalir lebih deras.',
  },
  berangin: {
    current: 'berangin',
    temperature: 27,
    windSpeed: 28,
    rainIntensity: 0,
    wetness: 0.1,
    label: 'Bayu Nyaman Bertiup',
    effectDescription: 'Angin sejuk meniup dahan pokok sehingga berdesir gemersik. Daun-daun kering melayang lembut.',
  },
  senja: {
    current: 'senja',
    temperature: 26,
    windSpeed: 10,
    rainIntensity: 0,
    wetness: 0,
    label: 'Senja Keemasan',
    effectDescription: 'Langit bertukar warna jingga kemerahan yang memukau. Suasana damai menyelubungi seisi rimba.',
  },
};

