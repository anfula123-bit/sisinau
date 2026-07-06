'use client';

import React, { useEffect, useRef } from 'react';

export default function AdsterraBanner() {
    const bannerRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && bannerRef.current) {
            // Check if script is already appended to prevent duplicate loading
            const hasScript = Array.from(bannerRef.current.children).some(child => child.tagName === 'SCRIPT');
            if (hasScript) return;

            // Define configuration key options for Adsterra banner (Leaderboard format 728x90)
            window.atOptions = {
                'key' : '415d862024db4989679f2dc349cfbd6c',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
            };

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '//www.highperformanceformat.com/415d862024db4989679f2dc349cfbd6c/invoke.js';
            script.async = true;

            bannerRef.current.appendChild(script);
        }
    }, []);

    return (
        <div style={{ margin: 'var(--space-md) auto var(--space-lg) auto', display: 'flex', justifyContent: 'center', width: '100%', minHeight: '90px' }}>
            <div ref={bannerRef} id="container-415d862024db4989679f2dc349cfbd6c" style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                {/* Fallback mockup banner visual when script is pending or blocked by AdBlocker */}
                <div style={{
                    width: '100%',
                    maxWidth: '728px',
                    height: '90px',
                    background: 'var(--bg-glass)',
                    border: '1px dashed var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    padding: '0 var(--space-md)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <span style={{ fontWeight: 700, color: 'var(--orange-400)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.2 2h-.4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M19 8h-2c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/><path d="M7 14H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z"/></svg>
                        Iklan Sponsor Adsterra
                    </span>
                    <span>Halaman ini memuat tautan promosi terverifikasi untuk membantu pendanaan Sisinau.</span>
                </div>
            </div>
        </div>
    );
}
