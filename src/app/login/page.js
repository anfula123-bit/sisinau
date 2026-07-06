'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../components/ToastContext';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

export default function LoginPage() {
    const router = useRouter();
    const showToast = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // Redirection if already logged in
        if (localStorage.getItem('loggedInUser')) {
            router.replace('/home');
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedUser = username.trim();

        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', trimmedUser)
                    .single();

                if (error || !data) {
                    showToast("Akun tidak ditemukan!", "error");
                    return;
                }

                if (data.password !== password) {
                    showToast("Password salah!", "error");
                    return;
                }
            } catch (err) {
                console.error(err);
                showToast("Terjadi kesalahan koneksi database!", "error");
                return;
            }
        } else {
            const storedData = localStorage.getItem("user_" + trimmedUser);

            if (!storedData) {
                showToast("Akun tidak ditemukan!", "error");
                return;
            }

            const user = JSON.parse(storedData);

            if (user.password !== password) {
                showToast("Password salah!", "error");
                return;
            }
        }

        localStorage.setItem("loggedInUser", trimmedUser);
        window.dispatchEvent(new Event('userLoginChange'));
        showToast("Login berhasil! Selamat datang.");
        
        setTimeout(() => {
            router.replace('/home');
        }, 800);
    };

    return (
        <main className="auth-container">
            <div className="auth-card">
                <h2>Selamat Datang 👋</h2>
                <p className="auth-subtitle">Masuk ke akun Sisinau kamu</p>

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
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="auth-links">
                        <a href="#">Lupa Password?</a>
                        <Link href="/register">
                            Belum punya akun? <strong>Daftar</strong>
                        </Link>
                    </div>

                    <button type="submit" className="btn btn--primary" style={{ marginTop: '8px' }}>Masuk</button>
                </form>
            </div>
        </main>
    );
}
