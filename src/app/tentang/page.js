'use client';

import React from 'react';
import Link from 'next/link';

export default function TentangPage() {
    return (
        <main style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-lg)', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-2xl)', backdropFilter: 'blur(20px)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, var(--orange-400), var(--orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Tentang Sisinau
                </h1>

                <section style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Apa itu Sisinau?</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <strong style={{ color: 'var(--orange-400)' }}>Sisinau</strong> adalah platform e-learning premium yang dirancang khusus untuk pelajar Indonesia. Kami menyediakan akses mudah ke materi pelajaran berkualitas tinggi mulai dari Fisika, Kimia, Biologi, Matematika, Ekonomi, Geografi, Sejarah, Agama, hingga Bahasa — semuanya dalam satu tempat dengan tampilan modern dan nyaman.
                    </p>
                </section>

                <section style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Misi Kami</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        Kami percaya bahwa setiap pelajar berhak mendapatkan akses pendidikan berkualitas tanpa hambatan. Sisinau hadir untuk mendemokratisasi pendidikan di Indonesia dengan menyediakan platform belajar yang gratis, interaktif, dan menyenangkan.
                    </p>
                </section>

                <section style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Fitur Unggulan</h2>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: 'var(--space-lg)' }}>
                        <li>📚 Materi pelajaran lengkap SMA/SMK dengan pembaca PDF interaktif</li>
                        <li>📤 Upload dan bagikan materi buatan sendiri kepada komunitas</li>
                        <li>🔖 Bookmark materi favorit untuk dibaca nanti</li>
                        <li>🎮 Kuis & permainan edukatif untuk mengasah pemahaman</li>
                        <li>🏆 Sistem gamifikasi dengan XP, Level, dan Lencana pencapaian</li>
                        <li>🌙 Tema gelap & terang yang nyaman di mata</li>
                        <li>🔍 Pencarian materi yang cepat dan akurat</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Dibuat dengan ❤️</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        Sisinau dikembangkan sebagai proyek Pemrograman Web dengan teknologi modern: Next.js, Supabase, dan desain UI/UX premium. Kami berkomitmen untuk terus mengembangkan platform ini demi kemajuan pendidikan Indonesia.
                    </p>
                </section>

                <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
                    <Link href="/home" className="btn btn--primary" style={{ padding: '12px 32px' }}>
                        Mulai Belajar 🚀
                    </Link>
                </div>
            </div>
        </main>
    );
}
