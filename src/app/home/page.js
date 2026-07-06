'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { 
    Atom, 
    FlaskConical, 
    Dna, 
    TrendingUp, 
    Globe, 
    Scroll, 
    Compass, 
    Binary, 
    Languages 
} from 'lucide-react';

const SUBJECTS = [
    { name: 'Fisika', icon: Atom, gradient: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', delayClass: 'delay-1' },
    { name: 'Kimia', icon: FlaskConical, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', delayClass: 'delay-2' },
    { name: 'Biologi', icon: Dna, gradient: 'linear-gradient(135deg, #22c55e 0%, #84cc16 100%)', delayClass: 'delay-3' },
    { name: 'Ekonomi', icon: TrendingUp, gradient: 'linear-gradient(135deg, #f43f5e 0%, #ef4444 100%)', delayClass: 'delay-4' },
    { name: 'Geografi', icon: Globe, gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', delayClass: 'delay-5' },
    { name: 'Sejarah', icon: Scroll, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', delayClass: 'delay-6' },
    { name: 'Agama', icon: Compass, gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', delayClass: 'delay-7' },
    { name: 'Matematika', icon: Binary, gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', delayClass: 'delay-8' },
    { name: 'Bahasa', icon: Languages, gradient: 'linear-gradient(135deg, #ec4899 0%, #ec4899 100%)', delayClass: 'delay-9' }
];

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
        } else {
            setUser(loggedIn);
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
            }}>
                <p>Memuat Beranda Sisinau...</p>
            </div>
        );
    }

    return (
        <main className="home-page">
            <section className="home-hero">
                <p className="home-hero__greeting">Selamat datang kembali, {user} 👋</p>
                <h1 className="home-hero__title">Mau belajar <span>apa hari ini?</span></h1>
                <p className="home-hero__subtitle">Pilih mata pelajaran di bawah untuk mulai</p>
            </section>

            <div className="subjects-grid">
                {SUBJECTS.map((sub, idx) => {
                    const IconComponent = sub.icon;
                    return (
                        <Link 
                            key={idx} 
                            href={`/list-materi?kategori=${sub.name}`}
                            className={`subject-card ${sub.delayClass}`}
                            style={{ background: sub.gradient }}
                        >
                            <div className="subject-card__content">
                                <IconComponent className="subject-card__icon" />
                                <span className="subject-card__name">{sub.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer SEO Links */}
            <footer style={{ 
                marginTop: 'var(--space-2xl)', 
                padding: 'var(--space-xl) var(--space-lg)', 
                borderTop: '1px solid var(--border-glass)', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-sm)'
            }}>
                <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/tentang" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Tentang Kami</Link>
                    <Link href="/privasi" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Kebijakan Privasi</Link>
                    <Link href="/kontak" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>Hubungi Kami</Link>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, opacity: 0.6 }}>
                    © 2026 Sisinau. Platform E-Learning Premium Indonesia.
                </p>
            </footer>
        </main>
    );
}
