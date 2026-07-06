'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DEFAULT_MATERI = {
    "Fisika": [
        { judul: "Menghitung Kecepatan", deskripsi: "Cara menghitung kecepatan benda bergerak." },
        { judul: "Quantum Tunneling", deskripsi: "Fenomena partikel menembus penghalang energi." },
        { judul: "Relativitas Waktu", deskripsi: "Konsep waktu relatif menurut Einstein." },
        { judul: "God Particle", deskripsi: "Penjelasan tentang Higgs Boson." }
    ],
    "Kimia": [
        { judul: "Ikatan Kimia", deskripsi: "Jenis-jenis ikatan kimia antar atom." },
        { judul: "Reaksi Redoks", deskripsi: "Reaksi oksidasi dan reduksi." },
        { judul: "Larutan Elektrolit", deskripsi: "Cara kerja larutan dalam menghantarkan listrik." }
    ],
    "Biologi": [
        { judul: "Sel dan Organel", deskripsi: "Struktur dasar penyusun makhluk hidup." },
        { judul: "Sistem Pencernaan", deskripsi: "Proses pencernaan makanan dalam tubuh manusia." }
    ],
    "Ekonomi": [
        { judul: "Permintaan dan Penawaran", deskripsi: "Hubungan antara harga dan jumlah barang." },
        { judul: "Inflasi", deskripsi: "Penyebab dan dampak kenaikan harga umum." }
    ],
    "Geografi": [
        { judul: "Lapisan Bumi", deskripsi: "Struktur dan komposisi bumi." },
        { judul: "Perubahan Iklim", deskripsi: "Dampak aktivitas manusia terhadap iklim global." }
    ],
    "Sejarah": [
        { judul: "Kerajaan Majapahit", deskripsi: "Sejarah kejayaan kerajaan Majapahit." },
        { judul: "Proklamasi Kemerdekaan", deskripsi: "Peristiwa penting 17 Agustus 1945." }
    ],
    "Agama": [
        { judul: "Nilai Kejujuran", deskripsi: "Pentingnya kejujuran dalam kehidupan sehari-hari." },
        { judul: "Toleransi", deskripsi: "Menjaga keharmonisan antar umat beragama." }
    ],
    "Matematika": [
        { judul: "Persamaan Linear", deskripsi: "Cara menyelesaikan persamaan linear satu variabel." },
        { judul: "Trigonometri", deskripsi: "Fungsi dan penerapan trigonometri." }
    ],
    "Bahasa": [
        { judul: "Teks Eksposisi", deskripsi: "Ciri-ciri dan struktur teks eksposisi." },
        { judul: "Puisi", deskripsi: "Unsur dan makna dalam puisi." }
    ]
};

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allMateri, setAllMateri] = useState([]);

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
            return;
        }

        // Gather all materials from both DEFAULT and localStorage custom uploads
        const combined = [];
        Object.entries(DEFAULT_MATERI).forEach(([cat, list]) => {
            list.forEach((m, idx) => {
                combined.push({ ...m, kategori: cat, index: idx });
            });
        });

        const custom = JSON.parse(localStorage.getItem('customMateri')) || {};
        Object.entries(custom).forEach(([cat, list]) => {
            list.forEach((m, idx) => {
                combined.push({ ...m, kategori: cat, index: idx });
            });
        });

        setAllMateri(combined);
    }, [router]);

    // Handle real-time filtering
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = allMateri.filter(
            (m) =>
                m.judul.toLowerCase().includes(lowerQuery) ||
                m.deskripsi.toLowerCase().includes(lowerQuery) ||
                m.kategori.toLowerCase().includes(lowerQuery)
        );

        setResults(filtered);
    }, [query, allMateri]);

    return (
        <main className="search-page">
            <div className="search-container">
                <h2>Cari Materi 🔍</h2>
                
                <div className="search-bar-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                    <input 
                        type="text" 
                        placeholder="Ketik judul, deskripsi, atau mata pelajaran..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="materi-list">
                    {query.trim() && results.length === 0 && (
                        <p className="materi-empty">Materi tidak ditemukan. Coba ketik kata kunci lain.</p>
                    )}

                    {!query.trim() && (
                        <p className="materi-empty" style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>
                            Mulailah mengetik untuk mencari materi pelajaran di Sisinau...
                        </p>
                    )}

                    {results.map((m, idx) => {
                        const encJ = encodeURIComponent(m.judul);
                        const encD = encodeURIComponent(m.deskripsi);
                        return (
                            <Link 
                                key={idx} 
                                href={`/materi?kategori=${m.kategori}&index=${m.index}&judul=${encJ}&deskripsi=${encD}`}
                            >
                                <div className="materi-card">
                                    <h3>{m.judul}</h3>
                                    <p>{m.deskripsi}</p>
                                    <div className="materi-meta" style={{ marginTop: '8px' }}>
                                        <span className="badge-category">{m.kategori}</span>
                                        {m.fileUrl && <span className="badge-upload">📄 Materi Upload</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
