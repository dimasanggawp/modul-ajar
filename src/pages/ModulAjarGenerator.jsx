import React, { useState } from 'react';
import ModulAjarForm from '../components/ModulAjarForm';
import ModulAjarDisplay from '../components/ModulAjarDisplay';
import { generateStandardModule } from '../lib/groq';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function ModulAjarGenerator() {
    const [moduleContent, setModuleContent] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [savedFormData, setSavedFormData] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async (formData) => {
        setIsGenerating(true);
        setSavedFormData(formData);
        setError(null);
        try {
            const content = await generateStandardModule(formData);

            let parsedContent;
            if (typeof content === 'string') {
                // Remove markdown code blocks if present
                const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedContent = JSON.parse(cleanContent);
            } else {
                parsedContent = content;
            }

            setModuleContent(parsedContent);
        } catch (err) {
            console.error('Generation Error:', err);
            let errorMessage = 'Gagal membuat modul ajar. ';
            if (err instanceof SyntaxError) {
                errorMessage += 'AI memberikan format data yang tidak valid. Silakan coba lagi.';
            } else if (err.message) {
                errorMessage += `Detail: ${err.message}`;
            } else {
                errorMessage += 'Terjadi kesalahan tidak terduga.';
            }
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setModuleContent(null);
        setSavedFormData(null);
        setError(null);
    };

    const handleEdit = () => {
        setModuleContent(null);
        setError(null);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-emerald-600/20 to-teal-600/20 -skew-y-6 transform origin-top-left z-0 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl z-0 pointer-events-none" />
            <div className="absolute top-1/2 -left-24 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl z-0 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8">
                <header className="flex items-center justify-center gap-3 mb-12 relative">
                    <Link to="/" className="absolute left-0 flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <div className="bg-white p-2 rounded-xl shadow-lg text-emerald-600">
                        <BookOpen size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                        Generator Modul Ajar
                    </h1>
                </header>

                <main className="w-full">
                    {error && (
                        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-fade-in flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    {!moduleContent ? (
                        <ModulAjarForm onGenerate={handleGenerate} isGenerating={isGenerating} initialData={savedFormData} />
                    ) : (
                        <ModulAjarDisplay content={moduleContent} onReset={handleReset} onEdit={handleEdit} />
                    )}
                </main>

                <footer className="mt-16 text-center text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} Generator Modul Ajar Kurikulum Merdeka
                </footer>
            </div>
        </div>
    );
}

export default ModulAjarGenerator;
