import Groq from "groq-sdk";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
   apiKey: API_KEY,
   dangerouslyAllowBrowser: true // Required for client-side usage
});

export const generateModule = async (data) => {
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
          "alokasiWaktu": "${data.duration} (${data.meetings} Pertemuan @ ${data.hoursPerMeeting})",
          "pesertaDidik": "${data.studentCharacteristics || 'Reguler/Tipikal'}",
          "materiPelajaran": "${data.topic}",
          "dimensiProfil": ${JSON.stringify(data.deepLearningDimensions || [])}
        },
        "identifikasi": {
           "dpl": [
             // HARUS persis sesuai dengan yang dipilih user di informasiUmum.dimensiProfil
             // Jangan menambah atau mengurangi dimensi selain yang dipilih.
             // Format: { "kode": "DPL X", "judul": "Nama Dimensi (Sesuai Input)", "deskripsi": "Deskripsi singkat..." }
           ]
        },
        "desainPembelajaran": {
           "capaianPembelajaran": "Tuliskan capaian pembelajaran sesuai fase",
           "lintasDisiplin": "${data.crossDisciplinary || '-'}",
           "tujuanPembelajaran": "${data.objectives || 'Rumuskan kompetensi yang diharapkan...'}",
           "topik": "${data.topic}",
           "praktikPedagogis": "Model/Strategi/Metode yang ditentukan (misal PjBL/PBL) untuk mencapai tujuan...",
           "kemitraan": "${data.partnerships || '-'}",
           "lingkungan": "${data.learningEnvironment || '-'}",
           "digital": "${data.digitalTools || '-'}"
        },
        "pengalamanBelajar": {
           "pendahuluan": {
              "prinsip": "Berkesadaran, Bermakna, Menggembirakan",
              "deskripsi": "Deskripsi kegiatan pembuka..."
           },
           "inti": { 
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
           }
        },
        "penutup": {
           "prinsip": "Berkesadaran, Bermakna, Menggembirakan",
           "deskripsi": "Tahap akhir proses pembelajaran...",
           "asesmen": {
              "awal": "Asesmen pada Awal Pembelajaran...",
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
