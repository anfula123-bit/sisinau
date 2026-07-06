'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            router.replace('/home');
        } else {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifycontent: 'center',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)'
        }}>
            <p>Memuat Sisinau...</p>
        </div>
    );
}
