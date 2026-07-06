'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivasiPage() {
    const sectionStyle = { marginBottom: 'var(--space-xl)' };
    const h2Style = { fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' };
    const pStyle = { color: 'var(--text-secondary)', lineHeight: 1.8 };

    return (
        <main style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-lg)', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-2xl)', backdropFilter: 'blur(20px)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xs)', background: 'linear-gradient(135deg, var(--orange-400), var(--orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Kebijakan Privasi
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>Terakhir diperbarui: Juli 2026</p>

                <section style={sectionStyle}>
                    <h2 style={h2Style}>1. Informasi yang Kami Kumpulkan</h2>
                    <p style={pStyle}>
                        Saat Anda mendaftar di Sisinau, kami mengumpulkan informasi berikut: nama pengguna (username), alamat email, dan kata sandi yang terenkripsi. Kami tidak mengumpulkan data pribadi sensitif seperti nomor telepon, alamat rumah, atau informasi keuangan.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={h2Style}>2. Penggunaan Informasi</h2>
                    <p style={pStyle}>
                        Informasi yang dikumpulkan digunakan untuk: menyediakan layanan platform e-learning, menyimpan progres belajar Anda (XP, level, lencana), mengelola bookmark dan materi yang diunggah, serta meningkatkan kualitas layanan kami.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={h2Style}>3. Penyimpanan Data</h2>
                    <p style={pStyle}>
                        Data Anda disimpan secara aman menggunakan layanan Supabase yang memiliki standar keamanan tinggi. Sebagian data juga disimpan secara lokal di perangkat Anda (localStorage) untuk meningkatkan kecepatan akses dan pengalaman pengguna.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={h2Style}>4. Berbagi Data dengan Pihak Ketiga</h2>
                    <p style={pStyle}>
                        Kami <strong>tidak menjual, memperdagangkan, atau memindahtangankan</strong> informasi pribadi Anda kepada pihak ketiga. Satu-satunya pihak ketiga yang terlibat adalah penyedia iklan (Adsterra) yang dapat menggunakan cookie anonim untuk menampilkan iklan yang relevan.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={h2Style}>5. Cookie dan Teknologi Pelacakan</h2>
                    <p style={pStyle}>
                        Sisinau menggunakan localStorage dan cookie teknis untuk menyimpan preferensi Anda (seperti tema gelap/terang) dan status login. Penyedia iklan pihak ketiga juga dapat menggunakan cookie untuk keperluan penayangan iklan.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={h2Style}>6. Hak Pengguna</h2>
                    <p style={pStyle}>
                        Anda berhak untuk: mengakses data pribadi Anda, memperbarui informasi akun, menghapus materi yang telah diunggah, dan menghapus akun Anda. Untuk permintaan penghapusan data, silakan hubungi kami melalui halaman Kontak.
                    </p>
                </section>

                <section>
                    <h2 style={h2Style}>7. Perubahan Kebijakan</h2>
                    <p style={pStyle}>
                        Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan akan diberitahukan melalui halaman ini dengan memperbarui tanggal "Terakhir diperbarui" di atas.
                    </p>
                </section>

                <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
                    <Link href="/home" className="btn btn--ghost" style={{ padding: '12px 32px' }}>
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </main>
    );
}
