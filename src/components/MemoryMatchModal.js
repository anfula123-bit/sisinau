'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { addXP } from '../utils/gamification';

const MEMORY_PAIRS = [
    { id: 1, content: '2x = 10', matchId: 'x = 5' },
    { id: 2, content: 'x = 5', matchId: '2x = 10' },
    { id: 3, content: 'sin(90°)', matchId: '1' },
    { id: 4, content: '1', matchId: 'sin(90°)' },
    { id: 5, content: '3³', matchId: '27' },
    { id: 6, content: '27', matchId: '3³' },
    { id: 7, content: 'NaCl', matchId: 'Garam' },
    { id: 8, content: 'Garam', matchId: 'NaCl' },
    { id: 9, content: 'H₂O', matchId: 'Air' },
    { id: 10, content: 'Air', matchId: 'H₂O' },
    { id: 11, content: 'CO₂', matchId: 'Karbon Dioksida' },
    { id: 12, content: 'Karbon Dioksida', matchId: 'CO₂' }
];

export default function MemoryMatchModal({ onClose }) {
    const showToast = useToast();
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);

    const initGame = () => {
        // Shuffle the pairs
        const shuffled = [...MEMORY_PAIRS]
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({
                uniqueId: index,
                ...card
            }));
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setGameEnded(false);
    };

    useEffect(() => {
        initGame();
    }, []);

    const handleCardClick = (uniqueId) => {
        if (flipped.length >= 2 || flipped.includes(uniqueId) || matched.includes(uniqueId)) return;

        const newFlipped = [...flipped, uniqueId];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const card1 = cards[newFlipped[0]];
            const card2 = cards[newFlipped[1]];

            if (card1.matchId === card2.content) {
                // Correct Match
                const newMatched = [...matched, newFlipped[0], newFlipped[1]];
                setMatched(newMatched);
                setFlipped([]);

                if (newMatched.length === cards.length) {
                    setGameEnded(true);
                    addXP(50, showToast);
                    showToast("Luar biasa! Semua kartu terpasangkan! +50 XP 🌟");
                }
            } else {
                // Wrong Match - Flip back after delay
                setTimeout(() => {
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-md)'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xl)',
                width: '100%',
                maxWidth: '650px',
                position: 'relative',
                animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: 'var(--shadow-2xl)',
                color: 'var(--text-primary)'
            }}>
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Memory Match Sains & Matematika 🧪
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
                    Pasangkan persamaan atau istilah kimia dengan jawaban/artinya yang benar! (Total langkah Anda: {moves})
                </p>

                {/* Card Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: 'var(--space-lg)'
                }}>
                    {cards.map((card) => {
                        const isFlipped = flipped.includes(card.uniqueId);
                        const isMatched = matched.includes(card.uniqueId);
                        const showContent = isFlipped || isMatched;

                        return (
                            <div
                                key={card.uniqueId}
                                onClick={() => handleCardClick(card.uniqueId)}
                                style={{
                                    height: '80px',
                                    borderRadius: 'var(--radius-md)',
                                    background: isMatched 
                                        ? 'rgba(34, 197, 94, 0.08)' 
                                        : (isFlipped ? 'var(--bg-secondary)' : 'var(--gradient-brand)'),
                                    border: isMatched 
                                        ? '1px solid rgba(34, 197, 94, 0.3)' 
                                        : '1px solid var(--border-glass)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: showContent ? '1rem' : '1.5rem',
                                    fontWeight: 700,
                                    color: isMatched 
                                        ? '#22c55e' 
                                        : (showContent ? 'var(--text-primary)' : '#ffffff'),
                                    cursor: (isMatched || isFlipped) ? 'default' : 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: showContent ? 'rotateY(180deg)' : 'none',
                                    textAlign: 'center',
                                    padding: '4px',
                                    boxShadow: 'var(--shadow-sm)',
                                    userSelect: 'none'
                                }}
                            >
                                <div style={{ transform: showContent ? 'rotateY(180deg)' : 'none' }}>
                                    {showContent ? card.content : '❓'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {gameEnded && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginBottom: 'var(--space-md)' }}>
                            🎉 Selamat! Anda menyelesaikan permainan dalam {moves} langkah!
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button className="btn btn--primary" onClick={initGame} style={{ padding: '10px 24px' }}>
                                Main Lagi 🔄
                            </button>
                            <button className="btn btn--ghost" onClick={onClose} style={{ padding: '10px 24px' }}>
                                Keluar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
