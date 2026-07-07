'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
// QuizModal import removed, quiz is now handled in /permainan page
import { useToast } from '../../components/ToastContext';
import { addXP, unlockBadge } from '../../utils/gamification';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';
import AdsterraBanner from '../../components/AdsterraBanner';

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

    const [loggedInUser, setLoggedInUser] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editJudul, setEditJudul] = useState('');
    const [editDeskripsi, setEditDeskripsi] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLoggedInUser(localStorage.getItem('loggedInUser') || '');
        }
    }, []);

    const startEdit = () => {
        setEditJudul(judul);
        setEditDeskripsi(deskripsi);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!editJudul.trim() || !editDeskripsi.trim()) {
            showToast("Judul dan deskripsi tidak boleh kosong!", "error");
            return;
        }

        const currentItem = allMateri[index] || {};

        if (isSupabaseConfigured) {
            try {
                const { error } = await supabase
                    .from('materials')
                    .update({
                        judul: editJudul.trim(),
                        deskripsi: editDeskripsi.trim()
                    })
                    .eq('id', currentItem.id);

                if (error) throw error;
            } catch (err) {
                console.error(err);
                showToast("Gagal menyimpan perubahan ke database!", "error");
                return;
            }
        } else {
            const custom = JSON.parse(localStorage.getItem('customMateri')) || {};
            const catList = custom[kategori] || [];
            if (catList[index]) {
                catList[index].judul = editJudul.trim();
                catList[index].deskripsi = editDeskripsi.trim();
                custom[kategori] = catList;
                localStorage.setItem('customMateri', JSON.stringify(custom));
            }
        }

        showToast("Materi berhasil diperbarui! ✨");
        setIsEditing(false);

        const encJ = encodeURIComponent(editJudul.trim());
        const encD = encodeURIComponent(editDeskripsi.trim());
        router.replace(`/materi?kategori=${kategori}&index=${index}&judul=${encJ}&deskripsi=${encD}`);
        
        setAllMateri(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index].judul = editJudul.trim();
                updated[index].deskripsi = editDeskripsi.trim();
            }
            return updated;
        });
    };

    const handleDeleteMateri = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus materi ini selamanya?")) return;

        const currentItem = allMateri[index] || {};

        if (isSupabaseConfigured) {
            try {
                const { error } = await supabase
                    .from('materials')
                    .delete()
                    .eq('id', currentItem.id);

                if (error) throw error;
            } catch (err) {
                console.error(err);
                showToast("Gagal menghapus materi dari database!", "error");
                return;
            }
        } else {
            const custom = JSON.parse(localStorage.getItem('customMateri')) || {};
            const catList = custom[kategori] || [];
            catList.splice(index, 1);
            custom[kategori] = catList;
            localStorage.setItem('customMateri', JSON.stringify(custom));
        }

        showToast("Materi berhasil dihapus!");
        router.replace(`/list-materi?kategori=${kategori}`);
    };

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

    // ============================================
    // DISCUSSION / COMMENT FORUM LOGIC
    // ============================================
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const loadComments = async () => {
        if (!judul) return;
        const currentItem = allMateri[index] || {};
        if (isSupabaseConfigured) {
            try {
                let query = supabase
                    .from('comments')
                    .select('*, profiles(name, avatar_url)');
                
                if (currentItem.id) {
                    query = query.eq('material_id', currentItem.id);
                } else {
                    query = query.eq('fallback_key', `${kategori}_${judul}`);
                }
                
                const { data, error } = await query.order('id', { ascending: true });
                if (error) throw error;
                setComments(data || []);
            } catch (err) {
                console.error("Gagal memuat diskusi:", err);
                loadLocalComments();
            }
        } else {
            loadLocalComments();
        }
    };

    const loadLocalComments = () => {
        const key = `${kategori}_${judul}`;
        const allComments = JSON.parse(localStorage.getItem('materi_comments') || '[]');
        const filtered = allComments.filter(c => c.fallback_key === key);
        setComments(filtered);
    };

    useEffect(() => {
        if (allMateri.length > 0) {
            loadComments();
        }
    }, [judul, kategori, allMateri, index]);

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            showToast("Harap login terlebih dahulu untuk ikut berdiskusi!", "error");
            return;
        }

        const currentItem = allMateri[index] || {};
        const fallbackKey = `${kategori}_${judul}`;
        
        if (isSupabaseConfigured) {
            try {
                const insertData = {
                    username: loggedIn,
                    comment: newComment.trim(),
                    fallback_key: fallbackKey
                };
                if (currentItem.id) {
                    insertData.material_id = currentItem.id;
                }
                const { error } = await supabase
                    .from('comments')
                    .insert(insertData);
                
                if (error) throw error;
                setNewComment('');
                showToast("Komentar berhasil dikirim! 💬");
                addXP(10, showToast);
                loadComments();
            } catch (err) {
                console.error("Gagal mengirim komentar:", err);
                showToast("Gagal mengirim komentar ke server!", "error");
            }
        } else {
            const allComments = JSON.parse(localStorage.getItem('materi_comments') || '[]');
            const savedProfile = JSON.parse(localStorage.getItem('profile_' + loggedIn)) || {};
            const savedAvatar = localStorage.getItem('profile_avatar_' + loggedIn) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            
            const newComm = {
                id: Date.now(),
                fallback_key: fallbackKey,
                username: loggedIn,
                comment: newComment.trim(),
                created_at: new Date().toISOString(),
                profiles: {
                    name: savedProfile.name || loggedIn,
                    avatar_url: savedAvatar
                }
            };
            
            allComments.push(newComm);
            localStorage.setItem('materi_comments', JSON.stringify(allComments));
            setNewComment('');
            showToast("Komentar berhasil dikirim! 💬");
            addXP(10, showToast);
            loadComments();
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
        
        if (isSupabaseConfigured) {
            try {
                const { error } = await supabase
                    .from('comments')
                    .delete()
                    .eq('id', commentId);
                
                if (error) throw error;
                showToast("Komentar berhasil dihapus!");
                loadComments();
            } catch (err) {
                console.error("Gagal menghapus komentar:", err);
                showToast("Gagal menghapus komentar!", "error");
            }
        } else {
            const allComments = JSON.parse(localStorage.getItem('materi_comments') || '[]');
            const filtered = allComments.filter(c => c.id !== commentId);
            localStorage.setItem('materi_comments', JSON.stringify(filtered));
            showToast("Komentar berhasil dihapus!");
            loadComments();
        }
    };

    const formatRelativeTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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
    const isCustomUpload = !!currentItem.fileUrl || !!currentItem.file_url;
    const uploader = currentItem.uploaded_by || currentItem.uploadedBy || 'Sisinau';
    const isUploader = uploader === loggedInUser && uploader !== 'Sisinau';

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
            {isEditing ? (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-xl)', textAlign: 'left' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="form-label">Judul Materi</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={editJudul} 
                            onChange={(e) => setEditJudul(e.target.value)} 
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="form-label">Deskripsi Singkat</label>
                        <textarea 
                            className="form-input" 
                            value={editDeskripsi} 
                            onChange={(e) => setEditDeskripsi(e.target.value)}
                            style={{ minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--primary" onClick={handleSaveEdit} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Simpan</button>
                        <button className="btn btn--ghost" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Batal</button>
                    </div>
                </div>
            ) : (
                <>
                    <h1 className="materi-reader__title">{judul}</h1>
                    <p className="materi-reader__desc">({deskripsi})</p>
                    
                    <div style={{ marginTop: '-12px', marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Diupload oleh: <strong style={{ color: 'var(--orange-400)' }}>{uploader}</strong>
                        </p>
                        
                        {isUploader && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={startEdit}
                                    className="btn btn--ghost"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={handleDeleteMateri}
                                    className="btn btn--logout"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', background: 'transparent', marginTop: 0 }}
                                >
                                    Hapus
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!isEditing && <AdsterraBanner />}

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

            {/* Forum Diskusi Section */}
            <section className="discussion-section">
                <h3 className="discussion-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Forum Diskusi <span>Sisinau</span> 💬
                </h3>

                <form onSubmit={handleSendComment} className="discussion-form">
                    <textarea 
                        placeholder="Tulis pertanyaan atau pendapatmu tentang materi ini..." 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                    />
                    <div className="discussion-form__footer">
                        <button type="submit" className="btn-send-comment">
                            Kirim Komentar 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </div>
                </form>

                <div className="comment-list">
                    {comments.length === 0 ? (
                        <div className="comment-empty">
                            Belum ada diskusi di sini. Jadilah yang pertama berkomentar! 💡
                        </div>
                    ) : (
                        comments.map((comment) => {
                            const commenter = comment.username;
                            const displayName = comment.profiles?.name || commenter;
                            const avatarUrl = comment.profiles?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                            const isCommentAuthor = commenter === loggedInUser;

                            return (
                                <div key={comment.id} className="comment-card">
                                    <img 
                                        src={avatarUrl} 
                                        alt={displayName} 
                                        className="comment-avatar"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                                        }}
                                    />
                                    <div className="comment-body">
                                        <div className="comment-meta">
                                            <span className="comment-user">{displayName}</span>
                                            <span className="comment-time">{formatRelativeTime(comment.created_at)}</span>
                                        </div>
                                        <p className="comment-text">{comment.comment}</p>
                                    </div>
                                    {isCommentAuthor && (
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteComment(comment.id)} 
                                            className="comment-delete"
                                            title="Hapus Komentar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
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
