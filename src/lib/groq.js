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
      
      Informasi Modul:
      - Sekolah: SMK Kartanegara Wates Kab. Kediri
      - Nama Penyusun: ${data.teacherName}
      - Mata Pelajaran: ${data.subject}
      - Kelas/Fase: ${data.grade}
      - Topik/Materi: ${data.topic}
      - Alokasi Waktu: ${data.duration} (${data.meetings} Pertemuan @ ${data.hoursPerMeeting})
      - Dimensi Profil Lulusan: ${data.deepLearningDimensions && data.deepLearningDimensions.length > 0 ? data.deepLearningDimensions.join(', ') : 'Dipilih otomatis oleh sistem'}
      ${data.objectives ? `- Tujuan Pembelajaran Utama: ${data.objectives}` : ''}
      
      Informasi Tambahan (Jika ada):
      ${data.studentCharacteristics ? `- Karakteristik Peserta Didik: ${data.studentCharacteristics}` : ''}
      ${data.crossDisciplinary ? `- Lintas Disiplin Ilmu: ${data.crossDisciplinary}` : ''}
      ${data.learningEnvironment ? `- Lingkungan Pembelajaran: ${data.learningEnvironment}` : ''}
      ${data.digitalTools ? `- Pemanfaatan Digital: ${data.digitalTools}` : ''}
      ${data.partnerships ? `- Kemitraan: ${data.partnerships}` : ''}

      Struktur Modul Ajar HARUS mencakup:
      1. Informasi Umum (Identitas, Kompetensi Awal, 8 Dimensi Profil Lulusan, Sarana Prasarana, Target Peserta Didik, Model Pembelajaran)
      2. Komponen Inti:
         - Tujuan Pembelajaran
         - Pemahaman Bermakna
         - Pertanyaan Pemantik
         - Kegiatan Pembelajaran (WAJIB dibuatkan detail untuk ${data.meetings} pertemuan, dimana setiap pertemuan terdiri dari ${data.hoursPerMeeting}. Detailkan langkah Pembelajaran Mendalam sesuai 5 Tahap: 
           1. Tahap Stimulasi (Pertanyaan pemantik/studi kasus)
           2. Tahap Eksplorasi (Pengumpulan data/diskusi)
           3. Tahap Elaborasi (Pendalaman/PBL)
           4. Tahap Aplikasi (Pemecahan masalah nyata)
           5. Tahap Refleksi (Evaluasi pembelajaran)) yang dibagi menjadi Pendahuluan, Kegiatan Inti, dan Penutup untuk SETIAP PERTEMUAN.
         - Asesmen (Formatif dan Sumatif) LENGKAP dengan Kriteria/Indikator Penilaian (Rubrik).
         - Pengayaan dan Remedial
      3. Lampiran (PENTING: Buat secara detail, jangan hanya deskripsi)
         - Lembar Kerja Peserta Didik (LKPD): Buatkan contoh soal/aktivitas nyata yang bisa langsung diprint siswa.
         - Bahan Bacaan Guru & Peserta Didik (Sertakan referensi bacaan dari BUKU dan WEBSITE yang relevan)
         - Glosarium
         - Daftar Pustaka
         
      4. Tanda Tangan (Format tabel rata kiri-kanan tanpa garis):
         - Kiri: Mengetahui, Kepala SMK Kartanegara Wates, Pujiono, S.Pd.
         - Kanan: Guru Mata Pelajaran, ${data.teacherName} (dengan tempat dan tanggal saat ini)
         
      Gunakan format Markdown yang rapi. Gunakan heading (#, ##, ###) untuk strukturasi. Berikan tone yang formal namun inspiratif.
      
      PENTING:
      Jika informasi tambahan kosong, gunakan standar umum yang wajar untuk fase tersebut.
      JANGAN MENGARANG detail spesifik (seperti nama siswa, kondisi disabilitas spesifik, atau sarana yang sangat spesifik) KECUALI disebutkan dalam input.
      Fokus pada konten pembelajaran yang universal namun mendalam.
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
            max_tokens: 4096,
        });

        return completion.choices[0]?.message?.content || "Gagal membuat modul.";
    } catch (error) {
        console.error("Error generating module with Groq:", error);
        throw error;
    }
};
