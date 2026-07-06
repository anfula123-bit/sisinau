'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QuizModal from '../../components/QuizModal';
import { useToast } from '../../components/ToastContext';

const KATEGORI_KUIS = [
    { name: 'Fisika', color: '#a855f7', bgGlow: 'rgba(168, 85, 247, 0.15)' },
    { name: 'Kimia', color: '#10b981', bgGlow: 'rgba(16, 185, 129, 0.15)' },
    { name: 'Biologi', color: '#22c55e', bgGlow: 'rgba(34, 197, 94, 0.15)' },
    { name: 'Matematika', color: '#6366f1', bgGlow: 'rgba(99, 102, 241, 0.15)' },
    { name: 'Ekonomi', color: '#f43f5e', bgGlow: 'rgba(244, 63, 94, 0.15)' },
    { name: 'Geografi', color: '#06b6d4', bgGlow: 'rgba(6, 182, 212, 0.15)' },
    { name: 'Sejarah', color: '#f59e0b', bgGlow: 'rgba(245, 158, 11, 0.15)' },
    { name: 'Agama', color: '#eab308', bgGlow: 'rgba(234, 179, 8, 0.15)' },
    { name: 'Bahasa', color: '#ec4899', bgGlow: 'rgba(236, 72, 153, 0.15)' }
];

function PermainanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showToast = useToast();

    const [user, setUser] = useState('');
    const [stats, setStats] = useState({ completed: 0, avgScore: 0 });
    const [xp, setXp] = useState(0);
    const [activeKategori, setActiveKategori] = useState(null);

    // Auth & Load Stats
    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
            return;
        }
        setUser(loggedIn);

        // Load Quiz Stats
        const loadStats = () => {
            const quizStats = JSON.parse(localStorage.getItem('quizStats')) || { completed: 0, totalScore: 0 };
            const userXp = parseInt(localStorage.getItem('userXp') || '0', 10);
            
            const avg = quizStats.completed > 0 
                ? Math.round(quizStats.totalScore / quizStats.completed) 
                : 0;

            setStats({
                completed: quizStats.completed,
                avgScore: avg
            });
            setXp(userXp);
        };

        loadStats();

        // Listen for updates
        window.addEventListener('quizStatsUpdated', loadStats);
        window.addEventListener('xpUpdated', loadStats);

        return () => {
            window.removeEventListener('quizStatsUpdated', loadStats);
            window.removeEventListener('xpUpdated', loadStats);
        };
    }, [router]);

    // Handle auto-start quiz via query parameter
    useEffect(() => {
        const kat = searchParams.get('kategori');
        if (kat) {
            // Check if category exists
            const match = KATEGORI_KUIS.find(k => k.name.toLowerCase() === kat.toLowerCase());
            if (match) {
                setActiveKategori(match.name);
            }
        }
    }, [searchParams]);

    const handleCloseQuiz = () => {
        setActiveKategori(null);
        // Clear query param from URL without page reload
        router.push('/permainan', { scroll: false });
    };

    return (
        <main className="games-page">
            <div className="games-container">
                {/* Header */}
                <section className="games-hero">
                    <h1 className="games-hero__title">Arena Permainan <span>Sisinau</span> 🎮</h1>
                    <p className="games-hero__subtitle">
                        Uji pengetahuanmu dengan game edukasi yang menantang dan kumpulkan XP untuk naik level!
                    </p>
                </section>

                {/* Mini Stats Bar */}
                <div className="games-stats-bar">
                    <div className="games-stat-item">
                        <span className="games-stat-item__label">Total XP</span>
                        <span className="games-stat-item__val">{xp} XP 🌟</span>
                    </div>
                    <div className="games-stat-item">
                        <span className="games-stat-item__label">Kuis Selesai</span>
                        <span className="games-stat-item__val">{stats.completed} 🧠</span>
                    </div>
                    <div className="games-stat-item">
                        <span className="games-stat-item__label">Rata-rata Skor</span>
                        <span className="games-stat-item__val">{stats.avgScore}% 🏆</span>
                    </div>
                </div>

                {/* Games Catalog Grid */}
                <div className="games-grid">
                    {/* Game Card 1: Quiz */}
                    <div className="game-card game-card--active">
                        <div className="game-card__header">
                            <span className="game-card__badge game-card__badge--play">Bisa Dimainkan</span>
                            <h2>Kuis Belajar Interaktif 🧠</h2>
                        </div>
                        <p className="game-card__desc">
                            Pilih kategori mata pelajaran dan jawab kuis seru untuk mengasah otakmu. Setiap kuis yang diselesaikan memberikan 50 XP tambahan!
                        </p>
                        
                        <div className="category-select-label">Pilih kategori pelajaran untuk mulai bermain:</div>
                        <div className="category-select-grid">
                            {KATEGORI_KUIS.map((kat) => (
                                <button
                                    key={kat.name}
                                    className="category-btn"
                                    style={{ 
                                        '--kat-color': kat.color,
                                        '--kat-glow': kat.bgGlow
                                    }}
                                    onClick={() => setActiveKategori(kat.name)}
                                >
                                    <span className="category-btn__dot"></span>
                                    {kat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Game Card 2: Word Guessing (Placeholder) */}
                    <div className="game-card game-card--disabled">
                        <div className="game-card__header">
                            <span className="game-card__badge game-card__badge--soon">Segera Hadir</span>
                            <h2>Tebak Kata Sains 🔠</h2>
                        </div>
                        <p className="game-card__desc">
                            Tebak kosakata ilmiah berdasarkan petunjuk yang diberikan. Menguji kemampuan memori dan pemahaman glosarium materi pelajaranmu!
                        </p>
                        <div className="game-card__footer">
                            <button className="btn btn--disabled" disabled>Kunci Terbuka di Level Berikutnya</button>
                        </div>
                    </div>

                    {/* Game Card 3: Memory Match (Placeholder) */}
                    <div className="game-card game-card--disabled">
                        <div className="game-card__header">
                            <span className="game-card__badge game-card__badge--soon">Segera Hadir</span>
                            <h2>Memory Match Matematika 🧪</h2>
                        </div>
                        <p className="game-card__desc">
                            Cocokkan rumus matematika atau definisi kimia dengan pasangan yang tepat dalam batas waktu yang ditentukan. Melatih reflek berpikir cepat!
                        </p>
                        <div className="game-card__footer">
                            <button className="btn btn--disabled" disabled>Segera Rilis</button>
                        </div>
                    </div>
                </div>

                {/* Back to Home Button */}
                <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', justifyContent: 'center' }}>
                    <Link href="/home" className="btn btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        Kembali Ke Beranda
                    </Link>
                </div>
            </div>

            {/* Quiz Modal Overlay */}
            {activeKategori && (
                <QuizModal 
                    kategori={activeKategori}
                    onClose={handleCloseQuiz}
                />
            )}
        </main>
    );
}

export default function PermainanPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
                Memuat arena permainan...
            </div>
        }>
            <PermainanContent />
        </Suspense>
    );
}
