'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastContext';

export default function SettingPage() {
    const router = useRouter();
    const showToast = useToast();

    const [translate, setTranslate] = useState(true);
    const [music, setMusic] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
            return;
        }

        const currentTheme = localStorage.getItem('theme');
        setIsLight(currentTheme === 'light');
    }, [router]);

    const handleThemeChange = (e) => {
        const checked = e.target.checked;
        setIsLight(checked);
        if (checked) {
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.add('light-theme');
            showToast("Tema Terang diaktifkan! ☀️");
        } else {
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.remove('light-theme');
            showToast("Tema Gelap diaktifkan! 🌙");
        }
        window.dispatchEvent(new Event('themeChanged'));
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        // Dispatch custom event to notify Navbar update immediately
        window.dispatchEvent(new Event('userLoginChange'));
        showToast("Berhasil keluar dari Sisinau!");

        setTimeout(() => {
            router.replace('/login');
        }, 800);
    };

    return (
        <main className="settings-page">
            <div className="settings-container">
                <h2>Pengaturan ⚙️</h2>

                <div className="settings-group">
                    <label className="settings-row">
                        <span>Auto Translate</span>
                        <input 
                            type="checkbox" 
                            checked={translate} 
                            onChange={(e) => setTranslate(e.target.checked)}
                            className="toggle" 
                        />
                    </label>

                    <label className="settings-row">
                        <span>Musik</span>
                        <input 
                            type="checkbox" 
                            checked={music} 
                            onChange={(e) => setMusic(e.target.checked)}
                            className="toggle" 
                        />
                    </label>

                    <label className="settings-row">
                        <span>Notifikasi</span>
                        <input 
                            type="checkbox" 
                            checked={notifications} 
                            onChange={(e) => setNotifications(e.target.checked)}
                            className="toggle" 
                        />
                    </label>

                    <label className="settings-row">
                        <span>Tema Terang</span>
                        <input 
                            type="checkbox" 
                            checked={isLight} 
                            onChange={handleThemeChange}
                            className="toggle" 
                        />
                    </label>
                </div>

                <button className="btn--logout" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                    Keluar dari Akun
                </button>
            </div>
        </main>
    );
}
