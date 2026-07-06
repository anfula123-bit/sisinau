'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../components/ToastContext';
import { BADGES } from '../../utils/gamification';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

export default function ProfilPage() {
    const router = useRouter();
    const showToast = useToast();
    
    const [user, setUser] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [xp, setXp] = useState(0);
    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [avatar, setAvatar] = useState('/images/profil.webp');
    const [tempAvatar, setTempAvatar] = useState('/images/profil.webp');
    const [profile, setProfile] = useState({
        name: '',
        birthDate: '12 Oktober 2005',
        address: 'Jakarta, Indonesia',
        bio: 'Pelajar yang antusias belajar sains dan pemrograman di Sisinau.'
    });

    const [stats, setStats] = useState({
        quizzesCompleted: 0,
        averageScore: 0,
        bookmarksCount: 0,
        uploadsCount: 0
    });

    const [uploadedMaterials, setUploadedMaterials] = useState([]);

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
            return;
        }
        setUser(loggedIn);

        const loadProfileData = async () => {
            if (isSupabaseConfigured) {
                try {
                    // Fetch profile
                    const { data: profData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('username', loggedIn)
                        .maybeSingle();

                    if (profData) {
                        setProfile({
                            name: profData.name || loggedIn,
                            birthDate: profData.birth_date || '12 Oktober 2005',
                            address: profData.address || 'Jakarta, Indonesia',
                            bio: profData.bio || 'Pelajar yang antusias belajar sains dan pemrograman di Sisinau.'
                        });
                        if (profData.avatar_url) {
                            setAvatar(profData.avatar_url);
                            setTempAvatar(profData.avatar_url);
                            localStorage.setItem('profile_avatar_' + loggedIn, profData.avatar_url);
                            window.dispatchEvent(new Event('userAvatarChange'));
                        }
                        setXp(profData.xp || 0);
                    } else {
                        // Insert standard profile if none exists
                        await supabase.from('profiles').insert({ username: loggedIn, name: loggedIn });
                        setProfile(prev => ({ ...prev, name: loggedIn }));
                    }

                    // Fetch badges
                    const { data: badgeData } = await supabase
                        .from('user_badges')
                        .select('badge_id')
                        .eq('username', loggedIn);
                    setUnlockedBadges((badgeData || []).map(b => b.badge_id));

                    // Fetch statistics
                    const { data: qStats } = await supabase
                        .from('quiz_stats')
                        .select('*')
                        .eq('username', loggedIn)
                        .maybeSingle();
                    
                    const qCompleted = qStats ? qStats.completed : 0;
                    const qTotalScore = qStats ? qStats.total_score : 0;
                    const avg = qCompleted > 0 ? Math.round(qTotalScore / qCompleted) : 0;

                    const { count: bookmarksCount } = await supabase
                        .from('bookmarks')
                        .select('*', { count: 'exact', head: true })
                        .eq('username', loggedIn);

                    const { count: uploadsCount } = await supabase
                        .from('materials')
                        .select('*', { count: 'exact', head: true })
                        .eq('uploaded_by', loggedIn);

                    setStats({
                        quizzesCompleted: qCompleted,
                        averageScore: avg,
                        bookmarksCount: bookmarksCount || 0,
                        uploadsCount: uploadsCount || 0
                    });

                    // Fetch uploaded materials
                    const { data: uploads } = await supabase
                        .from('materials')
                        .select('*')
                        .eq('uploaded_by', loggedIn)
                        .order('id', { ascending: true });

                    const formattedUploads = (uploads || []).map((m, idx) => ({
                        ...m,
                        index: idx
                    }));
                    setUploadedMaterials(formattedUploads);

                } catch (err) {
                    console.error("Gagal memuat profil dari Supabase:", err);
                    loadLocal();
                }
            } else {
                loadLocal();
            }
        };

        const loadLocal = () => {
            const savedProfile = JSON.parse(localStorage.getItem('profile_' + loggedIn));
            if (savedProfile) {
                setProfile(savedProfile);
            } else {
                setProfile(prev => ({ ...prev, name: loggedIn }));
            }

            const savedAvatar = localStorage.getItem('profile_avatar_' + loggedIn);
            if (savedAvatar) {
                setAvatar(savedAvatar);
                setTempAvatar(savedAvatar);
            }

            const userXp = parseInt(localStorage.getItem('userXp') || '0', 10);
            setXp(userXp);
            const badges = JSON.parse(localStorage.getItem('unlockedBadges')) || [];
            setUnlockedBadges(badges);

            const quizStats = JSON.parse(localStorage.getItem('quizStats')) || { completed: 0, totalScore: 0 };
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            const customMateri = JSON.parse(localStorage.getItem('customMateri')) || {};

            let uploadsCount = 0;
            Object.values(customMateri).forEach((list) => {
                uploadsCount += list.length;
            });

            const avgScore = quizStats.completed > 0 
                ? Math.round(quizStats.totalScore / quizStats.completed) 
                : 0;

            setStats({
                quizzesCompleted: quizStats.completed,
                averageScore: avgScore,
                bookmarksCount: bookmarks.length,
                uploadsCount: uploadsCount
            });

            // Load uploaded materials from local fallback
            const custom = JSON.parse(localStorage.getItem('customMateri')) || {};
            let list = [];
            Object.entries(custom).forEach(([cat, items]) => {
                items.forEach((item, idx) => {
                    if (item.uploadedBy === loggedIn || !item.uploadedBy) {
                        list.push({ ...item, kategori: cat, index: idx });
                    }
                });
            });
            setUploadedMaterials(list);
        };

        loadProfileData();
    }, [router]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast("Berkas harus berupa gambar!", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        if (!isEditing) return;
        document.getElementById('avatarUpload').click();
    };

    const handleSave = async () => {
        if (!profile.name.trim()) {
            showToast("Nama tidak boleh kosong!", "error");
            return;
        }

        if (isSupabaseConfigured) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        name: profile.name.trim(),
                        birth_date: profile.birthDate,
                        address: profile.address,
                        bio: profile.bio,
                        avatar_url: tempAvatar
                    })
                    .eq('username', user);

                if (error) throw error;
            } catch (err) {
                console.error("Gagal menyimpan profil ke Supabase:", err);
                showToast("Gagal menyimpan data ke database server!", "error");
                return;
            }
        }

        // Save to localStorage
        localStorage.setItem('profile_' + user, JSON.stringify(profile));
        localStorage.setItem('profile_avatar_' + user, tempAvatar);
        setAvatar(tempAvatar);

        // If the name changed, update the loggedInUser key as well
        if (profile.name.trim() !== user) {
            const oldUser = user;
            const newUser = profile.name.trim();
            
            if (isSupabaseConfigured) {
                try {
                    const { error } = await supabase
                        .from('users')
                        .update({ username: newUser })
                        .eq('username', oldUser);
                    if (error) throw error;
                } catch (err) {
                    console.error("Gagal merubah username di database:", err);
                    showToast("Gagal mengubah username di database server!", "error");
                    return;
                }
            }

            // Move credentials from user_old to user_new
            const credentials = localStorage.getItem('user_' + oldUser);
            if (credentials) {
                localStorage.setItem('user_' + newUser, credentials);
                localStorage.removeItem('user_' + oldUser);
            }
            
            // Move avatar
            const savedAv = localStorage.getItem('profile_avatar_' + oldUser);
            if (savedAv) {
                localStorage.setItem('profile_avatar_' + newUser, savedAv);
                localStorage.removeItem('profile_avatar_' + oldUser);
            }

            localStorage.setItem('loggedInUser', newUser);
            setUser(newUser);
            
            // Sync with other pages/navbar
            window.dispatchEvent(new Event('userLoginChange'));
        }

        window.dispatchEvent(new Event('userAvatarChange'));
        setIsEditing(false);
        showToast("Profil berhasil diperbarui! ✨");
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        window.dispatchEvent(new Event('userLoginChange'));
        showToast("Berhasil keluar dari Sisinau!");

        setTimeout(() => {
            router.replace('/login');
        }, 800);
    };

    const level = Math.floor(xp / 200) + 1;
    const progressXp = xp % 200;

    return (
        <main className="profile-page">
            <div className="profile-container">
                <div className="profile-card">
                    {/* Avatar Wrapper (Clickable in edit mode) */}
                    <div 
                        className="profile-avatar-wrapper" 
                        onClick={triggerFileInput}
                        style={{ cursor: isEditing ? 'pointer' : 'default' }}
                    >
                        <img src={isEditing ? tempAvatar : avatar} alt="Profile Picture" className="profile-avatar" />
                        {isEditing && (
                            <div className="profile-avatar-overlay">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                            </div>
                        )}
                        <input 
                            type="file" 
                            id="avatarUpload" 
                            accept="image/*" 
                            onChange={handleAvatarChange}
                            hidden 
                        />
                    </div>

                    {!isEditing ? (
                        <>
                            <div className="profile-info">
                                <div className="profile-row">
                                    <span className="profile-row__label">Nama</span>
                                    <span className="profile-row__value">{profile.name || user}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-row__label">Tanggal Lahir</span>
                                    <span className="profile-row__value">{profile.birthDate}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-row__label">Alamat</span>
                                    <span className="profile-row__value">{profile.address}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-row__label">Biografi</span>
                                    <span className="profile-row__value">{profile.bio}</span>
                                </div>
                            </div>

                            {/* Level and XP Progress Bar */}
                            <div className="profile-xp-container">
                                <div className="profile-xp-header">
                                    <span className="profile-xp-header__level">Level {level}</span>
                                    <span className="profile-xp-header__val">{progressXp} / 200 XP</span>
                                </div>
                                <div className="profile-xp-bar">
                                    <div 
                                        className="profile-xp-bar__inner" 
                                        style={{ width: `${(progressXp / 200) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <button 
                                className="btn btn--ghost" 
                                style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                                onClick={() => setIsEditing(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                Edit Profil
                            </button>

                            <button 
                                className="btn--logout" 
                                style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                                onClick={handleLogout}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                                Keluar Akun
                            </button>
                        </>
                    ) : (
                        <div className="profile-info" style={{ width: '100%', textAlign: 'left' }}>
                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="form-label">Nama</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={profile.name} 
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="form-label">Tanggal Lahir</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={profile.birthDate} 
                                    onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="form-label">Alamat</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={profile.address} 
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="form-label">Biografi</label>
                                <textarea 
                                    className="form-input" 
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                    value={profile.bio} 
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <button 
                                    className="btn btn--primary" 
                                    style={{ flex: 1 }}
                                    onClick={handleSave}
                                >
                                    Simpan
                                </button>
                                <button 
                                    className="btn btn--ghost" 
                                    style={{ flex: 1 }}
                                    onClick={() => {
                                        setTempAvatar(avatar);
                                        // Reset to last saved
                                        const saved = JSON.parse(localStorage.getItem('profile_' + user));
                                        if (saved) setProfile(saved);
                                        setIsEditing(false);
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Study Statistics Grid */}
                <h3 style={{ margin: 'var(--space-xl) 0 var(--space-sm) 0', fontFamily: 'Outfit' }}>Statistik Belajar 📊</h3>
                <div className="profile-stats-grid">
                    <div className="profile-stat-card">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        <div className="profile-stat-card__val">{stats.quizzesCompleted}</div>
                        <div className="profile-stat-card__lbl">Kuis Selesai</div>
                    </div>
                    
                    <div className="profile-stat-card">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                        <div className="profile-stat-card__val">{stats.averageScore}%</div>
                        <div className="profile-stat-card__lbl">Rata-rata Skor</div>
                    </div>

                    <div className="profile-stat-card">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                        <div className="profile-stat-card__val">{stats.bookmarksCount}</div>
                        <div className="profile-stat-card__lbl">Materi Disimpan</div>
                    </div>

                    <div className="profile-stat-card">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        <div className="profile-stat-card__val">{stats.uploadsCount}</div>
                        <div className="profile-stat-card__lbl">Materi Diupload</div>
                    </div>
                </div>

                {/* Achievements / Badges Grid (FITUR BARU) */}
                <h3 style={{ margin: 'var(--space-xl) 0 var(--space-sm) 0', fontFamily: 'Outfit' }}>Lencana Prestasi 🏅</h3>
                <div className="profile-badges-grid">
                    {Object.values(BADGES).map((badge) => {
                        const isUnlocked = unlockedBadges.includes(badge.id);
                        return (
                            <div 
                                key={badge.id} 
                                className={`profile-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                                title={isUnlocked ? `Terbuka: ${badge.desc}` : `Terkunci: ${badge.desc}`}
                            >
                                <span className="profile-badge-icon">
                                    {badge.id === 'PEMBERANI' && '🛡️'}
                                    {badge.id === 'PENJELAJAH' && '🧭'}
                                    {badge.id === 'KONTRIBUTOR' && '📤'}
                                    {badge.id === 'CENDEKIAWAN' && '🎓'}
                                </span>
                                <div className="profile-badge-info">
                                    <h4>{badge.name}</h4>
                                    <p>{badge.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Materi yang Diunggah Section */}
                {!isEditing && (
                    <div className="profile-section" style={{ marginTop: 'var(--space-xl)', textAlign: 'left' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-sm)', fontFamily: 'Outfit', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            Materi yang Diunggah 📤
                        </h3>
                        {uploadedMaterials.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>Belum ada materi yang Anda unggah.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {uploadedMaterials.map((m, i) => (
                                    <Link 
                                        key={i} 
                                        href={`/materi?kategori=${m.kategori}&index=${m.index ?? i}&judul=${encodeURIComponent(m.judul)}&deskripsi=${encodeURIComponent(m.deskripsi)}`}
                                        style={{ display: 'block', textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--space-md)',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'all var(--transition-normal)',
                                            cursor: 'pointer'
                                        }} className="profile-uploaded-item">
                                            <div style={{ textAlign: 'left' }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--orange-400)', margin: 0 }}>{m.judul}</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{m.deskripsi}</p>
                                            </div>
                                            <span className="badge-category" style={{ fontSize: '0.75rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-full)', padding: '2px 8px', color: 'var(--text-secondary)' }}>
                                                {m.kategori}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!isEditing && (
                    <Link href="/home" style={{ display: 'block', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
                        <button className="btn btn--primary" style={{ width: '100%' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                            Kembali Ke Beranda
                        </button>
                    </Link>
                )}
            </div>
        </main>
    );
}
