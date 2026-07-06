'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
// QuizModal import removed, quiz is now handled in /permainan page
import { useToast } from '../../components/ToastContext';
import { addXP, unlockBadge } from '../../utils/gamification';
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

function MateriContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showToast = useToast();

    const kategori = searchParams.get('kategori') || 'Fisika';
    const index = parseInt(searchParams.get('index') || '0', 10);
    const judul = searchParams.get('judul') || '';
    const deskripsi = searchParams.get('deskripsi') || '';

    const [isBookmarked, setIsBookmarked] = useState(false);
    // showQuiz state removed, quiz moved to /permainan
    const [allMateri, setAllMateri] = useState([]);

    // Check auth
    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
        }
    }, [router]);

    // Load all category materials to handle next/prev navigation
    useEffect(() => {
        const fetchMateri = async () => {
            if (isSupabaseConfigured) {
                try {
                    const { data, error } = await supabase
                        .from('materials')
                        .select('*')
                        .eq('kategori', kategori)
                        .order('id', { ascending: true });
                    if (error) throw error;
                    setAllMateri(data || []);
                } catch (err) {
                    console.error("Gagal memuat materi:", err);
                    loadLocalFallback();
                }
            } else {
                loadLocalFallback();
            }
        };

        const loadLocalFallback = () => {
            let list = DEFAULT_MATERI[kategori] || [];
            const custom = JSON.parse(localStorage.getItem('customMateri')) || {};
            if (custom[kategori]) {
                list = [...list, ...custom[kategori]];
            }
            setAllMateri(list);
        };

        fetchMateri();
    }, [kategori]);

    // Check if current page is bookmarked
    useEffect(() => {
        if (!judul) return;

        const checkBookmark = async () => {
            const loggedIn = localStorage.getItem('loggedInUser');
            if (isSupabaseConfigured && loggedIn) {
                try {
                    const material = allMateri.find(m => m.judul === judul);
                    if (material && material.id) {
                        const { data, error } = await supabase
                            .from('bookmarks')
                            .select('*')
                            .eq('username', loggedIn)
                            .eq('material_id', material.id)
                            .maybeSingle();
                        setIsBookmarked(!!data);
                    } else {
                        setIsBookmarked(false);
                    }
                } catch (err) {
                    console.error("Gagal memeriksa bookmark:", err);
                    localCheck();
                }
            } else {
                localCheck();
            }
        };

        const localCheck = () => {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            const found = bookmarks.some(b => b.judul === judul && b.kategori === kategori);
            setIsBookmarked(found);
        };

        checkBookmark();
    }, [judul, kategori, allMateri]);

    // Award XP for reading a new material
    useEffect(() => {
        if (!judul) return;
        const readList = JSON.parse(localStorage.getItem('readMateri') || '[]');
        const key = `${kategori}_${judul}`;
        
        if (!readList.includes(key)) {
            readList.push(key);
            localStorage.setItem('readMateri', JSON.stringify(readList));
            
            // Award XP
            addXP(20, showToast);
            
            // Check explorer badge
            if (readList.length >= 3) {
                unlockBadge("PENJELAJAH", showToast);
            }
        }
    }, [judul, kategori, showToast]);

    const handleToggleBookmark = async () => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) return;

        const material = allMateri.find(m => m.judul === judul);
        const materialId = material ? material.id : null;

        if (isSupabaseConfigured) {
            try {
                if (isBookmarked) {
                    if (materialId) {
                        const { error } = await supabase
                            .from('bookmarks')
                            .delete()
                            .eq('username', loggedIn)
                            .eq('material_id', materialId);
                        if (error) throw error;
                    }
                    setIsBookmarked(false);
                    showToast("Bookmark dihapus!");
                } else {
                    if (materialId) {
                        const { error } = await supabase
                            .from('bookmarks')
                            .insert({ username: loggedIn, material_id: materialId });
                        if (error) throw error;
                        setIsBookmarked(true);
                        showToast("Materi berhasil dibookmark! ❤️");
                    } else {
                        showToast("Materi tidak memiliki ID di database!", "error");
                    }
                }
            } catch (err) {
                console.error("Gagal mengubah bookmark:", err);
                showToast("Gagal memperbarui bookmark di server!", "error");
            }
        } else {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            if (isBookmarked) {
                const updated = bookmarks.filter(b => !(b.judul === judul && b.kategori === kategori));
                localStorage.setItem('bookmarks', JSON.stringify(updated));
                setIsBookmarked(false);
                showToast("Bookmark dihapus!");
            } else {
                const newItem = { kategori, index, judul, deskripsi };
                bookmarks.push(newItem);
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                setIsBookmarked(true);
                showToast("Materi berhasil dibookmark! ❤️");
            }
        }
    };

    // Navigation handlers
    const navigateTo = (newIdx) => {
        if (newIdx >= 0 && newIdx < allMateri.length) {
            const m = allMateri[newIdx];
            const encJ = encodeURIComponent(m.judul);
            const encD = encodeURIComponent(m.deskripsi);
            router.push(`/materi?kategori=${kategori}&index=${newIdx}&judul=${encJ}&deskripsi=${encD}`);
        }
    };

    if (!judul) {
        return (
            <div className="materi-reader" style={{ textAlign: 'center' }}>
                <h1 className="materi-reader__title">Materi Tidak Ditemukan</h1>
                <p className="materi-reader__desc">Pilih materi pelajaran terlebih dahulu dari daftar.</p>
                <Link href="/list-materi" className="btn btn--primary">Ke Daftar Materi</Link>
            </div>
        );
    }

    const currentItem = allMateri[index] || {};
    const isCustomUpload = !!currentItem.fileUrl;

    return (
        <div className="materi-reader">
            {/* Header Actions */}
            <div className="materi-reader__header-actions">
                <Link href={`/list-materi?kategori=${kategori}`} className="materi-reader__back">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    Kembali
                </Link>

                <button 
                    className={`btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={handleToggleBookmark}
                    title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
            </div>

            {/* Navigation Arrows */}
            {index > 0 && (
                <button className="materi-nav materi-nav--left" onClick={() => navigateTo(index - 1)} title="Materi Sebelumnya">
                    &#10094;
                </button>
            )}
            {index < allMateri.length - 1 && (
                <button className="materi-nav materi-nav--right" onClick={() => navigateTo(index + 1)} title="Materi Selanjutnya">
                    &#10095;
                </button>
            )}

            {/* Content Details */}
            <h1 className="materi-reader__title">{judul}</h1>
            <p className="materi-reader__desc">({deskripsi})</p>

            <div className="materi-reader__content" style={{ padding: 0, overflow: 'hidden', height: '650px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
                <iframe
                    src={`${currentItem.file_url || currentItem.fileUrl || '/dummy materi.pdf'}#toolbar=0`}
                    className="pdf-viewer-frame"
                    title={judul}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', background: 'var(--bg-secondary)' }}
                />
            </div>

            {/* Quiz & Footer buttons */}
            <div className="materi-reader__footer-actions">
                <Link href={`/permainan?kategori=${kategori}`} className="btn--quiz">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                    Kerjakan Kuis
                </Link>
            </div>
        </div>
    );
}

export default function MateriPage() {
    return (
        <div className="materi-page">
            <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
                    Memuat materi reader...
                </div>
            }>
                <MateriContent />
            </Suspense>
        </div>
    );
}
