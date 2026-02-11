import Groq from "groq-sdk";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
   apiKey: API_KEY,
   dangerouslyAllowBrowser: true // Required for client-side usage
});

export const generateModule = async (data) => {
   const DIMENSION_DESCRIPTIONS = {
      "Keimanan dan Ketakwaan terhadap Tuhan YME": "Membentuk karakter dengan landasan spiritual yang kuat dan akhlak mulia.",
      "Kewargaan": "Membentuk siswa menjadi warga negara yang cinta tanah air, menghargai keberagaman, dan berkontribusi sosial.",
      "Penalaran Kritis": "Kemampuan berpikir logis, analitis, dan reflektif untuk memproses informasi.",
      "Kreativitas": "Mampu berpikir inovatif, orisinal, dan fleksibel dalam menciptakan solusi.",
      "Kolaborasi": "Kemampuan bekerja sama dan gotong royong mencapai tujuan bersama.",
      "Kemandirian": "Bertanggung jawab atas proses belajar sendiri dan mengambil inisiatif.",
      "Kesehatan": "Memiliki fisik prima, bugar, dan keseimbangan kesehatan mental.",
      "Komunikasi": "Mampu menyampaikan ide dan berinteraksi secara efektif."
   };

   const selectedDimensionsDesc = (data.deepLearningDimensions || []).map(d => `${d}: ${DIMENSION_DESCRIPTIONS[d] || ''}`).join('\n          // ');

   try {
      const prompt = `
      Bertindaklah sebagai ahli kurikulum dan guru profesional. Buatkan Modul Ajar lengkap untuk Kurikulum Merdeka dengan pendekatan Pembelajaran Mendalam (Deep Learning).
      
      Output HARUS berupa format JSON valid tanpa markdown formatting (seperti \`\`\`json). 
      Struktur JSON harus SEPERSIS berikut ini:

      {
        "informasiUmum": {
          "sekolah": "SMK Kartanegara Wates Kab. Kediri",
          "namaPenyusun": "${data.teacherName}",
          "mataPelajaran": "${data.subject}",
          "kelas": "${data.grade}",
          "semester": "${data.semester}",
          "alokasiWaktu": "${parseInt(data.duration) * parseInt(data.hoursPerMeeting) * parseInt(data.meetings)} Menit (${data.hoursPerMeeting} JP x ${data.duration} Menit x ${data.meetings} Pertemuan)",
          "pesertaDidik": "${data.studentCharacteristics || 'Reguler/Tipikal'}",
          "materiPelajaran": "${data.topic}",
          "dimensiProfil": ${JSON.stringify(data.deepLearningDimensions || [])}
        },
        "identifikasi": {
           "dpl": [
             // HARUS persis sesuai dengan yang dipilih user di informasiUmum.dimensiProfil
             // GUNAKAN DESKRIPSI BERIKUT UNTUK DIMENSI YANG DIPILIH:
             // ${selectedDimensionsDesc}
             //
             // Format: { "kode": "DPL X", "judul": "Nama Dimensi (Sesuai Input)", "deskripsi": "Deskripsi SESUAI DENGAN YANG DISEDIAKAN DI ATAS." }
           ]
        },
        "desainPembelajaran": {
           "capaianPembelajaran": "${data.learningOutcome || '-'}",
           "lintasDisiplin": "${data.crossDisciplinary || '-'}",
           "tujuanPembelajaran": "${data.learningGoals || '-'}",
           "topik": "${data.topic}",
           "praktikPedagogis": "${data.pedagogicalPractice || '-'}",
           "kemitraan": "${data.partnerships || '-'}",
           "lingkungan": "${data.learningEnvironment || '-'}",
           "digital": "${data.digitalTools || '-'}"
        },
        "pengalamanBelajar": [
             // Generate an array of objects, one for EACH meeting.
             // If data.meetings is 2, there must be 2 objects here.
             {
               "pertemuanKe": 1,
               "alokasiWaktu": "${parseInt(data.duration) * parseInt(data.hoursPerMeeting)} Menit",
               "pendahuluan": {
                  "waktu": "${Math.round(parseInt(data.duration) * parseInt(data.hoursPerMeeting) * 0.15)} Menit",
                  "prinsip": "Berkesadaran, Bermakna, Menggembirakan",
                  "deskripsi": "Deskripsi kegiatan pembuka..."
               },
               "inti": { 
                 "waktu": "${Math.round(parseInt(data.duration) * parseInt(data.hoursPerMeeting) * 0.75)} Menit",
                 // Inti dibagi menjadi 3 tahap utama Deep Learning
                 "memahami": {
                    "prinsip": "Berkesadaran, Bermakna, Menggembirakan",
                    "kegiatan": ["1. ...", "2. ..."]
                 },
                 "mengaplikasi": {
                    "prinsip": "Berkesadaran, Bermakna, Menggembirakan",
                    "kegiatan": ["1. ...", "2. ..."]
                 },
                 "merefleksi": {
                    "prinsip": "Berkesadaran, Bermakna, Menggembirakan",
                    "kegiatan": ["1. ...", "2. ..."]
                 }
               },
               "penutup": {
                  "waktu": "${Math.round(parseInt(data.duration) * parseInt(data.hoursPerMeeting) * 0.10)} Menit",
                  "prinsip": "Berkesadaran, Bermakna, Menggembirakan",
                  "deskripsi": "Refleksi dan penutup..."
               }
             }
        ],
        "penutup": {
           // Global closing/assessment info
           "asesmen": {
              "awal": "${data.initialAssessment || 'Asesmen pada Awal Pembelajaran...'}",
              "proses": "Asesmen pada Proses Pembelajaran...",
              "akhir": "Asesmen pada Akhir Pembelajaran...",
              "detail": "Asesmen dalam pembelajaran mendalam disesuaikan dengan assessment as/for/of learning..."
           }
        },
        "rubrik": {
           "judul": "Rubrik Penilaian Diskusi Kelas",
           "tujuan": "...",
           "indikator": [
              // Array of rows 
              // { "aspek": "Partisipasi", "baruBerkembang": "...", "layak": "...", "cakap": "...", "mahir": "..." }
           ],
           "keterangan": [
             "Baru Berkembang: ...",
             "Layak: ...", 
             // ...
           ]
        }
      }

      Isi konten dengan detail pendidikan yang sesuai dengan input berikut:
      Topik: ${data.topic}
      Tujuan: ${data.objectives || '-'}
      Jumlah Pertemuan: ${data.meetings} (Generate UNIQUE activities for EACH meeting)
      Karakteristik Siswa: ${data.studentCharacteristics || '-'}
    `;

      const completion = await groq.chat.completions.create({
         messages: [
            {
               role: "user",
               content: prompt
            }
         ],
         model: "llama-3.3-70b-versatile",
         temperature: 0.7,
         max_tokens: 8192,
         response_format: { type: "json_object" }
      });

      return completion.choices[0]?.message?.content || "Gagal membuat modul.";
   } catch (error) {
      console.error("Error generating module with Groq:", error);
      throw error;
   }
};

export const generateStandardModule = async (data) => {
   const PEDAGOGICAL_SYNTAX = {
      "Pembelajaran Berbasis Masalah (Problem-Based Learning)": [
         "Orientasi Peserta Didik pada Masalah",
         "Mengorganisasikan Peserta Didik untuk Belajar",
         "Membimbing Penyelidikan Individu maupun Kelompok",
         "Mengembangkan dan Menyajikan Hasil Karya",
         "Menganalisis dan Mengevaluasi Proses Pemecahan Masalah"
      ],
      "Pembelajaran Berbasis Proyek (Project-Based Learning)": [
         "Pertanyaan Mendasar",
         "Mendesain Perencanaan Produk",
         "Menyusun Jadwal Pembuatan",
         "Memonitor Keaktifan dan Perkembangan Proyek",
         "Menguji Hasil",
         "Evaluasi Pengalaman Belajar"
      ],
      "Pembelajaran Berbasis Inkuiri (Inquiry-Based Learning)": [
         "Orientasi Masalah",
         "Merumuskan Masalah",
         "Merumuskan Hipotesis",
         "Mengumpulkan Data",
         "Menguji Hipotesis",
         "Merumuskan Kesimpulan"
      ],
      "Pembelajaran Penemuan (Discovery Learning)": [
         "Pemberian Rangsangan (Stimulation)",
         "Identifikasi Masalah (Problem Statement)",
         "Pengumpulan Data (Data Collection)",
         "Pengolahan Data (Data Processing)",
         "Pembuktian (Verification)",
         "Menarik Kesimpulan (Generalization)"
      ],
      "Pembelajaran Kooperatif (Cooperative Learning)": [
         "Menyampaikan Tujuan dan Memotivasi Siswa",
         "Menyajikan Informasi",
         "Mengorganisasikan Siswa ke dalam Kelompok Belajar",
         "Membimbing Kelompok Bekerja dan Belajar",
         "Evaluasi",
         "Memberikan Penghargaan"
      ],
      "Pembelajaran Diferensiasi (Differentiated Learning)": [
         "Diferensiasi Konten (Materi)",
         "Diferensiasi Proses (Kegiatan)",
         "Diferensiasi Produk (Hasil Karya)"
      ]
   };

   // Get the syntax for the selected practice, default to PBL if not found
   const selectedSyntax = PEDAGOGICAL_SYNTAX[data.pedagogicalPractice] || PEDAGOGICAL_SYNTAX["Pembelajaran Berbasis Masalah (Problem-Based Learning)"];
   const syntaxList = selectedSyntax.map(s => `- ${s}`).join('\\n                        ');

   const DIMENSION_DESCRIPTIONS = {
      "Keimanan dan Ketakwaan terhadap Tuhan YME": "Membentuk karakter dengan landasan spiritual yang kuat dan akhlak mulia.",
      "Kewargaan": "Membentuk siswa menjadi warga negara yang cinta tanah air, menghargai keberagaman, dan berkontribusi sosial.",
      "Penalaran Kritis": "Kemampuan berpikir logis, analitis, dan reflektif untuk memproses informasi.",
      "Kreativitas": "Mampu berpikir inovatif, orisinal, dan fleksibel dalam menciptakan solusi.",
      "Kolaborasi": "Kemampuan bekerja sama dan gotong royong mencapai tujuan bersama.",
      "Kemandirian": "Bertanggung jawab atas proses belajar sendiri dan mengambil inisiatif.",
      "Kesehatan": "Memiliki fisik prima, bugar, dan keseimbangan kesehatan mental.",
      "Komunikasi": "Mampu menyampaikan ide dan berinteraksi secara efektif."
   };

   // Fallback for legacy data or if specific dimensions aren't selected
   const selectedDimensions = data.profilPelajarPancasila || data.deepLearningDimensions || [];
   const selectedDimensionsDesc = selectedDimensions.map(d => `${d}: ${DIMENSION_DESCRIPTIONS[d] || ''}`).join('\n             // ');

   try {
      const prompt = `
       Bertindaklah sebagai ahli kurikulum dan guru profesional. Buatkan Modul Ajar Standar Kurikulum Merdeka.
       
       Output HARUS berupa format JSON valid tanpa markdown formatting (seperti \`\`\`json). 
       Struktur JSON harus SEPERSIS berikut ini:
 
       {
         "informasiUmum": {
           "identitas": {
             "namaPenyusun": "${data.teacherName}",
             "satuanPendidikan": "SMK Kartanegara Wates",
             "tahunPenyusunan": "${new Date().getFullYear()}",
             "mataPelajaran": "${data.subject}",
             "kelas": "${data.grade}",
             "semester": "${data.semester}",
             "materi": "${data.topic}",
             "alokasiWaktu": "${parseInt(data.duration) * parseInt(data.hoursPerMeeting) * parseInt(data.meetings)} Menit (${data.hoursPerMeeting} JP x ${data.duration} Menit x ${data.meetings} Pertemuan)",
             "jumlahPertemuan": "${data.meetings} Pertemuan",
             "jamPerPertemuan": "${data.hoursPerMeeting}",
             "targetPesertaDidik": "${data.studentCharacteristics || 'Reguler'}"
           },
           "kompetensiAwal": "Deskripsi kompetensi awal...",
           "kompetensiSosialEmosional": [
             // PERINTAH PENTING:
             // Hubungkan KSE ini dengan topik "${data.topic}".
             // Contoh: Jika topik adalah "Statistika", Kesadaran Diri bisa berupa "Siswa menyadari pentingnya kejujuran data".
             { "kompetensi": "Kesadaran Diri", "deskripsi": "Deskripsi yang MENGAITKAN kompetensi ini dengan topik pembelajaran..." },
             { "kompetensi": "Manajemen Diri", "deskripsi": "..." },
             { "kompetensi": "Kesadaran Sosial", "deskripsi": "..." },
             { "kompetensi": "Keterampilan Berelasi", "deskripsi": "..." },
             { "kompetensi": "Pengambilan Keputusan yang Bertanggung Jawab", "deskripsi": "..." }
           ],
           "profilPelajarPancasila": [
             // PERINTAH PENTING:
             // Gunakan deskripsi berikut untuk dimensi yang dipilih:
             // ${selectedDimensionsDesc}
             //
             // Format output:
             { "dimensi": "Nama Dimensi Terpilih", "deskripsi": "Deskripsi SESUAI MENURUT INPUT DI ATAS." }
           ],
           "pemetaanKebutuhanBelajar": {
             "identifikasi": "Dilakukan melalui Tes Tertulis (pengetahuan awal tentang ...) dan observasi.",
             "hasilPemetaan": [
               "1. Kesiapan belajar:",
               "   a. Peserta didik yang sudah memahami...",
               "   b. Peserta didik yang belum memahami...",
               "   c. Minat peserta didik: Berbeda-beda (diferensiasi konten dan produk akan diterapkan)",
               "2. Minat peserta didik: Berbeda-beda (diferensiasi konten dan produk akan diterapkan)"
             ]
           },
           "saranaPrasarana": {
              "media": ["PPT", "Video", ...],
              "alat": ["Laptop", "Proyektor", ...],
              "sumberBelajar": ["Buku Paket", "Internet", ...],
              "catatanTambahan": "${data.saranaPrasarana || ''}"
           },
           "modelPembelajaran": {
              "moda": "Tatap Muka",
              "pendekatan": "${data.approach || 'Saintifik'}",
              "model": "${data.pedagogicalPractice || 'PBL'}",
              "metode": "Diskusi, tanya jawab..."
           }
         },
         "kompetensiInti": {
            "faseCP": "${data.grade.includes('Fase E') ? 'E' : 'F'}",
            "elemen": "${data.element || '-'}",
            "capaianPembelajaran": "${data.learningOutcome || 'Capaian Pembelajaran belum diisi'}",
            "materiPembelajaran": "${data.topic}",
            "kompetensi": "Kompetensi (skills/attitude) yang akan dicapai dalam modul ini...",
            "tujuanPembelajaran": {
               "tujuan": [
                  // Ubah input user menjadi array string TANPA NOMOR.
                  // Contoh: ["Peserta didik dapat menganalisis...", "Peserta didik mampu menjelaskan..."]
                  // Input User: ${data.learningGoals || 'Tujuan belum diisi'}
               ],
               "pendahuluan": "Melalui kegiatan pembelajaran menggunakan model ... diharapkan peserta didik dapat:"
            },
            "pemahamanBermakna": "...",
            "pertanyaanPemantik": ["..."],
            "persiapanPembelajaran": [
               // PERINTAH PENTING:
               // Buatlah daftar persiapan pembelajaran yang spesifik untuk topik "${data.topic}".
               // Contoh: "Guru menyiapkan slide presentasi tentang...", "Guru menyusun lembar kerja..."
               "Langkah persiapan 1...",
               "Langkah persiapan 2..."
            ],
            "rincianKegiatanPembelajaran": [
               // PERINTAH PENTING:
               // Buatkan rincian kegiatan untuk ${data.meetings} kali pertemuan.
               // Total durasi setiap pertemuan WAJIB sama dengan: ${parseInt(data.duration) * parseInt(data.hoursPerMeeting)} Menit.
               // (Perhitungan: ${data.hoursPerMeeting} JP x ${data.duration} Menit/JP = ${parseInt(data.duration) * parseInt(data.hoursPerMeeting)} Menit).
               //
               // Distribusikan waktu tersebut secara logis (misal: Pendahuluan 10-15%, Inti 70-80%, Penutup 10-15%).
               // PASTIKAN JIKA DIJUMLAHKAN (Pendahuluan + Inti + Penutup) HASILNYA TEPAT ${parseInt(data.duration) * parseInt(data.hoursPerMeeting)} MENIT.
               //
               // PENTING: Kegiatan Pendahuluan WAJIB memuat 3 poin utama dengan deskripsi yang DETAIL dan PANJANG:
               // 1. Pembukaan dan Pengkondisian (Jelaskan secara spesifik aktivitas yang dilakukan)
               // 2. Apersepsi (Sebutkan pertanyaan pemantik atau kaitan spesifik yang dibahas)
               // 3. Motivasi (Jelaskan gambaran manfaat atau tujuan yang disampaikan kepada siswa)
               //
               // Contoh format per pertemuan:
               /*
               {
                 "pertemuanKe": 1,
                 "pendahuluan": { 
                    "durasi": "10 Menit", 
                    "deskripsi": [
                      "Pembukaan dan Pengkondisian: Guru memasuki kelas memberikan salam dengan hangat, mengajak siswa berdoa dipimpin oleh ketua kelas, kemudian memeriksa kehadiran dan kesiapan fisik serta psikis siswa untuk mengikuti pembelajaran...",
                      "Apersepsi: Guru mengaitkan materi pembelajaran sebelumnya tentang X dengan materi hari ini dengan mengajukan pertanyaan: 'Bagaimana menurut kalian jika...', untuk memancing ingatan dan keterlibatan siswa sejak awal...",
                      "Motivasi: Guru menyampaikan tujuan pembelajaran dan manfaatnya dalam kehidupan sehari-hari, misalnya bagaimana konsep ini diterapkan dalam dunia kerja, serta memberikan gambaran aktivitas menarik yang akan dilakukan hari ini..."
                    ] 
                 },
                 "inti": {
                    "durasi": "60 Menit",
                    "tahapan": [
                        // WAJIB GUNAKAN SINTAKS BERIKUT SECARA BERURUTAN (JANGAN MENGARANG SINTAKS LAIN):
                        // ${syntaxList}
                        //
                        // BERIKAN DESKRIPSI YANG PANJANG DAN MENDETAIL UNTUK SETIAP LANGKAH.
                        // Jelaskan apa yang dilakukan Guru dan apa yang dilakukan Siswa secara spesifik.
                        //
                        { 
                          "tahap": "Nama Tahap (Sesuai Sintaks)", 
                          "deskripsi": [
                            "Guru menyajikan masalah nyata kepada peserta didik melalui tayangan video atau artikel berita yang relevan dengan materi...", 
                            "Peserta didik mengamati dan mencatat poin-poin penting dari masalah yang disajikan, kemudian mengajukan pertanyaan terkait hal yang belum dipahami..."
                          ] 
                        }
                    ]
                 },
                 "penutup": { "durasi": "10 Menit", "deskripsi": ["Refleksi...", "Doa penutup"] }
               }
               */
            ],
            "asesmen": {
               "jenis": ["Formatif", "Sumatif"],
               "teknik": "Observasi, Tes Tulis",

               "awal": {
                    "keteranganPenilaian": "Gunakan kalimat lengkap yang menjelaskan tujuan asesmen ini dalam konteks materi ${data.topic} (Misal: Asesmen Diagnostik Kognitif untuk mengetahui pemahaman awal tentang...)",
                    "teknik": "${data.initialAssessment || 'Asesmen Diagnostik'}",
                    "bentukInstrumen": "Sesuaikan dengan teknik (misal: Tes Lisan, Lembar Checklist, dsb)",
                    "instrumen": [
                        // PERINTAH: Buatkan 3-5 butir pertanyaan atau indikator checklist yang sesuai dengan teknik "${data.initialAssessment}" dan topik "${data.topic}".
                    ],
                    "pedoman": "Buatkan pedoman penilaian atau rubrik singkat untuk instrumen di atas.",
                    "waktuPelaksanaan": "Misal: 10 Menit di awal kegiatan pendahuluan.",
                    "keterangan": "Jelaskan tujuan spesifik asesmen ini dikaitkan dengan karakteristik siswa dan materi."
                }
            }
         },
         "lampiran": {
            "lkpd": "Konten Markdwon LKPD...",
            "bahanBacaan": "Konten Markdown Bahan Bacaan...",
            "glosarium": "Konten Markdown Glosarium...",
            "daftarPustaka": "Konten Markdown Daftar Pustaka..."
         }
       }
 
       Isi konten dengan detail pendidikan yang sesuai dengan input berikut:
       Topik: ${data.topic}
       Tujuan: ${data.objectives || '-'}
       Karakteristik Siswa: ${data.studentCharacteristics || '-'}
     `;

      const startTime = performance.now();
      const completion = await groq.chat.completions.create({
         messages: [
            {
               role: "user",
               content: prompt
            }
         ],
         model: "llama-3.3-70b-versatile",
         temperature: 0.7,
         max_tokens: 8192,
         response_format: { type: "json_object" }
      });

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      console.log(`Module generation took ${duration}ms`);

      return completion.choices[0]?.message?.content || "Gagal membuat modul.";
   } catch (error) {
      console.error("Error generating standard module with Groq:", error);
      throw error;
   }
};
