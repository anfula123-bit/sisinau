'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { useToast } from './ToastContext';

export default function Chatbot() {
    const showToast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [chatCount, setChatCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const chatEndRef = useRef(null);

    const LIMIT_MAX = 5;
    const remainingChats = Math.max(0, LIMIT_MAX - chatCount);

    // Sync logged in user & fetch usage
    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        setUser(loggedIn);
        if (loggedIn) {
            fetchQuota(loggedIn);
            // Load chat history from localStorage
            const savedHistory = localStorage.getItem(`sisinau_chat_history_${loggedIn}`);
            if (savedHistory) {
                try {
                    setMessages(JSON.parse(savedHistory));
                } catch (e) {
                    setMessages([]);
                }
            } else {
                // Welcoming message
                setMessages([
                    {
                        role: 'assistant',
                        content: `Halo **${loggedIn}**! 👋 Selamat datang di Sisinau AI. Saya adalah asisten belajarmu. Tanyakan materi Fisika, Kimia, Biologi, Matematika, atau mata pelajaran lainnya. \n\n*Kuota kamu hari ini: ${LIMIT_MAX} chat.* Ada yang bisa saya bantu?`
                    }
                ]);
            }
        }

        const handleStorageChange = () => {
            const current = localStorage.getItem('loggedInUser');
            setUser(current);
            if (current) {
                fetchQuota(current);
                const savedHistory = localStorage.getItem(`sisinau_chat_history_${current}`);
                if (savedHistory) {
                    try {
                        setMessages(JSON.parse(savedHistory));
                    } catch (e) {
                        setMessages([]);
                    }
                } else {
                    setMessages([
                        {
                            role: 'assistant',
                            content: `Halo **${current}**! 👋 Selamat datang di Sisinau AI. Saya adalah asisten belajarmu. Tanyakan materi Fisika, Kimia, Biologi, Matematika, atau mata pelajaran lainnya. \n\n*Kuota kamu hari ini: ${LIMIT_MAX} chat.* Ada yang bisa saya bantu?`
                        }
                    ]);
                }
            } else {
                setMessages([]);
                setChatCount(0);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoginChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoginChange', handleStorageChange);
        };
    }, []);

    // Scroll to bottom when new messages arrive or chatbot is opened
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isLoading]);

    const fetchQuota = async (username) => {
        if (!username) return;
        const today = new Date().toISOString().split('T')[0];

        // Read local state first
        let localCount = 0;
        const localData = localStorage.getItem(`sisinau_chat_limit_${username}`);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                if (parsed.date === today) {
                    localCount = parsed.count;
                }
            } catch (e) {
                localCount = 0;
            }
        }

        if (isSupabaseConfigured && supabase) {
            try {
                const { data, error } = await supabase
                    .from('chatbot_usage')
                    .select('chat_count')
                    .eq('username', username)
                    .eq('chat_date', today)
                    .maybeSingle();

                if (!error && data) {
                    setChatCount(data.chat_count);
                    localStorage.setItem(`sisinau_chat_limit_${username}`, JSON.stringify({
                        date: today,
                        count: data.chat_count
                    }));
                    return;
                }
            } catch (err) {
                console.error("Gagal sinkronisasi kuota dari Supabase:", err);
            }
        }

        setChatCount(localCount);
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        
        const text = inputValue.trim();
        if (!text) return;
        if (!user) {
            showToast("Silakan login untuk menggunakan chatbot.", "error");
            return;
        }

        // Enforce limit client-side before sending
        if (chatCount >= LIMIT_MAX) {
            showToast("Batas chat harian tercapai! Sisa kuota: 0.", "error");
            return;
        }

        const newUserMessage = { role: 'user', content: text };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setInputValue('');
        setIsLoading(true);

        // Save history in local storage
        localStorage.setItem(`sisinau_chat_history_${user}`, JSON.stringify(updatedMessages));

        // Format date and increment count in client storage as fallback/pessimistic update
        const today = new Date().toISOString().split('T')[0];
        const nextLocalCount = chatCount + 1;
        localStorage.setItem(`sisinau_chat_limit_${user}`, JSON.stringify({
            date: today,
            count: nextLocalCount
        }));

        try {
            // Filter system and clean up messages for API payload
            const apiMessages = updatedMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user,
                    messages: apiMessages
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // If limit reached from API
                if (response.status === 429) {
                    setChatCount(LIMIT_MAX);
                    setMessages(prev => [
                        ...prev,
                        {
                            role: 'assistant',
                            content: "⚠️ **Batas Kuota Harian Tercapai!** Anda telah menggunakan batas maksimum 5 chat untuk hari ini. Silakan kembali lagi esok hari untuk melanjutkan belajar!"
                        }
                    ]);
                    showToast("Batas chat harian tercapai!", "warning");
                } else {
                    showToast(data.error || "Gagal mendapatkan respon dari AI.", "error");
                    // Rollback client limit
                    localStorage.setItem(`sisinau_chat_limit_${user}`, JSON.stringify({
                        date: today,
                        count: chatCount
                    }));
                }
                setIsLoading(false);
                return;
            }

            // Update with response data
            const aiReply = { role: 'assistant', content: data.reply };
            const finalMessages = [...updatedMessages, aiReply];
            setMessages(finalMessages);
            setChatCount(data.chatCount);
            
            // Save final values in local storage
            localStorage.setItem(`sisinau_chat_history_${user}`, JSON.stringify(finalMessages));
            localStorage.setItem(`sisinau_chat_limit_${user}`, JSON.stringify({
                date: today,
                count: data.chatCount
            }));

        } catch (error) {
            console.error(error);
            showToast("Terjadi kesalahan koneksi.", "error");
            // Rollback client limit
            localStorage.setItem(`sisinau_chat_limit_${user}`, JSON.stringify({
                date: today,
                count: chatCount
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (!user) return;
        if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat chat?")) {
            const welcomeMsg = [
                {
                    role: 'assistant',
                    content: `Halo **${user}**! 👋 Selamat datang di Sisinau AI. Saya adalah asisten belajarmu. Tanyakan materi Fisika, Kimia, Biologi, Matematika, atau mata pelajaran lainnya. \n\n*Kuota kamu hari ini: ${LIMIT_MAX} chat.* Ada yang bisa saya bantu?`
                }
            ];
            setMessages(welcomeMsg);
            localStorage.removeItem(`sisinau_chat_history_${user}`);
        }
    };

    // Parse simple markdown-like formatting for display (bold & lists & code)
    const formatMessage = (content) => {
        if (!content) return '';
        
        // Simple bold parser **text** -> <strong>text</strong>
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Simple italic / emphasis *text* -> <em>text</em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Split lines to detect code block or list items
        const lines = formatted.split('\n');
        let inList = false;
        const result = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            
            // Check for list item starting with - or *
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                if (!inList) {
                    inList = true;
                    result.push('<ul class="chat-list">');
                }
                result.push(`<li>${trimmed.substring(2)}</li>`);
            } else {
                if (inList) {
                    inList = false;
                    result.push('</ul>');
                }
                
                // Check if line is empty for paragraph spacing
                if (trimmed === '') {
                    result.push('<div class="chat-spacing"></div>');
                } else {
                    result.push(`<p>${line}</p>`);
                }
            }
        });

        if (inList) {
            result.push('</ul>');
        }

        return <div dangerouslySetInnerHTML={{ __html: result.join('') }} />;
    };

    return (
        <div className="chatbot-wrapper">
            {/* Chatbot Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header__info">
                            <div className="chat-header__avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 8V4H8" />
                                    <rect width="16" height="12" x="4" y="8" rx="2" />
                                    <path d="M2 14h2" />
                                    <path d="M20 14h2" />
                                    <path d="M15 13v2" />
                                    <path d="M9 13v2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="chat-header__title">Sisinau AI</h3>
                                <span className="chat-header__status">Online • Asisten Belajar</span>
                            </div>
                        </div>
                        
                        <div className="chat-header__actions">
                            {user && messages.length > 1 && (
                                <button className="chat-header__btn" onClick={handleReset} title="Hapus Riwayat Chat">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                                    </svg>
                                </button>
                            )}
                            <button className="chat-header__btn" onClick={() => setIsOpen(false)} title="Tutup Chat">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Quota display */}
                    {user && (
                        <div className="chat-quota">
                            <span className="chat-quota__text">
                                Kuota Chat Hari Ini: <strong>{remainingChats}/{LIMIT_MAX}</strong> tersisa
                            </span>
                            <div className="chat-quota__bar">
                                <div 
                                    className={`chat-quota__progress ${remainingChats <= 1 ? 'critical' : remainingChats <= 3 ? 'warning' : ''}`}
                                    style={{ width: `${(remainingChats / LIMIT_MAX) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className="chat-messages">
                        {!user ? (
                            <div className="chat-guest-state">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="guest-icon">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <p>Silakan login terlebih dahulu untuk mulai bertanya dengan Sisinau AI.</p>
                                <a href="/login" className="chat-login-btn">Masuk Akun</a>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <div key={index} className={`chat-message-bubble ${msg.role}`}>
                                        <div className="bubble-content">
                                            {formatMessage(msg.content)}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="chat-message-bubble assistant loading">
                                        <div className="bubble-content">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    {user && (
                        <form className="chat-input-area" onSubmit={handleSend}>
                            <input
                                type="text"
                                className="chat-input"
                                placeholder={chatCount >= LIMIT_MAX ? "Batas chat tercapai hari ini." : "Tanyakan sesuatu..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading || chatCount >= LIMIT_MAX}
                            />
                            <button 
                                type="submit" 
                                className="chat-send-btn" 
                                disabled={isLoading || !inputValue.trim() || chatCount >= LIMIT_MAX}
                                aria-label="Kirim Pesan"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <button 
                className={`chatbot-fab ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Tanya AI Sisinau"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fab-icon">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fab-icon">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {!isOpen && user && chatCount < LIMIT_MAX && (
                            <span className="fab-badge" title="Kuota sisa chat hari ini">
                                {remainingChats}
                            </span>
                        )}
                    </>
                )}
            </button>
        </div>
    );
}
