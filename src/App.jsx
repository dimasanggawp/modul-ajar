import React, { useState } from 'react';
import GeneratorForm from './components/GeneratorForm';
import ModuleDisplay from './components/ModuleDisplay';
import { generateModule } from './lib/groq';
import { BrainCircuit } from 'lucide-react';

function App() {
  const [moduleContent, setModuleContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (formData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const content = await generateModule(formData);
      setModuleContent(content);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Gagal membuat modul ajar. ';
      if (err.message) {
        errorMessage += `Detail: ${err.message}`;
      } else {
        errorMessage += 'Pastikan API Key valid atau coba lagi nanti.';
      }
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setModuleContent(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary-600/20 to-purple-600/20 -skew-y-6 transform origin-top-left z-0 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl z-0 pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl z-0 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex items-center justify-center gap-3 mb-12">
          <div className="bg-white p-2 rounded-xl shadow-lg text-primary-600">
            <BrainCircuit size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            AI Modul Ajar Generator
          </h1>
        </header>

        <main className="w-full">
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-fade-in flex items-center justify-center">
              {error}
            </div>
          )}

          {!moduleContent ? (
            <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          ) : (
            <ModuleDisplay content={moduleContent} onReset={handleReset} />
          )}
        </main>

        <footer className="mt-16 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Generator Modul Ajar Berbasis Pembelajaran Mendalam
        </footer>
      </div>
    </div>
  );
}

export default App;
