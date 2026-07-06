'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../components/ToastContext';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

export default function BookmarksPage() {
    const router = useRouter();
    const showToast = useToast();
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
            return;
        }

        const loadBookmarks = async () => {
            if (isSupabaseConfigured) {
                try {
                    const { data, error } = await supabase
                        .from('bookmarks')
                        .select('*, materials(*)')
                        .eq('username', loggedIn);

                    if (error) throw error;

                    const formatted = (data || []).map((b, idx) => {
                        const mat = b.materials;
                        return {
                            id: b.id,
                            kategori: mat.kategori,
                            judul: mat.judul,
                            deskripsi: mat.deskripsi,
                            file_url: mat.file_url,
                            index: idx
                        };
                    });
                    setBookmarks(formatted);
                } catch (err) {
                    console.error("Gagal memuat bookmarks:", err);
                    loadLocal();
                }
            } else {
                loadLocal();
            }
        };

        const loadLocal = () => {
            const items = JSON.parse(localStorage.getItem('bookmarks')) || [];
            setBookmarks(items);
        };

        loadBookmarks();
    }, [router]);

    const handleRemoveBookmark = async (e, b) => {
        e.preventDefault(); // Prevent navigating to the card detail
        e.stopPropagation();

        if (isSupabaseConfigured) {
            try {
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('id', b.id);

                if (error) throw error;
                setBookmarks(prev => prev.filter(item => item.id !== b.id));
                showToast("Bookmark dihapus!");
            } catch (err) {
                console.error("Gagal menghapus bookmark:", err);
                showToast("Gagal menghapus bookmark dari server!", "error");
            }
        } else {
            const updated = bookmarks.filter((item) => !(item.judul === b.judul && item.kategori === b.kategori));
            localStorage.setItem('bookmarks', JSON.stringify(updated));
            setBookmarks(updated);
            showToast("Bookmark dihapus!");
        }
    };

    return (
        <main className="bookmarks-page">
            <div className="bookmarks-container">
                <h2>Materi Disimpan ❤️</h2>

                <div className="materi-list">
                    {bookmarks.length === 0 ? (
                        <p className="materi-empty">Belum ada materi yang kamu simpan.</p>
                    ) : (
                        bookmarks.map((b, idx) => {
                            const encJ = encodeURIComponent(b.judul);
                            const encD = encodeURIComponent(b.deskripsi);
                            return (
                                <Link 
                                    key={idx} 
                                    href={`/materi?kategori=${b.kategori}&index=${b.index}&judul=${encJ}&deskripsi=${encD}`}
                                    style={{ position: 'relative', display: 'block' }}
                                >
                                    <div className="materi-card" style={{ paddingRight: '60px' }}>
                                        <h3>{b.judul}</h3>
                                        <p>{b.deskripsi}</p>
                                        <div className="materi-meta" style={{ marginTop: '8px' }}>
                                            <span className="badge-category">{b.kategori}</span>
                                        </div>

                                        {/* Remove Bookmark direct button */}
                                        <button 
                                            onClick={(e) => handleRemoveBookmark(e, b)}
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                right: '20px',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '8px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 5
                                            }}
                                            title="Hapus dari Bookmark"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                                        </button>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
