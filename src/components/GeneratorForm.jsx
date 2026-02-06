import React, { useState } from 'react';
import { BookOpen, Clock, GraduationCap, Layers, Sparkles, Loader2, Calendar, Target, Award, UserCheck, Lightbulb } from 'lucide-react';

const PEDAGOGICAL_PRACTICES = [
    "Pembelajaran Berbasis Masalah (Problem-Based Learning)",
    "Pembelajaran Berbasis Proyek (Project-Based Learning)",
    "Pembelajaran Berbasis Inkuiri (Inquiry-Based Learning)",
    "Pembelajaran Penemuan (Discovery Learning)",
    "Pembelajaran Kooperatif (Cooperative Learning)",
    "Pembelajaran Diferensiasi (Differentiated Learning)"
];

const DEEP_LEARNING_DIMENSIONS = [
    "Keimanan dan ketakwaan kepada Tuhan YME",
    "Kewargaan",
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi",
    "Kemandirian",
    "Kesehatan",
    "Komunikasi"
];

const GeneratorForm = ({ onGenerate, isGenerating, initialData }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialData || {
        teacherName: '',
        subject: '',
        grade: '',
        semester: 'Ganjil',
        topic: '',
        element: '',
        duration: '',
        meetings: '',
        hoursPerMeeting: '',
        learningOutcome: '',
        learningGoals: '',
        deepLearningDimensions: [],
        pedagogicalPractice: '',
        // Step 3: Detail Tambahan
        studentCharacteristics: '',
        crossDisciplinary: '',
        learningEnvironment: '',
        digitalTools: '',
        partnerships: '',
        saranaPrasarana: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDimensionChange = (dimension) => {
        setFormData(prev => {
            const current = prev.deepLearningDimensions;
            const updated = current.includes(dimension)
                ? current.filter(d => d !== dimension)
                : [...current, dimension];
            return {
                ...prev,
                deepLearningDimensions: updated
            };
        });
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleGenerateClick = () => {
        // Check if optional fields are empty
        const isStep3Empty = !formData.studentCharacteristics &&
            !formData.crossDisciplinary &&
            !formData.learningEnvironment &&
            !formData.digitalTools &&
            !formData.partnerships &&
            !formData.saranaPrasarana;

        if (isStep3Empty) {
            const confirm = window.confirm(
                "Detail tambahan belum diisi. Modul akan dibuat menggunakan standar umum fase ini.\n\nApakah Anda ingin melanjutkan?"
            );
            if (!confirm) return;
        }

        onGenerate(formData);
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <UserCheck size={16} /> Nama Penyusun (Guru)
                </label>
                <input
                    type="text"
                    name="teacherName"
                    required
                    value={formData.teacherName}
                    onChange={handleChange}
                    placeholder="Masukkan Nama Guru..."
                    className="input-field"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <BookOpen size={16} /> Mata Pelajaran
                    </label>
                    <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Contoh: Matematika"
                        className="input-field"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <GraduationCap size={16} /> Kelas / Fase
                    </label>
                    <select
                        name="grade"
                        required
                        value={formData.grade}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="" disabled>Pilih Kelas</option>
                        <option value="Kelas X (Fase E)">Kelas X (Fase E)</option>
                        <option value="Kelas XI (Fase F)">Kelas XI (Fase F)</option>
                        <option value="Kelas XII (Fase F)">Kelas XII (Fase F)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar size={16} /> Semester
                    </label>
                    <select
                        name="semester"
                        required
                        value={formData.semester}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Layers size={16} /> Topik / Materi
                </label>
                <input
                    type="text"
                    name="topic"
                    required
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="Contoh: Persamaan Kuadrat"
                    className="input-field"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Layers size={16} /> Elemen
                </label>
                <input
                    type="text"
                    name="element"
                    required
                    value={formData.element}
                    onChange={handleChange}
                    placeholder="Contoh: Aljabar"
                    className="input-field"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock size={16} /> Alokasi Waktu Total
                    </label>
                    <input
                        type="text"
                        name="duration"
                        required
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="Contoh: 180 Menit"
                        className="input-field"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar size={16} /> Jumlah Pertemuan
                    </label>
                    <input
                        type="number"
                        name="meetings"
                        required
                        value={formData.meetings}
                        onChange={handleChange}
                        placeholder="Contoh: 2"
                        className="input-field"
                        min="1"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock size={16} /> JP per Pertemuan
                    </label>
                    <input
                        type="text"
                        name="hoursPerMeeting"
                        required
                        value={formData.hoursPerMeeting}
                        onChange={handleChange}
                        placeholder="Contoh: 2 JP"
                        className="input-field"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Lightbulb size={16} /> Praktek Pedagogis
                </label>
                <select
                    name="pedagogicalPractice"
                    required
                    value={formData.pedagogicalPractice}
                    onChange={handleChange}
                    className="input-field"
                >
                    <option value="" disabled>Pilih Praktek Pedagogis</option>
                    {PEDAGOGICAL_PRACTICES.map((practice, index) => (
                        <option key={index} value={practice}>{practice}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Award size={16} /> Capaian Pembelajaran
                </label>
                <textarea
                    name="learningOutcome"
                    required
                    value={formData.learningOutcome}
                    onChange={handleChange}
                    placeholder="Masukkan Capaian Pembelajaran..."
                    className="input-field min-h-[80px] resize-y"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Target size={16} /> Tujuan Pembelajaran
                </label>
                <textarea
                    name="learningGoals"
                    required
                    value={formData.learningGoals}
                    onChange={handleChange}
                    placeholder="Masukkan Tujuan Pembelajaran..."
                    className="input-field min-h-[80px] resize-y"
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <UserCheck size={16} /> Dimensi Profil Lulusan (Deep Learning)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DEEP_LEARNING_DIMENSIONS.map((dim, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors">
                            <input
                                type="checkbox"
                                id={`dim-${index}`}
                                checked={formData.deepLearningDimensions.includes(dim)}
                                onChange={() => handleDimensionChange(dim)}
                                className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer"
                            />
                            <label
                                htmlFor={`dim-${index}`}
                                className="text-sm text-slate-700 cursor-pointer select-none flex-1"
                            >
                                {dim}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    Peserta Didik <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                    name="studentCharacteristics"
                    value={formData.studentCharacteristics}
                    onChange={handleChange}
                    placeholder="Identifikasi kesiapan, minat, atau kebutuhan belajar peserta didik..."
                    className="input-field min-h-[80px] resize-y"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    Lintas Disiplin Ilmu <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                    name="crossDisciplinary"
                    value={formData.crossDisciplinary}
                    onChange={handleChange}
                    placeholder="cth: Sosiologi, Ekonomi"
                    className="input-field"
                    rows="1"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    Lingkungan Pembelajaran <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                    name="learningEnvironment"
                    value={formData.learningEnvironment}
                    onChange={handleChange}
                    placeholder="Jelaskan budaya belajar atau ruang fisik/virtual yang diinginkan..."
                    className="input-field min-h-[80px] resize-y"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    Pemanfaatan Digital <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                    name="digitalTools"
                    value={formData.digitalTools}
                    onChange={handleChange}
                    placeholder="cth: Video pembelajaran, platform, perpustakaan digital..."
                    className="input-field"
                    rows="2"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    Kemitraan Pembelajaran <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                    name="partnerships"
                    value={formData.partnerships}
                    onChange={handleChange}
                    placeholder="cth: Kolaborasi dengan guru mapel lain, orang tua, komunitas..."
                    className="input-field"
                    rows="2"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    Sarana & Prasarana <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                    name="saranaPrasarana"
                    value={formData.saranaPrasarana}
                    onChange={handleChange}
                    placeholder="Alat, bahan, atau media yang dibutuhkan..."
                    className="input-field min-h-[80px] resize-y"
                />
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl glass-panel animate-fade-in relative overflow-hidden">
            {/* Gradient Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full">
                <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            <div className="text-center mb-8 pt-4">
                <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                    <Sparkles size={32} />
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                    Buat Modul Ajar
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${step >= 1 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'}`}>1. Info Dasar</span>
                    <div className="w-4 h-px bg-slate-200" />
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${step >= 2 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'}`}>2. Detail Pedagogis</span>
                    <div className="w-4 h-px bg-slate-200" />
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${step >= 3 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'}`}>3. Detail Tambahan</span>
                </div>
            </div>

            <form className="space-y-6">

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8 gap-4">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="btn-secondary px-6"
                        >
                            Kembali
                        </button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="btn-primary px-8"
                        >
                            Lanjut
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleGenerateClick}
                            disabled={isGenerating}
                            className="btn-primary flex items-center gap-2 px-8 group"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                                    <span>Generate Modul</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default GeneratorForm;
