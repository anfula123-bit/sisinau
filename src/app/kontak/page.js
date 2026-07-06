'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '../../components/ToastContext';

export default function KontakPage() {
    const showToast = useToast();
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [pesan, setPesan] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nama.trim() || !email.trim() || !pesan.trim()) {
            showToast("Harap isi semua kolom!", "error");
            return;
        }
        // For now, just show a success toast (can integrate with email service later)
        showToast("Pesan Anda telah terkirim! Terima kasih. 💌");
        setNama('');
        setEmail('');
        setPesan('');
    };

    return (
        <main style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-lg)', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-2xl)', backdropFilter: 'blur(20px)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-sm)', background: 'linear-gradient(135deg, var(--orange-400), var(--orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Hubungi Kami
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
                    Ada pertanyaan, saran, atau laporan masalah? Jangan ragu untuk menghubungi tim Sisinau melalui formulir di bawah ini.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="form-label">Nama Lengkap</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Masukkan nama Anda"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="form-label">Email</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            placeholder="contoh@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="form-label">Pesan</label>
                        <textarea 
                            className="form-input" 
                            placeholder="Tulis pesan Anda di sini..."
                            value={pesan}
                            onChange={(e) => setPesan(e.target.value)}
                            style={{ minHeight: '140px', resize: 'vertical' }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn--primary" style={{ width: '100%', padding: '14px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        Kirim Pesan
                    </button>
                </form>

                <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>📧 Kontak Lainnya</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                        Email: <strong style={{ color: 'var(--orange-400)' }}>support@sisinau.com</strong><br />
                        Waktu respon: 1-2 hari kerja
                    </p>
                </div>

                <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                    <Link href="/home" className="btn btn--ghost" style={{ padding: '12px 32px' }}>
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </main>
    );
}
