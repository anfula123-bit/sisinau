'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

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

const CATEGORIES = ["Fisika", "Kimia", "Biologi", "Ekonomi", "Geografi", "Sejarah", "Agama", "Matematika", "Bahasa"];

function ListMateriContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [selectedCategory, setSelectedCategory] = useState("Fisika");
    const [materiList, setMateriList] = useState([]);

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
        }
    }, [router]);

    // Track active category parameter
    useEffect(() => {
        const categoryParam = searchParams.get('kategori');
        if (categoryParam && CATEGORIES.includes(categoryParam)) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

    // Load category materials (defaults + custom uploads)
    useEffect(() => {
        const loadMateri = async () => {
            if (isSupabaseConfigured) {
                try {
                    const { data, error } = await supabase
                        .from('materials')
                        .select('*')
                        .eq('kategori', selectedCategory)
                        .order('id', { ascending: true });

                    if (error) throw error;
                    setMateriList(data || []);
                } catch (err) {
                    console.error("Gagal memuat materi dari Supabase:", err);
                    loadLocalFallback();
                }
            } else {
                loadLocalFallback();
            }
        };

        const loadLocalFallback = () => {
            let list = DEFAULT_MATERI[selectedCategory] || [];
            const custom = JSON.parse(localStorage.getItem('customMateri')) || {};
            if (custom[selectedCategory]) {
                list = [...list, ...custom[selectedCategory]];
            }
            setMateriList(list);
        };

        loadMateri();
    }, [selectedCategory]);

    return (
        <main className="list-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                {CATEGORIES.map((cat, i) => (
                    <button 
                        key={i}
                        className={`sidebar__btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </aside>

            {/* List */}
            <section className="materi-list">
                {materiList.length === 0 ? (
                    <p className="materi-empty">Belum ada materi tersedia untuk kategori ini.</p>
                ) : (
                    materiList.map((m, idx) => {
                        const encodedJudul = encodeURIComponent(m.judul);
                        const encodedDeskripsi = encodeURIComponent(m.deskripsi);
                        return (
                            <Link 
                                key={idx}
                                href={`/materi?kategori=${selectedCategory}&index=${idx}&judul=${encodedJudul}&deskripsi=${encodedDeskripsi}`}
                            >
                                <div className="materi-card">
                                    <h3>{m.judul}</h3>
                                    <p>{m.deskripsi}</p>
                                    <div className="materi-meta">
                                        <span className="badge-category">{selectedCategory}</span>
                                        {m.fileUrl && <span className="badge-upload">📄 Materi Upload</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </section>
        </main>
    );
}

export default function ListMateriPage() {
    return (
        <div className="list-page">
            <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
                    Memuat materi...
                </div>
            }>
                <ListMateriContent />
            </Suspense>

            {/* FAB Upload */}
            <Link href="/upload" className="fab" title="Upload Materi">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </Link>
        </div>
    );
}
