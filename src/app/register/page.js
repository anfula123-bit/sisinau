'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../components/ToastContext';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

export default function RegisterPage() {
    const router = useRouter();
    const showToast = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strength, setStrength] = useState({ width: '0%', bg: 'transparent' });

    useEffect(() => {
        if (localStorage.getItem('loggedInUser')) {
            router.replace('/home');
        }
    }, [router]);

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);

        const len = val.length;
        if (len === 0) {
            setStrength({ width: '0%', bg: 'transparent' });
        } else if (len < 4) {
            setStrength({ width: '25%', bg: '#ef4444' }); // Red
        } else if (len < 6) {
            setStrength({ width: '50%', bg: '#f59e0b' }); // Orange
        } else if (len < 8) {
            setStrength({ width: '75%', bg: '#3b82f6' }); // Blue
        } else {
            setStrength({ width: '100%', bg: '#22c55e' }); // Green
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedUser = username.trim();

        if (!trimmedUser || !password || !confirmPassword) {
            showToast("Isi semua kolom!", "error");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Password tidak sama!", "error");
            return;
        }

        if (isSupabaseConfigured) {
            try {
                // Check if user already exists
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('username')
                    .eq('username', trimmedUser)
                    .maybeSingle();

                if (existingUser) {
                    showToast("Username sudah digunakan!", "error");
                    return;
                }

                // Insert into users
                const { error: userError } = await supabase
                    .from('users')
                    .insert({ username: trimmedUser, password });

                if (userError) {
                    showToast("Gagal mendaftarkan akun!", "error");
                    return;
                }

                // Insert profile entry
                await supabase
                    .from('profiles')
                    .insert({ username: trimmedUser, name: trimmedUser });
                
                // Insert initial quiz stats
                await supabase
                    .from('quiz_stats')
                    .insert({ username: trimmedUser });

            } catch (err) {
                console.error(err);
                showToast("Terjadi kesalahan database!", "error");
                return;
            }
        } else {
            // Check if user already exists in localStorage
            if (localStorage.getItem("user_" + trimmedUser)) {
                showToast("Username sudah digunakan!", "error");
                return;
            }
            // Save account details
            localStorage.setItem("user_" + trimmedUser, JSON.stringify({ username: trimmedUser, password }));
        }

        showToast("Akun berhasil dibuat! Mengalihkan ke login...");

        setTimeout(() => {
            router.replace('/login');
        }, 1000);
    };

    return (
        <main className="auth-container">
            <div className="auth-card">
                <h2>Buat Akun ✨</h2>
                <p className="auth-subtitle">Daftar dan mulai belajar sekarang</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div className="form-input-wrapper">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Masukkan username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="form-input-wrapper">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="Masukkan password" 
                                value={password}
                                onChange={handlePasswordChange}
                                required 
                            />
                        </div>
                        {/* Password strength bar */}
                        <div style={{ height: '4px', borderRadius: '4px', background: 'var(--bg-card)', overflow: 'hidden', marginTop: '4px' }}>
                            <div style={{ height: '100%', width: strength.width, background: strength.bg, borderRadius: '4px', transition: 'all 0.3s ease' }}></div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ulangi Password</label>
                        <div className="form-input-wrapper">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="Ulangi password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn--primary" style={{ marginTop: '8px' }}>Daftar</button>

                    <div className="auth-divider">
                        <span>atau</span>
                    </div>

                    <button type="button" className="btn btn--google">
                        <img src="/images/google.png" alt="Google" />
                        Daftar dengan Google
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Sudah punya akun? <Link href="/login" style={{ color: 'var(--orange-400)', fontWeight: 600 }}>Masuk</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
