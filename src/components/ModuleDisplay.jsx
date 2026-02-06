import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Copy, ArrowLeft, Printer, FileText, FileDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

const ModuleDisplay = ({ content, onReset }) => {
    const contentRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Guard clause for Markdown legacy content (if any) or null content
    if (!content || typeof content === 'string') {
        return (
            <div className="w-full max-w-4xl mx-auto p-4">
                <div className="bg-red-50 p-4 rounded text-red-600">
                    Format konten tidak didukung atau masih dalam format lama. Mohon generate ulang.
                </div>
                <button onClick={onReset} className="mt-4 px-4 py-2 bg-slate-200 rounded">Kembali</button>
            </div>
        );
    }

    const { informasiUmum, identifikasi, desainPembelajaran, pengalamanBelajar, penutup, rubrik, lampiran } = content;

    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
        const text = contentRef.current?.innerText || '';
        navigator.clipboard.writeText(text);
        alert('Konten (teks) berhasil disalin!');
    };

    const getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                const img = new Image();
                img.onload = () => {
                    resolve({
                        base64: base64data,
                        width: img.width,
                        height: img.height
                    });
                };
                img.src = base64data;
            };
        });
    };


    const getCleanContentHtml = () => {
        if (!contentRef.current) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentRef.current.innerHTML;
        const screenKop = tempDiv.querySelector('#screen-kop');
        if (screenKop) screenKop.remove();
        return tempDiv.innerHTML;
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        setIsDownloading(true);

        try {
            let imgInfo = null;
            try {
                imgInfo = await getBase64FromUrl('/logo%20dan%20kop.png');
            } catch (imgError) {
                console.warn('Gagal memuat gambar kop:', imgError);
            }

            const headerHtml = imgInfo
                ? `<div style="margin-bottom: 20px; text-align: center; width: 100%;">
                     <img src="${imgInfo.base64}" style="width: 100%; height: auto;" />
                   </div>`
                : '';

            const container = document.createElement('div');
            container.className = 'pdf-container';
            container.innerHTML = `
                ${headerHtml}
                <style>
                    ${exportStyles}
                </style>
                <div>${getCleanContentHtml()}</div>
            `;

            const opt = {
                margin: [10, 10],
                filename: `modul-ajar-${informasiUmum?.mataPelajaran || 'deep-learning'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(container).save();
        } catch (error) {
            console.error('PDF Download failed', error);
            alert(`Gagal mengunduh PDF. Error: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadDOCX = async () => {
        if (!contentRef.current) return;
        setIsDownloading(true);
        try {
            let imgInfo = null;
            try {
                imgInfo = await getBase64FromUrl('/logo%20dan%20kop.png');
            } catch (imgError) {
                console.warn('Gagal memuat gambar kop:', imgError);
            }

            let headerHtml = '';
            if (imgInfo) {
                const targetWidth = 650;
                const undoScale = targetWidth / imgInfo.width;
                const targetHeight = Math.round(imgInfo.height * undoScale);

                headerHtml = `<div align="center" style="text-align: center; margin-bottom: 20px;">
                    <img src="${imgInfo.base64}" width="${targetWidth}" height="${targetHeight}" style="width: ${targetWidth}px; height: ${targetHeight}px;" alt="Kop Surat" />
                </div>`;
            }

            // Pre-process HTML to add explicit attributes for Word compatibility
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = getCleanContentHtml();

            // Fix main tables
            const tables = tempDiv.querySelectorAll('table.modul-table');
            tables.forEach(table => {
                table.setAttribute('border', '1');
                table.setAttribute('cellspacing', '0');
                table.setAttribute('cellpadding', '5');
                table.setAttribute('width', '100%');
                // Ensure rows also preserve inline styles if needed
            });

            // Fix nested DPL table to be borderless but structured
            const dplTables = tempDiv.querySelectorAll('table.dpl-table');
            dplTables.forEach(table => {
                table.setAttribute('border', '0');
                table.setAttribute('width', '100%');
                table.style.border = 'none';
                table.querySelectorAll('td').forEach(td => {
                    td.style.border = 'none';
                    td.style.padding = '4px 8px';
                });
            });

            // Fix header table
            const noBorderTables = tempDiv.querySelectorAll('table.no-border-table');
            noBorderTables.forEach(table => {
                table.setAttribute('border', '0');
                table.querySelectorAll('td').forEach(td => {
                    td.style.border = 'none';
                });
            });

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Modul Ajar</title>
                    <style>
                        ${exportStyles}
                        /* Force black borders for printing/word */
                        table { border-color: #000 !important; }
                        td, th { border-color: #000 !important; }
                    </style>
                </head>
                <body>
                    ${headerHtml}
                    ${tempDiv.innerHTML}
                </body>
                </html>
            `;

            const blob = await asBlob(htmlContent);
            saveAs(blob, `modul-ajar-${informasiUmum?.mataPelajaran || 'deep-learning'}.docx`);
        } catch (error) {
            console.error('DOCX Download failed', error);
            alert('Gagal mengunduh DOCX.');
        } finally {
            setIsDownloading(false);
        }
    };

    const exportStyles = `
        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; }
        .modul-table { width: 100%; border-collapse: collapse; border: 1px solid black; margin-bottom: 1.5rem; color: black; font-size: 11pt; font-family: 'Times New Roman', serif; }
        .modul-table td, .modul-table th { border: 1px solid black; padding: 6px; vertical-align: top; }
        .modul-table-header { font-weight: bold; text-align: center; background-color: #f8fafc; }
        .section-title { font-weight: bold; text-align: center; vertical-align: middle; background-color: #fff; }
        .no-border-table { width: 100%; border: none; }
        .no-border-table td { border: none; padding: 2px; vertical-align: top; }
        
        /* Utility replacements for Tailwind */
        .font-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .uppercase { text-transform: uppercase; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-1 { margin-top: 0.25rem; }
        .pb-2 { padding-bottom: 0.5rem; }
        .p-2 { padding: 0.5rem; }
        .w-full { width: 100%; }
        .text-sm { font-size: 10pt; }
        .italic { font-style: italic; }
        .border-b { border-bottom: 1px solid #000; }
        .border-b-2 { border-bottom: 2px solid #000; }
        .list-decimal { list-style-type: decimal; }
        .pl-5 { padding-left: 1.25rem; }
        
        /* Helper for DPL table nested */
        .dpl-table { width: 100%; border: none; }
        .dpl-table td { border: none; padding: 4px; width: 50%; }
        
        /* Grid replacement for manual styling if needed */
        .grid-cols-2 { display: table; width: 100%; }
        .grid-cols-2 > div { display: table-cell; width: 50%; vertical-align: top; padding: 8px; }
        
        /* Signature Spacing */
        .h-24 { height: 100px; }
        .underline { text-decoration: underline; }
    `;

    const TableStyles = () => (
        <style dangerouslySetInnerHTML={{ __html: exportStyles }} />
    );

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-up pb-12 font-serif text-slate-900">
            <div className="flex flex-col md:flex-row items-center justify-between sticky top-4 z-10 p-4 rounded-xl glass-panel mx-4 md:mx-0 gap-4 print:hidden">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Kembali
                </button>

                <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={handleCopy} className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Salin Teks">
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

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl min-h-[500px] print:shadow-none print:p-0">
                <div ref={contentRef}>
                    <TableStyles />

                    <div id="screen-kop" className="mb-8">
                        <img
                            src="/logo%20dan%20kop.png"
                            alt="Kop Surat"
                            className="w-full h-auto"
                        />
                    </div>

                    {/* Header Section */}
                    <div className="mb-6">
                        <h3 className="uppercase font-bold mb-4" style={{ fontSize: '11pt' }}>PERENCANAAN PEMBELAJARAN MENDALAM</h3>
                        <table className="no-border-table mb-4" style={{ maxWidth: '600px' }}>
                            <tbody>
                                <tr><td style={{ width: '200px' }}>SEKOLAH</td><td>: {informasiUmum?.sekolah}</td></tr>
                                <tr><td>NAMA GURU</td><td>: {informasiUmum?.namaPenyusun}</td></tr>
                                <tr><td>MATA PELAJARAN</td><td>: {informasiUmum?.mataPelajaran}</td></tr>
                                <tr><td>KELAS / SEMESTER</td><td>: {informasiUmum?.kelas}</td></tr>
                                <tr><td>ALOKASI WAKTU</td><td>: {informasiUmum?.alokasiWaktu}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Identifikasi Table */}
                    <table className="modul-table">
                        <tbody>
                            <tr>
                                <td rowSpan={1 + (identifikasi?.dpl?.length || 0) + 1} style={{ width: '20%', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                                    IDENTIFIKASI
                                </td>
                                <td style={{ width: '25%', fontWeight: 'bold' }}>Peserta Didik</td>
                                <td colSpan={2}>
                                    <div><strong>{informasiUmum?.pesertaDidik}</strong></div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Materi Pelajaran</td>
                                <td colSpan={2}>
                                    <div>{informasiUmum?.materiPelajaran}</div>
                                </td>
                            </tr>
                            <tr>
                                <td rowSpan={(identifikasi?.dpl?.length || 0) + 1} style={{ fontWeight: 'bold' }}>
                                    Dimensi Profil Lulusan (DPL)
                                </td>
                                <td colSpan={2} className="italic text-sm text-slate-600">
                                    Pilihlah dimensi profil lulusan yang akan dicapai dalam pembelajaran
                                </td>
                            </tr>
                            {/* DPL Rows - Display in 2 columns if possible or simple list */}
                            {identifikasi?.dpl?.length > 0 ? (
                                <tr>
                                    <td colSpan={2}>
                                        <table className="dpl-table">
                                            <tbody>
                                                {Array.from({ length: Math.ceil(identifikasi.dpl.length / 2) }).map((_, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            {identifikasi.dpl[i * 2] && (
                                                                <>
                                                                    <div><strong>{identifikasi.dpl[i * 2].kode || `DPL ${i * 2 + 1}`}</strong></div>
                                                                    <div>{identifikasi.dpl[i * 2].judul || identifikasi.dpl[i * 2]}</div>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {identifikasi.dpl[i * 2 + 1] && (
                                                                <>
                                                                    <div><strong>{identifikasi.dpl[i * 2 + 1].kode || `DPL ${i * 2 + 2}`}</strong></div>
                                                                    <div>{identifikasi.dpl[i * 2 + 1].judul || identifikasi.dpl[i * 2 + 1]}</div>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            ) : (
                                <tr><td colSpan={2}>-</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Desain Pembelajaran Table */}
                    <table className="modul-table">
                        <tbody>
                            <tr>
                                <td rowSpan={8} style={{ width: '20%', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                                    DESAIN<br />PEMBELAJARAN
                                </td>
                                <td style={{ width: '25%', fontWeight: 'bold' }}>Capaian Pembelajaran</td>
                                <td>{desainPembelajaran?.capaianPembelajaran}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Lintas Disiplin Ilmu</td>
                                <td>{desainPembelajaran?.lintasDisiplin}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Tujuan Pembelajaran</td>
                                <td>{desainPembelajaran?.tujuanPembelajaran}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Topik Pembelajaran</td>
                                <td>{desainPembelajaran?.topik}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Praktik Pedagogis</td>
                                <td>{desainPembelajaran?.praktikPedagogis}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Kemitraan Pembelajaran</td>
                                <td>{desainPembelajaran?.kemitraan}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Lingkungan Pembelajaran</td>
                                <td>{desainPembelajaran?.lingkungan}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Pemanfaatan Digital</td>
                                <td>{desainPembelajaran?.digital}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Pengalaman Belajar Table */}
                    <table className="modul-table">
                        <thead>
                            <tr>
                                <th colSpan={3} className="text-left bg-white border-b-2 font-bold p-2">PENGALAMAN BELAJAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Pendahuluan */}
                            <tr>
                                <td rowSpan={1} style={{ width: '20%', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>
                                    PENGALAMAN<br />BELAJAR
                                </td>
                                <td colSpan={2}>
                                    <div className="font-bold mb-2">AWAL ({pengalamanBelajar?.pendahuluan?.prinsip})</div>
                                    <div>{pengalamanBelajar?.pendahuluan?.deskripsi}</div>
                                </td>
                            </tr>

                            {/* Inti Header */}
                            <tr>
                                <td style={{ width: '20%' }}></td>
                                <td colSpan={2} style={{ fontWeight: 'bold' }}>INTI</td>
                            </tr>

                            {/* Memahami */}
                            <tr>
                                <td rowSpan={3}></td>
                                <td colSpan={2}>
                                    <div className="font-bold border-b pb-2 mb-2 italic">Memahami ({pengalamanBelajar?.inti?.memahami?.prinsip})</div>
                                    <ul className="list-decimal pl-5">
                                        {pengalamanBelajar?.inti?.memahami?.kegiatan?.map((k, i) => (
                                            <li key={i}>{k.replace(/^\d+\.\s*/, '')}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>

                            {/* Mengaplikasi */}
                            <tr>
                                <td colSpan={2}>
                                    <div className="font-bold border-b pb-2 mb-2 italic">Mengaplikasi ({pengalamanBelajar?.inti?.mengaplikasi?.prinsip})</div>
                                    <ul className="list-decimal pl-5">
                                        {pengalamanBelajar?.inti?.mengaplikasi?.kegiatan?.map((k, i) => (
                                            <li key={i}>{k.replace(/^\d+\.\s*/, '')}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>

                            {/* Merefleksi */}
                            <tr>
                                <td colSpan={2}>
                                    <div className="font-bold border-b pb-2 mb-2 italic">Merefleksi ({pengalamanBelajar?.inti?.merefleksi?.prinsip})</div>
                                    <ul className="list-decimal pl-5">
                                        {pengalamanBelajar?.inti?.merefleksi?.kegiatan?.map((k, i) => (
                                            <li key={i}>{k.replace(/^\d+\.\s*/, '')}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Penutup and Asesmen Table */}
                    <table className="modul-table">
                        <tbody>
                            <tr>
                                <td rowSpan={4} style={{ width: '20%', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                                    ASESMEN<br />PEMBELAJARAN
                                </td>
                                <td colSpan={2}>
                                    <div className="font-bold mb-1">PENUTUP ({penutup?.prinsip})</div>
                                    <div className="text-sm italic mb-2">{penutup?.deskripsi}</div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ width: '30%' }}>Asesmen pada Awal Pembelajaran</td>
                                <td>{penutup?.asesmen?.awal}</td>
                            </tr>
                            <tr>
                                <td>Asesmen pada Proses Pembelajaran</td>
                                <td>{penutup?.asesmen?.proses}</td>
                            </tr>
                            <tr>
                                <td>Asesmen pada Akhir Pembelajaran</td>
                                <td>{penutup?.asesmen?.akhir}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td colSpan={2} className="italic text-sm">
                                    {penutup?.asesmen?.detail}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Rubrik Table */}
                    <div className="break-inside-avoid">
                        <h3 className="font-bold mb-2">{rubrik?.judul}</h3>
                        <p className="mb-2">Tujuan Pembelajaran: {rubrik?.tujuan}</p>
                        <table className="modul-table text-center">
                            <thead>
                                <tr>
                                    <th style={{ width: '20%' }}>Indikator</th>
                                    <th style={{ width: '20%' }}>Baru Memulai</th>
                                    <th style={{ width: '20%' }}>Berkembang</th>
                                    <th style={{ width: '20%' }}>Cakap</th>
                                    <th style={{ width: '20%' }}>Mahir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rubrik?.indikator?.length > 0 ? rubrik.indikator.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.aspek}</td>
                                        <td>{row.baruBerkembang || '-'}</td>
                                        <td>{row.layak || '-'}</td>
                                        <td>{row.cakap || '-'}</td>
                                        <td>{row.mahir || '-'}</td>
                                    </tr>
                                )) : (
                                    <>
                                        <tr><td className="h-16"></td><td></td><td></td><td></td><td></td></tr>
                                        <tr><td className="h-16"></td><td></td><td></td><td></td><td></td></tr>
                                        <tr><td className="h-16"></td><td></td><td></td><td></td><td></td></tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                        {rubrik?.keterangan && (
                            <div className="text-sm">
                                <strong>Keterangan:</strong>
                                <ul className="list-disc ml-5">
                                    {rubrik.keterangan.map((ket, i) => (
                                        <li key={i}>{ket}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Lampiran Section */}
                    {lampiran && (
                        <div className="mt-8 page-break-before">
                            <h3 className="font-bold text-lg border-b-2 border-black mb-4 pb-2">LAMPIRAN</h3>

                            <div className="mb-6">
                                <h4 className="font-bold mb-2">1. Lembar Kerja Peserta Didik (LKPD)</h4>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{lampiran.lkpd}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-bold mb-2">2. Bahan Bacaan Guru & Peserta Didik</h4>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{lampiran.bahanBacaan}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-bold mb-2">3. Glosarium</h4>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{lampiran.glosarium}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-bold mb-2">4. Daftar Pustaka</h4>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{lampiran.daftarPustaka}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Signature Section */}
                    <div className="mt-12 break-inside-avoid">
                        <table className="no-border-table text-center" style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '50%' }}>
                                        <div>Mengetahui,</div>
                                        <div>Kepala SMK Kartanegara Wates</div>
                                        <div className="h-24"></div>
                                        <div className="font-bold underline">Pujiono, S.Pd.</div>
                                    </td>
                                    <td style={{ width: '50%' }}>
                                        <div>Wates, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        <div>Guru Mata Pelajaran</div>
                                        <div className="h-24"></div>
                                        <div className="font-bold underline">{informasiUmum?.namaPenyusun}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModuleDisplay;
