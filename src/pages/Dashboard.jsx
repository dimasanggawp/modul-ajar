import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BookOpen } from 'lucide-react';

const Dashboard = () => {
    const apps = [
        {
            id: 1,
            title: "Rencana Pembelajaran Mendalam",
            description: "Buat Rencana Pembelajaran Mendalam lengkap dengan pendekatan Deep Learning secara otomatis menggunakan AI.",
            icon: <BrainCircuit size={40} />,
            path: "/generator-rencana-pembelajaran-mendalam",
            color: "bg-blue-600"
        },
        {
            id: 2,
            title: "Modul Ajar",
            description: "Buat Modul Ajar standar Kurikulum Merdeka dengan pendekatan Pembelajaran Mendalam secara otomatis menggunakan AI.",
            icon: <BookOpen size={40} />,
            path: "/generator-modul-ajar",
            color: "bg-emerald-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-bl from-primary-600/10 to-blue-600/10 -skew-y-3 transform origin-top-right z-0 pointer-events-none" />

            <div className="container mx-auto px-4 py-12 relative z-10">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">Dashboard Aplikasi</h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Pusat akses untuk berbagai alat bantu pendidikan dan pembelajaran.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {apps.map((app) => (
                        <Link
                            to={app.path}
                            key={app.id}
                            className="group block bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-slate-100"
                        >
                            <div className={`${app.color} p-6 flex justify-center items-center text-white h-32 group-hover:scale-105 transition-transform duration-500`}>
                                {app.icon}
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary-600 transition-colors text-center">
                                    {app.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-justify">
                                    {app.description}
                                </p>
                                <div className="mt-6 flex items-center text-primary-600 font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                    Buka Aplikasi &rarr;
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <footer className="mt-24 text-center text-slate-400 text-sm pb-8">
                &copy; {new Date().getFullYear()} Platform Pendidikan Terpadu
            </footer>
        </div>
    );
};

export default Dashboard;
