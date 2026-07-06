'use client';

import React, { useState } from 'react';
import { useToast } from './ToastContext';
import { addXP, unlockBadge } from '../utils/gamification';

const QUESTIONS_BANK = {
    "Fisika": [
        {
            q: "Apa rumus dasar untuk menghitung kecepatan?",
            options: ["v = s * t", "v = s / t", "v = t / s", "v = m * a"],
            correct: 1
        },
        {
            q: "Fenomena partikel menembus penghalang energi potensial disebut...",
            options: ["Quantum Leap", "Quantum Tunneling", "Superposisi", "Relativitas"],
            correct: 1
        },
        {
            q: "Siapa ilmuwan yang mengemukakan teori relativitas?",
            options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Max Planck"],
            correct: 1
        }
    ],
    "Kimia": [
        {
            q: "Ikatan yang terbentuk akibat serah terima elektron disebut ikatan...",
            options: ["Kovalen", "Logam", "Ion", "Hidrogen"],
            correct: 2
        },
        {
            q: "Dalam reaksi redoks, peristiwa reduksi ditandai dengan...",
            options: ["Kenaikan biloks", "Pelepasan elektron", "Penurunan biloks", "Penerimaan proton"],
            correct: 2
        }
    ],
    "Biologi": [
        {
            q: "Organel sel yang berfungsi sebagai tempat respirasi seluler adalah...",
            options: ["Ribosom", "Mitokondria", "Lisosom", "Kloroplas"],
            correct: 1
        },
        {
            q: "Proses pencernaan kimiawi protein pertama kali terjadi di...",
            options: ["Mulut", "Lambung", "Usus Halus", "Usus Besar"],
            correct: 1
        }
    ],
    "Matematika": [
        {
            q: "Jika 2x + 5 = 15, berapakah nilai x?",
            options: ["5", "10", "15", "2.5"],
            correct: 0
        },
        {
            q: "Berapakah nilai dari sin(90 derajat)?",
            options: ["0", "0.5", "1", "sqrt(3)/2"],
            correct: 2
        }
    ],
    "Default": [
        {
            q: "Apa singkatan dari nama platform Sisinau?",
            options: ["Siswa Siap Belajar", "Sistem Informasi Sinau", "Mari Sinau Bersama", "Sinau Online"],
            correct: 1
        }
    ]
};

export default function QuizModal({ kategori, onClose }) {
    const showToast = useToast();
    const questions = QUESTIONS_BANK[kategori] || QUESTIONS_BANK["Default"];
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);

    const currentQuestion = questions[currentIdx];

    const handleSelectOption = (idx) => {
        if (answered) return;
        setSelectedOpt(idx);
    };

    const handleConfirmAnswer = () => {
        if (selectedOpt === null || answered) return;
        
        setAnswered(true);
        const isCorrect = selectedOpt === currentQuestion.correct;
        if (isCorrect) {
            setCorrectCount((prev) => prev + 1);
            showToast("Jawaban kamu benar! 🎉", "success");
        } else {
            showToast("Jawaban kamu kurang tepat. 😢", "error");
        }
    };

    const handleNext = () => {
        if (currentIdx + 1 < questions.length) {
            setCurrentIdx((prev) => prev + 1);
            setSelectedOpt(null);
            setAnswered(false);
        } else {
            // Save results to stats
            const finalScore = Math.round((correctCount / questions.length) * 100);
            saveQuizStats(finalScore);
            setFinished(true);
        }
    };

    const saveQuizStats = (score) => {
        const stats = JSON.parse(localStorage.getItem('quizStats')) || { completed: 0, totalScore: 0 };
        stats.completed += 1;
        stats.totalScore += score;
        localStorage.setItem('quizStats', JSON.stringify(stats));
        
        // Award XP & Check Badges
        addXP(50, showToast);
        unlockBadge("PEMBERANI", showToast);
        if (score === 100) {
            unlockBadge("CENDEKIAWAN", showToast);
        }

        // Dispatch custom event to notify profile page
        window.dispatchEvent(new Event('quizStatsUpdated'));
    };

    return (
        <div className="quiz-overlay">
            <div className="quiz-card">
                <button className="quiz-close" onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                </button>

                {!finished ? (
                    <>
                        <h2>Kuis {kategori} 🧠</h2>
                        <div className="quiz-progress">
                            Pertanyaan {currentIdx + 1} dari {questions.length}
                        </div>
                        <div className="quiz-progress-bar">
                            <div 
                                className="quiz-progress-bar__inner" 
                                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="quiz-question">
                            {currentQuestion.q}
                        </div>

                        <div className="quiz-options">
                            {currentQuestion.options.map((opt, i) => {
                                let btnClass = "";
                                if (answered) {
                                    if (i === currentQuestion.correct) btnClass = "correct";
                                    else if (i === selectedOpt) btnClass = "wrong";
                                } else if (i === selectedOpt) {
                                    btnClass = "selected";
                                }

                                return (
                                    <button 
                                        key={i} 
                                        className={`quiz-option-btn ${btnClass}`}
                                        onClick={() => handleSelectOption(i)}
                                        disabled={answered}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="quiz-actions">
                            {!answered ? (
                                <button 
                                    className="btn btn--primary" 
                                    onClick={handleConfirmAnswer}
                                    disabled={selectedOpt === null}
                                >
                                    Jawab
                                </button>
                            ) : (
                                <button className="btn btn--primary" onClick={handleNext}>
                                    {currentIdx + 1 < questions.length ? "Lanjut" : "Selesai"}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="quiz-result">
                        <h2>Kuis Selesai! 🎉</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Hasil belajar kamu untuk kategori {kategori}:</p>
                        <div className="quiz-result__score">
                            {Math.round((correctCount / questions.length) * 100)}
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
                            Skor kamu berhasil disimpan ke statistik belajar!
                        </p>
                        <button className="btn btn--primary" style={{ width: '100%' }} onClick={onClose}>
                            Tutup
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
