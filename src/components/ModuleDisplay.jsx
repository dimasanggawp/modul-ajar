import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Copy, ArrowLeft, Printer, FileText, FileDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

const ModuleDisplay = ({ content, onReset }) => {
    const contentRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        alert('Konten berhasil disalin!');
    };

    const getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                // Create an image to get dimensions
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

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        setIsDownloading(true);

        try {
            let imgInfo = null;
            try {
                // Use encoded URL to handle spaces safely
                imgInfo = await getBase64FromUrl('/logo%20dan%20kop.png');
            } catch (imgError) {
                console.warn('Gagal memuat gambar kop:', imgError);
            }

            const headerHtml = imgInfo
                ? `<div style="margin-bottom: 20px; text-align: center; width: 100%;">
                     <img src="${imgInfo.base64}" style="width: 100%; height: auto;" />
                   </div>`
                : '';

            // Create a temporary container
            const container = document.createElement('div');
            container.innerHTML = `
                ${headerHtml}
                <div>${contentRef.current.innerHTML}</div>
            `;

            const opt = {
                margin: [10, 10],
                filename: 'modul-ajar-deep-learning.pdf',
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
                // Calculate scaled height to preserve aspect ratio at 650px width
                const targetWidth = 650;
                const undoScale = targetWidth / imgInfo.width;
                const targetHeight = Math.round(imgInfo.height * undoScale);

                headerHtml = `<div align="center" style="text-align: center; margin-bottom: 20px;">
                    <img src="${imgInfo.base64}" width="${targetWidth}" height="${targetHeight}" style="width: ${targetWidth}px; height: ${targetHeight}px;" alt="Kop Surat" />
                </div>`;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Modul Ajar</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; }
                        h1, h2, h3 { color: #000; }
                        ul, ol { padding-left: 20px; }
                        p { margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; }
                        td, th { border: 1px solid #000; padding: 5px; }
                        .header { text-align: center; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    ${headerHtml}
                    ${contentRef.current.innerHTML}
                </body>
                </html>
            `;

            const blob = await asBlob(htmlContent);
            saveAs(blob, 'modul-ajar-deep-learning.docx');
        } catch (error) {
            console.error('DOCX Download failed', error);
            alert('Gagal mengunduh DOCX.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-up pb-12">
            <div className="flex flex-col md:flex-row items-center justify-between sticky top-4 z-10 p-4 rounded-xl glass-panel mx-4 md:mx-0 gap-4">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Kembali
                </button>

                <div className="flex flex-wrap gap-2 justify-center">
                    <button
                        onClick={handleCopy}
                        className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Salin Teks"
                    >
                        <Copy size={20} />
                    </button>
                    <button
                        onClick={handleDownloadDOCX}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        title="Download Word (DOCX)"
                    >
                        <FileText size={18} />
                        <span className="hidden sm:inline">Word</span>
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50"
                        title="Download PDF"
                    >
                        <FileDown size={18} />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20"
                    >
                        <Printer size={18} />
                        <span className="hidden sm:inline">Cetak</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl min-h-[500px] print:shadow-none print:p-0">
                <article ref={contentRef} className="prose prose-slate max-w-none prose-headings:text-primary-800 prose-a:text-primary-600">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </article>
            </div>
        </div>
    );
};

export default ModuleDisplay;
