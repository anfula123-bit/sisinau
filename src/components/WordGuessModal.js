'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { addXP } from '../utils/gamification';

const WORD_GUESS_LIST = [
    { word: 'FOTOSINTESIS', category: 'Biologi', clue: 'Proses tumbuhan menghasilkan energi menggunakan cahaya matahari.' },
    { word: 'MITOKONDRIA', category: 'Biologi', clue: 'Organel sel yang berfungsi sebagai tempat respirasi sel dan penghasil energi.' },
    { word: 'GRAVITASI', category: 'Fisika', clue: 'Gaya tarik-menarik antara semua partikel bermuatan massa di alam semesta.' },
    { word: 'ELEKTRON', category: 'Kimia', clue: 'Subpartikel atom bermuatan negatif yang mengitari inti atom.' },
    { word: 'INFLASI', category: 'Ekonomi', clue: 'Kondisi kenaikan harga barang secara umum dan terus menerus.' },
    { word: 'KARTOGRAFI', category: 'Geografi', clue: 'Studi dan praktik pembuatan peta atau atlas bumi.' },
    { word: 'ALJABAR', category: 'Matematika', clue: 'Cabang matematika yang memecahkan masalah menggunakan huruf atau simbol.' },
    { word: 'KROMOSOM', category: 'Biologi', clue: 'Struktur pembawa gen dalam inti sel makhluk hidup.' },
    { word: 'REBOISASI', category: 'Geografi', clue: 'Penanaman kembali hutan yang telah gundul.' }
];

export default function WordGuessModal({ onClose }) {
    const showToast = useToast();
    
    const [game, setGame] = useState({
        word: '',
        category: '',
        clue: '',
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrong: 6,
        status: 'playing' // 'playing' | 'won' | 'lost'
    });

    const initNewGame = () => {
        const randomIndex = Math.floor(Math.random() * WORD_GUESS_LIST.length);
        const selected = WORD_GUESS_LIST[randomIndex];
        setGame({
            word: selected.word.toUpperCase(),
            category: selected.category,
            clue: selected.clue,
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrong: 6,
            status: 'playing'
        });
    };

    useEffect(() => {
        initNewGame();
    }, []);

    const handleGuess = (letter) => {
        if (game.status !== 'playing' || game.guessedLetters.includes(letter)) return;

        const isCorrect = game.word.includes(letter);
        const updatedGuesses = [...game.guessedLetters, letter];
        const newWrong = isCorrect ? game.wrongGuesses : game.wrongGuesses + 1;

        let newStatus = 'playing';
        if (newWrong >= game.maxWrong) {
            newStatus = 'lost';
            showToast("Sayang sekali! Kesempatan Anda habis.", "error");
        } else {
            // Check if all letters guessed
            const allGuessed = [...game.word].every(char => updatedGuesses.includes(char));
            if (allGuessed) {
                newStatus = 'won';
                addXP(50, showToast);
                showToast("Hebat! Anda berhasil menjawab kata rahasia! +50 XP 🌟");
            }
        }

        setGame(prev => ({
            ...prev,
            guessedLetters: updatedGuesses,
            wrongGuesses: newWrong,
            status: newStatus
        }));
    };

    // Render placeholder letters
    const renderWordState = () => {
        return [...game.word].map((char, index) => {
            const revealed = game.guessedLetters.includes(char) || game.status === 'lost';
            return (
                <span 
                    key={index} 
                    style={{
                        display: 'inline-block',
                        width: '32px',
                        height: '40px',
                        borderBottom: '3px solid var(--orange-500)',
                        margin: '0 4px',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        color: game.status === 'lost' && !game.guessedLetters.includes(char) ? '#ef4444' : 'var(--text-primary)'
                    }}
                >
                    {revealed ? char : '_'}
                </span>
            );
        });
    };

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
                maxWidth: '600px',
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

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Tebak Kata Sains 🔠
                </h2>

                <div style={{
                    background: 'rgba(249, 115, 22, 0.08)',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    marginBottom: 'var(--space-lg)'
                }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--orange-400)', fontWeight: 700 }}>
                        Kategori: {game.category}
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        💡 {game.clue}
                    </p>
                </div>

                {/* Hearts / Remaining Tries */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '8px' }}>Sisa Nyawa:</span>
                    {Array.from({ length: game.maxWrong - game.wrongGuesses }).map((_, i) => (
                        <span key={i} style={{ fontSize: '1.25rem', color: '#ef4444', margin: '0 2px' }}>❤️</span>
                    ))}
                    {Array.from({ length: game.wrongGuesses }).map((_, i) => (
                        <span key={i} style={{ fontSize: '1.25rem', color: 'var(--text-muted)', margin: '0 2px', opacity: 0.3 }}>🖤</span>
                    ))}
                </div>

                {/* Guessed Letters Display */}
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--space-xl)' }}>
                    {renderWordState()}
                </div>

                {/* On-screen Keyboard */}
                {game.status === 'playing' ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '6px',
                        justifyContent: 'center'
                    }}>
                        {alphabet.map((letter) => {
                            const isGuessed = game.guessedLetters.includes(letter);
                            const isCorrect = game.word.includes(letter);
                            
                            let btnBg = 'var(--bg-secondary)';
                            let btnColor = 'var(--text-primary)';
                            let border = '1px solid var(--border-glass)';
                            
                            if (isGuessed) {
                                btnBg = isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                                btnColor = isCorrect ? '#22c55e' : '#ef4444';
                                border = isCorrect ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)';
                            }

                            return (
                                <button
                                    key={letter}
                                    onClick={() => handleGuess(letter)}
                                    disabled={isGuessed}
                                    style={{
                                        height: '42px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: btnBg,
                                        color: btnColor,
                                        border: border,
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        cursor: isGuessed ? 'default' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: game.status === 'won' ? '#22c55e' : '#ef4444', marginBottom: 'var(--space-md)' }}>
                            {game.status === 'won' ? '🎉 Selamat, Kamu Menang!' : '😢 Kamu Kalah! Kata yang benar: ' + game.word}
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button className="btn btn--primary" onClick={initNewGame} style={{ padding: '10px 24px' }}>
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
