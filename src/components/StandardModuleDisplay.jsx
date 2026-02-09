import React, { useRef, useState, useEffect, Component } from 'react';
import { RotateCcw, ArrowLeft, Copy, Printer, FileText, FileDown, AlertTriangle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';

// --- Error Boundary Component ---
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("StandardModuleDisplay Validation Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full max-w-4xl mx-auto p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200 mt-8">
                    <AlertTriangle size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Terjadi Kesalahan Tampilan</h3>
                    <p className="mb-4">Data modul berhasil dibuat, namun gagal ditampilkan.</p>
                    <details className="text-xs text-left bg-white p-4 rounded border mb-4 font-mono overflow-auto max-h-40">
                        {this.state.error?.toString()}
                    </details>
                    <div className="flex justify-center gap-4">
                        <button onClick={this.props.onReset} className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 text-slate-700">
                            Kembali ke Form (Reset)
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- Main Display Component ---
const ModuleView = ({ content, onReset, onEdit }) => {
    const contentRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (content) {
            console.log("Module Content Loaded:", content);
        }
    }, [content]);

    if (!content) return null;

    // Defensive Destructuring (Very Safe)
    const informasiUmum = content?.informasiUmum || {};
    const kompetensiInti = content?.kompetensiInti || {};
    const lampiran = content?.lampiran || {};

    // Fix: Read correctly from the nested identitas object provided by generateStandardModule
    const rawIdentitas = informasiUmum?.identitas || {};

    const identitas = {
        namaPenyusun: rawIdentitas?.namaPenyusun || '-',
        satuanPendidikan: rawIdentitas?.satuanPendidikan || 'SMK Kartanegara Wates Kab. Kediri',
        tahunPenyusunan: rawIdentitas?.tahunPenyusunan || new Date().getFullYear(),
        mataPelajaran: rawIdentitas?.mataPelajaran || '-',
        kelas: rawIdentitas?.kelas || '-',
        semester: rawIdentitas?.semester || 'Ganjil',
        materi: rawIdentitas?.materi || informasiUmum?.topik || '-',
        alokasiWaktu: rawIdentitas?.alokasiWaktu || '-',
        jumlahPertemuan: rawIdentitas?.jumlahPertemuan || '-',
        jamPerPertemuan: rawIdentitas?.jamPerPertemuan || '-'
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
        const text = contentRef.current?.innerText || '';
        navigator.clipboard.writeText(text);
        alert('Konten (teks) berhasil disalin!');
    };

    const handleDownloadPDF = async () => {
        const element = contentRef.current;
        if (!element) return;

        setIsDownloading(true);
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Modul_Ajar_Standar_${identitas?.mataPelajaran || 'Mapel'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const originalStyle = element.getAttribute('style');
        element.style.width = '100%';

        const style = document.createElement('style');
        style.innerHTML = `
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 11pt; }
            th, td { border: 1px solid #000; padding: 6px; vertical-align: top; }
            th { background-color: #a0c4ff; font-weight: bold; text-align: left; }
            .blue-header { background-color: #a0c4ff !important; font-weight: bold; -webkit-print-color-adjust: exact; }
            h2, h3, h4 { margin-top: 15px; margin-bottom: 10px; font-family: Arial, sans-serif; }
            ul, ol { margin-top: 0; margin-bottom: 0; padding-left: 20px; }
            .text-center { text-align: center; }
            .text-bold { font-weight: bold; }
            .no-border { border: none !important; }
        `;
        element.appendChild(style);

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Gagal mengunduh PDF.');
        } finally {
            element.setAttribute('style', originalStyle || '');
            if (style.parentNode) element.removeChild(style);
            setIsDownloading(false);
        }
    };

    const handleDownloadDOCX = async () => {
        if (!contentRef.current) return;

        const contentHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11pt; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    td, th { border: 1px solid #000; padding: 6px; vertical-align: top; }
                    .blue-header { background-color: #a0c4ff; font-weight: bold; }
                    h2, h3, h4 { margin-top: 15pt; margin-bottom: 10pt; }
                </style>
            </head>
            <body>
                ${contentRef.current.innerHTML}
            </body>
            </html>
        `;

        setIsDownloading(true);
        try {
            const blob = await asBlob(contentHtml);
            saveAs(blob, `Modul_Ajar_Standar_${identitas?.mataPelajaran || 'Mapel'}.docx`);
        } catch (error) {
            console.error('Error creating DOCX:', error);
            alert('Gagal membuat file Word.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Helper to safely render lists
    const renderList = (items) => {
        if (Array.isArray(items)) {
            return items.map((item, i) => <li key={i}>{item}</li>);
        }
        if (typeof items === 'string') {
            return <li>{items}</li>;
        }
        return <li>-</li>;
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-up pb-12 font-sans text-slate-900">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between sticky top-4 z-10 p-4 rounded-xl glass-panel mx-4 md:mx-0 gap-4 print:hidden bg-white/80 backdrop-blur-md shadow-lg border border-white/20">
                <button
                    onClick={onEdit || onReset}
                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Kembali
                </button>

                <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={handleCopy} className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Salin Teks">
                        <Copy size={20} />
                    </button>
                    <button onClick={handleDownloadDOCX} disabled={isDownloading} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50">
                        <FileText size={18} /> <span className="hidden sm:inline">Word</span>
                    </button>
                    <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50">
                        <FileDown size={18} /> <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20">
                        <Printer size={18} /> <span className="hidden sm:inline">Cetak</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl min-h-[500px]" ref={contentRef}>
                {/* Kop Surat */}
                <img src="/logo dan kop.png" alt="Kop Surat" className="w-full mb-6" />

                {/* Header Document */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold uppercase">MODUL AJAR</h2>
                    <h2 className="text-xl font-bold uppercase">MATERI {identitas?.materi || '...'}</h2>
                </div>

                {/* A. KOMPONEN UMUM */}
                <h3 className="font-bold text-lg mb-4">A. KOMPONEN UMUM</h3>

                {/* Identitas Table */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th colSpan="2" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">IDENTITAS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 font-bold w-[30%]">Nama Penyusun</td>
                            <td className="border border-black p-2">{identitas?.namaPenyusun || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Satuan Pendidikan</td>
                            <td className="border border-black p-2">{identitas?.satuanPendidikan || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Tahun Penyusunan</td>
                            <td className="border border-black p-2">{identitas?.tahunPenyusunan || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Mata Pelajaran</td>
                            <td className="border border-black p-2">{identitas?.mataPelajaran || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Kelas / Semester</td>
                            <td className="border border-black p-2">{identitas?.kelas} / {identitas?.semester || 'Ganjil'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Topik / Materi</td>
                            <td className="border border-black p-2">{identitas?.materi || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Alokasi Waktu</td>
                            <td className="border border-black p-2">{identitas?.alokasiWaktu || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Jumlah Pertemuan</td>
                            <td className="border border-black p-2">{identitas?.jumlahPertemuan || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">JP per Pertemuan</td>
                            <td className="border border-black p-2">{identitas?.jamPerPertemuan || '-'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Kompetensi Awal */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">KOMPETENSI AWAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 text-justify">
                                {informasiUmum?.kompetensiAwal || '-'}
                            </td>
                        </tr>
                    </tbody>
                </table>



                {/* Profil Pelajar Pancasila */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th colSpan="2" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">PROFIL PELAJAR PANCASILA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(informasiUmum?.profilPelajarPancasila) && informasiUmum.profilPelajarPancasila.length > 0 ? (
                            typeof informasiUmum.profilPelajarPancasila[0] === 'object' ? (
                                // New Object Format
                                informasiUmum.profilPelajarPancasila.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-2 font-bold w-[30%] text-justify">{item?.dimensi || '-'}</td>
                                        <td className="border border-black p-2 text-justify">{item?.deskripsi || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                // Old String Array Format
                                <tr>
                                    <td className="border border-black p-2" colSpan="2">
                                        <ul className="list-disc pl-5">
                                            {renderList(informasiUmum.profilPelajarPancasila)}
                                        </ul>
                                    </td>
                                </tr>
                            )
                        ) : (
                            <tr>
                                <td className="border border-black p-2" colSpan="2">-</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pemetaan Kebutuhan Belajar */}
                {/* Pemetaan Kebutuhan Belajar */}
                {informasiUmum?.pemetaanKebutuhanBelajar && (
                    <table className="w-full border-collapse border border-black mb-6">
                        <thead>
                            <tr>
                                <th colSpan="3" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">PEMETAAN KEBUTUHAN BELAJAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* New Format (Object with identifikasi & hasilPemetaan) */}
                            {!Array.isArray(informasiUmum.pemetaanKebutuhanBelajar) ? (
                                <>
                                    <tr>
                                        <td className="border border-black p-2 bg-blue-100" colSpan="3">
                                            {informasiUmum.pemetaanKebutuhanBelajar.identifikasi || 'Identifikasi kebutuhan belajar...'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2" colSpan="3">
                                            <p className="mb-2">Dari hasil tes tertulis dan observasi yang dilakukan, guru dapat mengetahui :</p>
                                            <ul className="list-none pl-2">
                                                {renderList(informasiUmum.pemetaanKebutuhanBelajar.hasilPemetaan)}
                                            </ul>
                                        </td>
                                    </tr>
                                </>
                            ) : (
                                /* Fallback / Old Array Format */
                                <>
                                    <tr>
                                        <th className="border border-black p-2 bg-slate-100 text-center font-bold">Kesiapan Belajar / Minat / Profil</th>
                                        <th className="border border-black p-2 bg-slate-100 text-center font-bold">Deskripsi Siswa</th>
                                        <th className="border border-black p-2 bg-slate-100 text-center font-bold">Strategi Diferensiasi</th>
                                    </tr>
                                    {informasiUmum.pemetaanKebutuhanBelajar.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="border border-black p-2 font-bold">{item?.kategori || '-'}</td>
                                            <td className="border border-black p-2">{item?.deskripsi || '-'}</td>
                                            <td className="border border-black p-2">{item?.strategi || '-'}</td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Kompetensi Sosial dan Emosional */}
                {Array.isArray(informasiUmum?.kompetensiSosialEmosional) && informasiUmum.kompetensiSosialEmosional.length > 0 && (
                    <table className="w-full border-collapse border border-black mb-6">
                        <thead>
                            <tr>
                                <th colSpan="2" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">KOMPETENSI SOSIAL DAN EMOSIONAL (KSE)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {informasiUmum.kompetensiSosialEmosional.map((kse, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black p-2 font-bold w-[30%]">{kse?.kompetensi || '-'}</td>
                                    <td className="border border-black p-2">{kse?.deskripsi || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Sarana Prasarana & Target */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th colSpan="2" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">SARANA DAN PRASARANA</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 font-bold w-[30%]">Sarana & Prasarana</td>
                            <td className="border border-black p-2">
                                <p className="mb-1"><strong>Media:</strong> {Array.isArray(informasiUmum?.saranaPrasarana?.media) ? informasiUmum.saranaPrasarana.media.join(', ') : (informasiUmum?.saranaPrasarana?.media || '-')}</p>
                                <p className="mb-1"><strong>Alat:</strong> {Array.isArray(informasiUmum?.saranaPrasarana?.alat) ? informasiUmum.saranaPrasarana.alat.join(', ') : (informasiUmum?.saranaPrasarana?.alat || '-')}</p>
                                <p><strong>Sumber Belajar:</strong> {Array.isArray(informasiUmum?.saranaPrasarana?.sumberBelajar) ? informasiUmum.saranaPrasarana.sumberBelajar.join(', ') : (informasiUmum?.saranaPrasarana?.sumberBelajar || '-')}</p>
                            </td>
                        </tr>
                        {/* User Input Sarana Prasarana Check */}
                        {informasiUmum?.saranaPrasarana?.catatanTambahan && (
                            <tr>
                                <td className="border border-black p-2 font-bold">Detail Sarana & Prasarana bagian </td>
                                <td className="border border-black p-2 whitespace-pre-line">{informasiUmum.saranaPrasarana.catatanTambahan}</td>
                            </tr>
                        )}

                    </tbody>
                </table>

                {/* B. KOMPONEN INTI */}
                <h3 className="font-bold text-lg mb-4">B. KOMPONEN INTI</h3>

                {/* Table for Komponen Inti Intro (Moda, Pendekatan, etc) */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th colSpan="2" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">SARANA DAN PRASARANA</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 font-bold w-[30%]">Moda</td>
                            <td className="border border-black p-2">{informasiUmum?.modelPembelajaran?.moda || 'Tatap Muka'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Pendekatan</td>
                            <td className="border border-black p-2">{informasiUmum?.modelPembelajaran?.pendekatan || 'Scientific'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Model Pembelajaran</td>
                            <td className="border border-black p-2">{informasiUmum?.modelPembelajaran?.model || informasiUmum?.modelPembelajaran || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Metode Pembelajaran</td>
                            <td className="border border-black p-2">{informasiUmum?.modelPembelajaran?.metode || '-'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Tujuan Pembelajaran */}
                {/* KOMPETENSI INTI Table */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th colSpan="2" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">KOMPETENSI INTI</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 font-bold w-[30%]">Fase CP</td>
                            <td className="border border-black p-2">{kompetensiInti?.faseCP || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Elemen</td>
                            <td className="border border-black p-2">{kompetensiInti?.elemen || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Capaian Pembelajaran</td>
                            <td className="border border-black p-2 text-justify">{kompetensiInti?.capaianPembelajaran || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Materi Pembelajaran</td>
                            <td className="border border-black p-2">{kompetensiInti?.materiPembelajaran || identitas?.materi || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Kompetensi</td>
                            <td className="border border-black p-2 text-justify">{kompetensiInti?.kompetensi || '-'}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Tujuan Pembelajaran</td>
                            <td className="border border-black p-2 text-justify">
                                <p className="mb-2">{kompetensiInti?.tujuanPembelajaran?.pendahuluan || 'Melalui kegiatan pembelajaran, peserta didik diharapkan dapat:'}</p>
                                <ul className="list-decimal pl-5">
                                    {renderList(Array.isArray(kompetensiInti?.tujuanPembelajaran?.tujuan) ? kompetensiInti.tujuanPembelajaran.tujuan : (Array.isArray(kompetensiInti?.tujuanPembelajaran) ? kompetensiInti.tujuanPembelajaran : []))}
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Pemahaman Bermakna & Pertanyaan Pemantik (Moved out of deleted table) */}
                <div className="mb-6 space-y-4">
                    <div>
                        <h4 className="font-bold underline mb-1">Pemahaman Bermakna:</h4>
                        <p>{kompetensiInti?.pemahamanBermakna || '-'}</p>
                    </div>
                    <div>
                        <h4 className="font-bold underline mb-1">Pertanyaan Pemantik:</h4>
                        <ul className="list-disc pl-5">
                            {renderList(kompetensiInti?.pertanyaanPemantik)}
                        </ul>
                    </div>
                </div>

                {/* Kegiatan Pembelajaran */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th colSpan="3" className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">KEGIATAN PEMBELAJARAN</th>
                        </tr>
                        <tr>
                            <th className="border border-black p-2 bg-slate-100 text-center font-bold" style={{ width: '20%' }}>Tahap</th>
                            <th className="border border-black p-2 bg-slate-100 text-center font-bold">Kegiatan</th>
                            <th className="border border-black p-2 bg-slate-100 text-center font-bold" style={{ width: '15%' }}>Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(kompetensiInti?.kegiatanPembelajaran) && kompetensiInti.kegiatanPembelajaran.length > 0 ? (
                            kompetensiInti.kegiatanPembelajaran.map((kp, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black p-2 font-bold text-center">{kp?.tahap || '-'}</td>
                                    <td className="border border-black p-2">
                                        <ul className="list-disc pl-5">
                                            {renderList(kp?.kegiatan)}
                                        </ul>
                                    </td>
                                    <td className="border border-black p-2 text-center">{kp?.waktu || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center p-4">Tidak ada data kegiatan pembelajaran.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Asesmen */}
                <table className="w-full border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th className="border border-black p-2 bg-blue-200 text-center font-bold blue-header">ASESMEN / PENILAIAN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2">
                                <ul className="list-disc pl-5">
                                    {Array.isArray(kompetensiInti?.asesmen) ? (
                                        kompetensiInti.asesmen.map((as, idx) => (
                                            <li key={idx}><strong>{as?.jenis || 'Jenis'}:</strong> {as?.teknik || '-'} ({as?.instrumen || '-'})</li>
                                        ))
                                    ) : kompetensiInti?.asesmen ? (
                                        <>
                                            <li><strong>Jenis:</strong> {Array.isArray(kompetensiInti.asesmen.jenis) ? kompetensiInti.asesmen.jenis.join(', ') : (kompetensiInti.asesmen.jenis || '-')}</li>
                                            <li><strong>Teknik:</strong> {kompetensiInti.asesmen.teknik || '-'}</li>
                                            {kompetensiInti.asesmen.instrumen && <li><strong>Instrumen:</strong> {kompetensiInti.asesmen.instrumen}</li>}
                                        </>
                                    ) : (
                                        <li>-</li>
                                    )}
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* C. LAMPIRAN */}
                <h3 className="font-bold text-lg mb-4">C. LAMPIRAN</h3>
                <div className="border border-black p-4">
                    <h4 className="font-bold underline mb-2">1. Materi Ajar / Bahan Bacaan</h4>
                    <div className="prose max-w-none mb-6">
                        <ReactMarkdown>{lampiran?.bahanBacaan || '-'}</ReactMarkdown>
                    </div>

                    <h4 className="font-bold underline mb-2">2. Lembar Kerja Peserta Didik (LKPD)</h4>
                    <div className="prose max-w-none mb-6">
                        <ReactMarkdown>{lampiran?.lkpd || '-'}</ReactMarkdown>
                    </div>

                    <h4 className="font-bold underline mb-2">3. Glosarium</h4>
                    <div className="prose max-w-none mb-6">
                        <ReactMarkdown>{lampiran?.glosarium || '-'}</ReactMarkdown>
                    </div>

                    <h4 className="font-bold underline mb-2">4. Daftar Pustaka</h4>
                    <div className="prose max-w-none">
                        <ReactMarkdown>{lampiran?.daftarPustaka || '-'}</ReactMarkdown>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="mt-12 break-inside-avoid">
                    <table className="no-border-table text-center w-full" style={{ width: '100%', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', border: 'none' }}>
                                    <div>Mengetahui,</div>
                                    <div>Kepala Sekolah</div>
                                    <br /><br /><br /><br /><br />
                                    <div className="font-bold underline">_______________________</div>
                                    <div>NIP. .........................</div>
                                </td>
                                <td style={{ width: '50%', border: 'none' }}>
                                    <div>Wates, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    <div>Guru Mata Pelajaran</div>
                                    <br /><br /><br /><br /><br />
                                    <div className="font-bold underline">{identitas?.namaPenyusun || '...'}</div>
                                    <div>NIP. .........................</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Export wrapped with ErrorBoundary
const StandardModuleDisplay = (props) => (
    <ErrorBoundary onReset={props.onReset}>
        <ModuleView {...props} />
    </ErrorBoundary>
);

export default StandardModuleDisplay;
