'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [avatar, setAvatar] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');

    useEffect(() => {
        // Read user & avatar from localStorage on mount
        const loggedIn = localStorage.getItem('loggedInUser');
        setUser(loggedIn);
        if (loggedIn) {
            const savedAvatar = localStorage.getItem('profile_avatar_' + loggedIn);
            if (savedAvatar) setAvatar(savedAvatar);
        }

        // Handle logout trigger or check storage periodically
        const handleStorageChange = () => {
            const current = localStorage.getItem('loggedInUser');
            setUser(current);
            if (current) {
                const savedAvatar = localStorage.getItem('profile_avatar_' + current);
                setAvatar(savedAvatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoginChange', handleStorageChange);
        window.addEventListener('userAvatarChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoginChange', handleStorageChange);
            window.removeEventListener('userAvatarChange', handleStorageChange);
        };
    }, []);

    // Auth pages don't show the standard navbar, or they show a simplified version
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return (
            <nav className="navbar">
                <div className="navbar__brand">
                    <h1>Sisinau</h1>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <div className="navbar__brand">
                <Link href="/home">
                    <h1>Sisinau</h1>
                </Link>
            </div>

            {user && (
                <Link href="/profil" className="navbar__user">
                    <img src={avatar} alt="Avatar" />
                    <span>{user}</span>
                </Link>
            )}

            <div className="navbar__actions">
                <Link href="/search" className={`navbar__icon-btn ${pathname === '/search' ? 'active' : ''}`} title="Cari Materi">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                </Link>
                <Link href="/permainan" className={`navbar__icon-btn ${pathname === '/permainan' ? 'active' : ''}`} title="Permainan">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="3"/></svg>
                </Link>
                <Link href="/bookmarks" className={`navbar__icon-btn ${pathname === '/bookmarks' ? 'active' : ''}`} title="Materi Disimpan">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </Link>
                <Link href="/setting" className={`navbar__icon-btn ${pathname === '/setting' ? 'active' : ''}`} title="Pengaturan">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </Link>
            </div>
        </nav>
    );
}
