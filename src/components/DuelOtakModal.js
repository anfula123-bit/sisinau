'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { addXP, unlockBadge } from '../utils/gamification';

const BOT_OPPONENTS = [
    { name: 'AhmadFisika 🧪', avatar: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png' },
    { name: 'SitiKimia ⚗️', avatar: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png' },
    { name: 'BudiSains 🛸', avatar: 'https://cdn-icons-png.flaticon.com/512/4825/4825038.png' },
    { name: 'MegaMath 📐', avatar: 'https://cdn-icons-png.flaticon.com/512/1995/1995566.png' },
    { name: 'DewiSejarah 🏛️', avatar: 'https://cdn-icons-png.flaticon.com/512/4825/4825076.png' }
];

const GENERAL_QUESTIONS = [
    {
        q: "Berapakah hasil dari 15 + 3 x 4?",
        options: ["72", "27", "37", "42"],
        correct: 1,
        category: "Matematika"
    },
    {
        q: "Lambang unsur kimia dari zat Emas adalah...",
        options: ["Fe", "Ag", "Au", "Cu"],
        correct: 2,
        category: "Kimia"
    },
    {
        q: "Organel sel yang dijuluki sebagai 'Powerhouse of the Cell' adalah...",
        options: ["Lisosom", "Mitokondria", "Ribosom", "Kloroplas"],
        correct: 1,
        category: "Biologi"
    },
    {
        q: "Planet manakah yang dikenal sebagai planet merah?",
        options: ["Venus", "Mars", "Jupiter", "Saturnus"],
        correct: 1,
        category: "Astronomi"
    },
    {
        q: "Siapakah presiden pertama Republik Indonesia?",
        options: ["Moh. Hatta", "Soeharto", "Soekarno", "B.J. Habibie"],
        correct: 2,
        category: "Sejarah"
    },
    {
        q: "Selat yang menghubungkan Pulau Jawa dan Pulau Sumatra adalah...",
        options: ["Selat Sunda", "Selat Bali", "Selat Madura", "Selat Karimata"],
        correct: 0,
        category: "Geografi"
    },
    {
        q: "Satuan SI untuk gaya adalah...",
        options: ["Joule", "Watt", "Pascal", "Newton"],
        correct: 3,
        category: "Fisika"
    },
    {
        q: "Gas yang paling banyak terdapat di atmosfer Bumi adalah...",
        options: ["Oksigen", "Nitrogen", "Karbon Dioksida", "Hidrogen"],
        correct: 1,
        category: "Geografi / Kimia"
    },
    {
        q: "Candi Borobudur didirikan pada masa pemerintahan Dinasti...",
        options: ["Sanjaya", "Syailendra", "Isyana", "Girindrawardhana"],
        correct: 1,
        category: "Sejarah"
    },
    {
        q: "Negara manakah yang memenangkan Piala Dunia FIFA pertama kali pada tahun 1930?",
        options: ["Brasil", "Uruguay", "Argentina", "Italia"],
        correct: 1,
        category: "Pengetahuan Umum"
    },
    {
        q: "Hewan mamalia terbesar di Bumi saat ini adalah...",
        options: ["Gajah Afrika", "Paus Biru", "Hiu Megalodon", "Badak Sumatra"],
        correct: 1,
        category: "Biologi"
    },
    {
        q: "Bahan pengisi balon udara ringan yang tidak mudah terbakar adalah...",
        options: ["Hidrogen", "Helium", "Nitrogen", "Oksigen"],
        correct: 1,
        category: "Kimia"
    },
    {
        q: "Bila f(x) = 3x - 4, maka berapakah nilai f(5)?",
        options: ["11", "15", "19", "12"],
        correct: 0,
        category: "Matematika"
    },
    {
        q: "Gunung tertinggi di dunia di atas permukaan laut adalah...",
        options: ["Gunung Kilimanjaro", "Gunung K2", "Gunung Everest", "Gunung Fuji"],
        correct: 2,
        category: "Geografi"
    },
    {
        q: "Hukum gerak benda dirumuskan pertama kali secara matematis oleh...",
        options: ["Albert Einstein", "Isaac Newton", "Galileo Galilei", "Johannes Kepler"],
        correct: 1,
        category: "Fisika"
    }
];

export default function DuelOtakModal({ onClose }) {
    const showToast = useToast();
    const [userProfile, setUserProfile] = useState({ name: 'Anda', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' });
    const [phase, setPhase] = useState('matchmaking'); // 'matchmaking' | 'intro' | 'playing' | 'question-ended' | 'finished'
    
    // Opponent match state
    const [opponent, setOpponent] = useState(null);
    const [matchmakingText, setMatchmakingText] = useState('Mencari lawan duel...');
    const [matchmakingProgress, setMatchmakingProgress] = useState(0);
    const [opponentCycleIdx, setOpponentCycleIdx] = useState(0);

    // Game state
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userScore, setUserScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [timer, setTimer] = useState(10);
    const [introCountdown, setIntroCountdown] = useState(3);

    // Answer states per question
    const [userAnswerIdx, setUserAnswerIdx] = useState(null);
    const [userAnswered, setUserAnswered] = useState(false);
    const [userPts, setUserPts] = useState(0);

    const [opponentAnswerIdx, setOpponentAnswerIdx] = useState(null);
    const [opponentAnswered, setOpponentAnswered] = useState(false);
    const [opponentPts, setOpponentPts] = useState(0);

    const timerIntervalRef = useRef(null);
    const botTimeoutRef = useRef(null);

    // Fetch user details from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loggedIn = localStorage.getItem('loggedInUser') || 'Anda';
            const savedAvatar = localStorage.getItem('profile_avatar_' + loggedIn);
            setUserProfile({
                name: loggedIn,
                avatar: savedAvatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            });
        }
    }, []);

    // 1. Matchmaking Simulation Effect
    useEffect(() => {
        if (phase !== 'matchmaking') return;

        let startTime = Date.now();
        const matchmakingDuration = 3500; // 3.5 seconds

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / matchmakingDuration) * 100, 100);
            setMatchmakingProgress(progress);

            // Cycle opponent avatars & names to simulate real-time search
            setOpponentCycleIdx(prev => (prev + 1) % BOT_OPPONENTS.length);

            if (progress < 40) {
                setMatchmakingText('Mencari lawan seimbang...');
            } else if (progress < 80) {
                setMatchmakingText('Menghubungkan ke server arena...');
            } else {
                setMatchmakingText('Lawan ditemukan! Menghubungkan...');
            }

            if (progress >= 100) {
                clearInterval(interval);
                
                // Finalize opponent selection
                const finalOpponent = BOT_OPPONENTS[Math.floor(Math.random() * BOT_OPPONENTS.length)];
                setOpponent(finalOpponent);

                // Select 5 random questions
                const shuffled = [...GENERAL_QUESTIONS].sort(() => Math.random() - 0.5);
                setSelectedQuestions(shuffled.slice(0, 5));

                // Move to intro countdown phase
                setTimeout(() => {
                    setPhase('intro');
                }, 800);
            }
        }, 120);

        return () => clearInterval(interval);
    }, [phase]);

    // 2. Intro Countdown Effect
    useEffect(() => {
        if (phase !== 'intro') return;

        const countdownInterval = setInterval(() => {
            setIntroCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setPhase('playing');
                    return 3;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [phase]);

    // 3. Game Timer & Answer Processing Effect
    useEffect(() => {
        if (phase !== 'playing') return;

        // Reset question states
        setTimer(10);
        setUserAnswerIdx(null);
        setUserAnswered(false);
        setUserPts(0);
        setOpponentAnswerIdx(null);
        setOpponentAnswered(false);
        setOpponentPts(0);

        const currentQuestion = selectedQuestions[currentIdx];

        // BOT SIMULATION logic
        // Bot responds after 2.5s to 6.5s
        const botResponseTime = 2500 + Math.random() * 4000; 
        botTimeoutRef.current = setTimeout(() => {
            const isCorrect = Math.random() < 0.75; // 75% accuracy
            let answerIdx = currentQuestion.correct;
            
            if (!isCorrect) {
                // Pick a wrong answer
                const wrongOptions = [0, 1, 2, 3].filter(idx => idx !== currentQuestion.correct);
                answerIdx = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            }

            setOpponentAnswerIdx(answerIdx);
            setOpponentAnswered(true);

            // Calculate points if correct
            if (answerIdx === currentQuestion.correct) {
                // Pts based on remaining time
                const secondsPassed = botResponseTime / 1000;
                const points = Math.max(Math.round(100 - (secondsPassed * 10)), 10);
                setOpponentPts(points);
            } else {
                setOpponentPts(0);
            }
        }, botResponseTime);

        // Core Question Timer
        timerIntervalRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerIntervalRef.current);
                    // Time's up! Force end of question
                    endQuestion();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timerIntervalRef.current);
            clearTimeout(botTimeoutRef.current);
        };
    }, [phase, currentIdx, selectedQuestions]);

    // Check if both answered to end question early
    useEffect(() => {
        if (phase === 'playing' && userAnswered && opponentAnswered) {
            clearInterval(timerIntervalRef.current);
            clearTimeout(botTimeoutRef.current);
            endQuestion();
        }
    }, [userAnswered, opponentAnswered, phase]);

    const endQuestion = () => {
        setPhase('question-ended');
    };

    const handleAnswerClick = (optIdx) => {
        if (userAnswered || phase !== 'playing') return;

        setUserAnswerIdx(optIdx);
        setUserAnswered(true);

        const currentQuestion = selectedQuestions[currentIdx];
        const secondsTaken = 10 - timer;

        if (optIdx === currentQuestion.correct) {
            // Correct answer
            const points = Math.max(Math.round(100 - (secondsTaken * 10)), 10);
            setUserPts(points);
            setUserScore(prev => prev + points);
        } else {
            // Wrong answer
            setUserPts(0);
        }
    };

    const handleNextQuestion = () => {
        // Update total scores with current question points first
        if (opponentAnswered && opponentPts > 0) {
            setOpponentScore(prev => prev + opponentPts);
        }

        if (currentIdx + 1 < selectedQuestions.length) {
            // Reset states synchronously before changing index/phase to avoid race conditions
            setUserAnswerIdx(null);
            setUserAnswered(false);
            setUserPts(0);
            setOpponentAnswerIdx(null);
            setOpponentAnswered(false);
            setOpponentPts(0);
            setTimer(10);

            setCurrentIdx(prev => prev + 1);
            setPhase('playing');
        } else {
            // Apply rewards and end game
            const finalUserScore = userScore + (userAnswerIdx === selectedQuestions[currentIdx].correct ? userPts : 0);
            const finalOppScore = opponentScore + (opponentAnswerIdx === selectedQuestions[currentIdx].correct ? opponentPts : 0);
            
            let xpEarned = 20; // Default defeat
            let message = '';

            if (finalUserScore > finalOppScore) {
                xpEarned = 80;
                message = "Selamat! Kamu memenangkan duel otak! +80 XP 🏆";
                if (finalUserScore >= 400) {
                    unlockBadge("CENDEKIAWAN", showToast);
                }
            } else if (finalUserScore === finalOppScore) {
                xpEarned = 40;
                message = "Pertandingan seri! +40 XP 🤝";
            } else {
                message = "Lawan memenangkan duel kali ini. Jangan menyerah! +20 XP 😢";
            }

            addXP(xpEarned, showToast);
            showToast(message, finalUserScore >= finalOppScore ? 'success' : 'info');
            setPhase('finished');
        }
    };

    const handleRestart = () => {
        setUserAnswerIdx(null);
        setUserAnswered(false);
        setUserPts(0);
        setOpponentAnswerIdx(null);
        setOpponentAnswered(false);
        setOpponentPts(0);
        setTimer(10);
        setCurrentIdx(0);
        setUserScore(0);
        setOpponentScore(0);
        
        setPhase('matchmaking');
    };

    const currentQuestion = selectedQuestions[currentIdx];

    return (
        <div style={styles.overlay}>
            <div style={styles.modalCard}>
                
                {/* 1. MATCHMAKING SCREEN */}
                {phase === 'matchmaking' && (
                    <div style={styles.matchmakingContainer}>
                        <h2 style={styles.matchmakingTitle}>Arena Duel Otak ⚔️</h2>
                        
                        <div style={styles.matchmaker}>
                            <div style={styles.profileBox}>
                                <img src={userProfile.avatar} alt={userProfile.name} style={styles.matchAvatar} />
                                <div style={styles.profileName}>{userProfile.name}</div>
                                <div style={styles.profileRole}>Pemain</div>
                            </div>

                            <div style={styles.versusCircle}>VS</div>

                            <div style={styles.profileBox}>
                                <img 
                                    src={BOT_OPPONENTS[opponentCycleIdx].avatar} 
                                    alt="Mencari..." 
                                    style={{
                                        ...styles.matchAvatar,
                                        animation: 'pulse 1.2s infinite'
                                    }} 
                                />
                                <div style={styles.profileName}>{BOT_OPPONENTS[opponentCycleIdx].name}</div>
                                <div style={styles.profileRole}>Mencari Lawan...</div>
                            </div>
                        </div>

                        <div style={styles.loadingArea}>
                            <div style={styles.progressBarBg}>
                                <div style={{...styles.progressBarFill, width: `${matchmakingProgress}%`}}></div>
                            </div>
                            <div style={styles.loadingText}>{matchmakingText}</div>
                        </div>
                    </div>
                )}

                {/* 2. INTRO COUNTDOWN SCREEN */}
                {phase === 'intro' && opponent && (
                    <div style={styles.introContainer}>
                        <h2 style={styles.introTitle}>Duel Dimulai! ⚡</h2>
                        
                        <div style={styles.introDuelists}>
                            <div style={styles.duelistCard}>
                                <img src={userProfile.avatar} alt="User" style={styles.duelistAvatar} />
                                <span style={styles.duelistName}>{userProfile.name}</span>
                            </div>
                            <span style={styles.introVersus}>VS</span>
                            <div style={styles.duelistCard}>
                                <img src={opponent.avatar} alt="Opponent" style={styles.duelistAvatar} />
                                <span style={styles.duelistName}>{opponent.name}</span>
                            </div>
                        </div>

                        <div style={styles.countdownCircle}>
                            {introCountdown}
                        </div>
                    </div>
                )}

                {/* 3. BATTLE SCREEN / QUESTION-ENDED SCREEN */}
                {(phase === 'playing' || phase === 'question-ended') && currentQuestion && opponent && (
                    <div style={styles.battleContainer}>
                        
                        {/* Battle Header (Scores & Players) */}
                        <div style={styles.battleHeader}>
                            {/* User Stats */}
                            <div style={styles.playerPanel}>
                                <img src={userProfile.avatar} alt="User" style={styles.playerPanelAvatar} />
                                <div style={styles.playerPanelInfo}>
                                    <div style={styles.playerNameLabel}>{userProfile.name}</div>
                                    <div style={styles.playerScoreVal}>{userScore} Pts</div>
                                    {userAnswered ? (
                                        <span style={styles.answeredBadge}>Sudah Menjawab</span>
                                    ) : (
                                        <span style={styles.waitingBadge}>Menjawab...</span>
                                    )}
                                </div>
                            </div>

                            {/* Timer Center */}
                            <div style={styles.timerCenter}>
                                <div style={{
                                    ...styles.timerValue,
                                    color: timer <= 3 ? 'var(--red-400)' : 'var(--orange-400)'
                                }}>
                                    {timer}s
                                </div>
                                <div style={styles.questionCounter}>Soal {currentIdx + 1}/5</div>
                            </div>

                            {/* Opponent Stats */}
                            <div style={{...styles.playerPanel, alignItems: 'flex-end', textAlign: 'right'}}>
                                <img src={opponent.avatar} alt="Opponent" style={styles.playerPanelAvatar} />
                                <div style={styles.playerPanelInfo}>
                                    <div style={styles.playerNameLabel}>{opponent.name}</div>
                                    <div style={styles.playerScoreVal}>{opponentScore + (phase === 'question-ended' && opponentAnswerIdx === currentQuestion.correct ? opponentPts : 0)} Pts</div>
                                    {opponentAnswered ? (
                                        <span style={styles.answeredBadge}>Sudah Menjawab</span>
                                    ) : (
                                        <span style={styles.waitingBadge}>Menjawab...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Visual Timer Progress Bar */}
                        <div style={styles.timerBarBg}>
                            <div style={{
                                ...styles.timerBarFill, 
                                width: `${(timer / 10) * 100}%`,
                                background: timer <= 3 ? 'var(--red-400)' : 'var(--orange-400)'
                            }}></div>
                        </div>

                        {/* Question Box */}
                        <div style={styles.questionBox}>
                            <span style={styles.categoryBadge}>{currentQuestion.category}</span>
                            <h3 style={styles.questionText}>{currentQuestion.q}</h3>
                        </div>

                        {/* Options Grid */}
                        <div style={styles.optionsGrid}>
                            {currentQuestion.options.map((opt, idx) => {
                                const isCorrectOpt = idx === currentQuestion.correct;
                                const isUserSelected = idx === userAnswerIdx;
                                const isOpponentSelected = idx === opponentAnswerIdx;

                                // Colors based on game status
                                let buttonStyle = {...styles.optionButton};
                                if (phase === 'question-ended') {
                                    if (isCorrectOpt) {
                                        buttonStyle = {...buttonStyle, ...styles.correctBtn};
                                    } else if (isUserSelected) {
                                        buttonStyle = {...buttonStyle, ...styles.wrongBtn};
                                    } else {
                                        buttonStyle = {...buttonStyle, opacity: 0.5};
                                    }
                                } else if (isUserSelected) {
                                    buttonStyle = {...buttonStyle, ...styles.selectedBtn};
                                }

                                return (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleAnswerClick(idx)} 
                                        style={buttonStyle}
                                        disabled={userAnswered || phase === 'question-ended'}
                                    >
                                        <span style={styles.optionLetter}>{['A', 'B', 'C', 'D'][idx]}.</span>
                                        <span style={styles.optionVal}>{opt}</span>

                                        {/* Visual Indicators */}
                                        <div style={styles.indicators}>
                                            {isUserSelected && (
                                                <span style={styles.userIndicator} title="Jawaban Anda">Anda</span>
                                            )}
                                            {phase === 'question-ended' && isOpponentSelected && (
                                                <span style={styles.oppIndicator} title="Jawaban Lawan">Lawan</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Round Result Details (Shown when question ends) */}
                        {phase === 'question-ended' && (
                            <div style={styles.roundSummary}>
                                <div style={styles.roundSummaryPanel}>
                                    <div style={styles.roundSummaryCol}>
                                        <div style={styles.summaryLabel}>Skor Anda</div>
                                        <div style={{
                                            ...styles.summaryPts,
                                            color: userAnswerIdx === currentQuestion.correct ? '#22c55e' : '#ef4444'
                                        }}>
                                            {userAnswerIdx === currentQuestion.correct ? `+${userPts} Pts` : '0 Pts'}
                                        </div>
                                    </div>
                                    <div style={styles.roundSummaryCol}>
                                        <div style={styles.summaryLabel}>Skor {opponent.name}</div>
                                        <div style={{
                                            ...styles.summaryPts,
                                            color: opponentAnswerIdx === currentQuestion.correct ? '#22c55e' : '#ef4444'
                                        }}>
                                            {opponentAnswerIdx === currentQuestion.correct ? `+${opponentPts} Pts` : '0 Pts'}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleNextQuestion} className="btn btn--primary" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                                    {currentIdx + 1 < 5 ? 'Lanjut ke Soal Berikutnya ➡️' : 'Lihat Hasil Akhir 🏆'}
                                </button>
                            </div>
                        )}

                    </div>
                )}

                {/* 4. FINISHED / RESULTS SCREEN */}
                {phase === 'finished' && opponent && (
                    <div style={styles.finishedContainer}>
                        <h2 style={styles.finishedTitle}>Duel Selesai! 🎉</h2>

                        {/* Final Result Card */}
                        <div style={{
                            ...styles.resultCard,
                            borderColor: userScore > opponentScore ? 'rgba(34,197,94,0.3)' : userScore === opponentScore ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.3)',
                            background: userScore > opponentScore ? 'rgba(34,197,94,0.05)' : userScore === opponentScore ? 'rgba(234,179,8,0.05)' : 'rgba(239,68,68,0.05)'
                        }}>
                            <div style={styles.winnerText}>
                                {userScore > opponentScore ? 'KAMU MENANG! 🏆' : userScore === opponentScore ? 'PERTANDINGAN SERI! 🤝' : 'KAMU KALAH! 😢'}
                            </div>
                            
                            <div style={styles.finalScores}>
                                <div style={styles.finalScoreItem}>
                                    <img src={userProfile.avatar} alt="You" style={styles.finalAvatar} />
                                    <div style={styles.finalScoreName}>{userProfile.name}</div>
                                    <div style={styles.finalScoreVal}>{userScore} Pts</div>
                                </div>
                                
                                <div style={styles.finalScoreVs}>VS</div>

                                <div style={styles.finalScoreItem}>
                                    <img src={opponent.avatar} alt="Opponent" style={styles.finalAvatar} />
                                    <div style={styles.finalScoreName}>{opponent.name}</div>
                                    <div style={styles.finalScoreVal}>{opponentScore} Pts</div>
                                </div>
                            </div>
                        </div>

                        {/* XP Rewards Notice */}
                        <div style={styles.rewardsBox}>
                            <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Hadiah XP diperoleh:</span>
                            <span style={styles.rewardsXp}>
                                {userScore > opponentScore ? '+80 XP 🌟' : userScore === opponentScore ? '+40 XP 🌟' : '+20 XP 🌟'}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div style={styles.finishedActions}>
                            <button onClick={handleRestart} className="btn btn--primary" style={{ flex: 1 }}>
                                Main Lagi 🔄
                            </button>
                            <button onClick={onClose} className="btn btn--ghost" style={{ flex: 1 }}>
                                Keluar Arena 🚪
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// Inline Styles for custom premium visual aesthetics
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-md)'
    },
    modalCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-xl)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative'
    },
    
    // Matchmaking styles
    matchmakingContainer: {
        textAlign: 'center',
        padding: 'var(--space-lg) 0'
    },
    matchmakingTitle: {
        fontSize: '2rem',
        marginBottom: 'var(--space-xl)',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: '800',
        color: 'var(--text-primary)',
        textShadow: '0 0 20px rgba(249, 115, 22, 0.3)'
    },
    matchmaker: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        margin: 'var(--space-2xl) 0',
        gap: 'var(--space-md)'
    },
    profileBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '140px'
    },
    matchAvatar: {
        width: '90px',
        height: '90px',
        borderRadius: 'var(--radius-full)',
        border: '3px solid var(--orange-400)',
        boxShadow: '0 0 15px rgba(249, 115, 22, 0.3)',
        marginBottom: 'var(--space-sm)',
        background: 'rgba(255, 255, 255, 0.05)',
        objectFit: 'cover'
    },
    profileName: {
        fontSize: '1rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        textAlign: 'center'
    },
    profileRole: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '2px'
    },
    versusCircle: {
        width: '50px',
        height: '50px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--gradient-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '800',
        fontSize: '1.2rem',
        color: '#fff',
        boxShadow: '0 0 15px rgba(249, 115, 22, 0.5)'
    },
    loadingArea: {
        marginTop: 'var(--space-2xl)'
    },
    progressBarBg: {
        width: '100%',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        marginBottom: 'var(--space-md)'
    },
    progressBarFill: {
        height: '100%',
        background: 'var(--gradient-brand)',
        borderRadius: 'var(--radius-full)',
        transition: 'width 0.15s ease-out'
    },
    loadingText: {
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },

    // Intro styles
    introContainer: {
        textAlign: 'center',
        padding: 'var(--space-xl) 0'
    },
    introTitle: {
        fontSize: '2.2rem',
        fontWeight: '800',
        color: '#fff',
        marginBottom: 'var(--space-xl)',
        fontFamily: 'Outfit, sans-serif'
    },
    introDuelists: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2xl)',
        marginBottom: 'var(--space-2xl)'
    },
    duelistCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-glass)',
        padding: 'var(--space-lg) var(--space-xl)',
        borderRadius: 'var(--radius-lg)',
        width: '160px'
    },
    duelistAvatar: {
        width: '75px',
        height: '75px',
        borderRadius: 'var(--radius-full)',
        border: '2px solid rgba(255,255,255,0.2)',
        marginBottom: 'var(--space-sm)',
        objectFit: 'cover'
    },
    duelistName: {
        fontSize: '1rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        textAlign: 'center'
    },
    introVersus: {
        fontSize: '2rem',
        fontWeight: '900',
        color: 'var(--orange-400)',
        fontStyle: 'italic',
        textShadow: '0 0 10px rgba(249, 115, 22, 0.4)'
    },
    countdownCircle: {
        width: '90px',
        height: '90px',
        borderRadius: 'var(--radius-full)',
        border: '4px solid var(--orange-400)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        fontWeight: '800',
        color: 'var(--orange-400)',
        margin: '0 auto',
        boxShadow: '0 0 25px rgba(249, 115, 22, 0.4)'
    },

    // Battle Styles
    battleContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)'
    },
    battleHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 'var(--space-md)',
        borderBottom: '1px solid var(--border-glass)'
    },
    playerPanel: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        flex: 1,
        maxWidth: '40%'
    },
    playerPanelAvatar: {
        width: '45px',
        height: '45px',
        borderRadius: 'var(--radius-full)',
        border: '2px solid var(--border-glass)',
        objectFit: 'cover'
    },
    playerPanelInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflow: 'hidden',
        width: '100%'
    },
    playerNameLabel: {
        fontSize: '0.85rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    playerScoreVal: {
        fontSize: '1.1rem',
        fontWeight: '800',
        color: 'var(--orange-400)',
        fontFamily: 'Outfit, sans-serif'
    },
    answeredBadge: {
        fontSize: '0.65rem',
        background: 'rgba(34, 197, 94, 0.15)',
        color: '#22c55e',
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
        width: 'max-content'
    },
    waitingBadge: {
        fontSize: '0.65rem',
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'var(--text-muted)',
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
        width: 'max-content'
    },
    timerCenter: {
        textAlign: 'center',
        flex: 'none',
        width: '90px'
    },
    timerValue: {
        fontSize: '2rem',
        fontWeight: '800',
        fontFamily: 'Outfit, sans-serif',
        lineHeight: 1
    },
    questionCounter: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '2px'
    },
    timerBarBg: {
        width: '100%',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden'
    },
    timerBarFill: {
        height: '100%',
        borderRadius: 'var(--radius-full)',
        transition: 'width 1s linear'
    },
    questionBox: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        textAlign: 'center',
        margin: 'var(--space-sm) 0',
        position: 'relative'
    },
    categoryBadge: {
        position: 'absolute',
        top: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--gradient-brand)',
        color: '#fff',
        fontSize: '0.7rem',
        fontWeight: '700',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        textTransform: 'uppercase',
        boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)'
    },
    questionText: {
        fontSize: '1.2rem',
        color: 'var(--text-primary)',
        lineHeight: '1.5',
        marginTop: '4px'
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-md)',
        marginTop: 'var(--space-sm)'
    },
    optionButton: {
        background: 'rgba(255, 255, 255, 0.03)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all var(--transition-normal)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        position: 'relative',
        outline: 'none'
    },
    optionLetter: {
        fontWeight: '700',
        color: 'var(--orange-400)'
    },
    optionVal: {
        flex: 1,
        paddingRight: '45px'
    },
    selectedBtn: {
        background: 'rgba(249, 115, 22, 0.12)',
        borderColor: 'var(--orange-400)',
        boxShadow: '0 0 15px rgba(249, 115, 22, 0.15)'
    },
    correctBtn: {
        background: 'rgba(34, 197, 94, 0.15)',
        borderColor: '#22c55e',
        boxShadow: '0 0 15px rgba(34, 197, 94, 0.15)',
        opacity: 1
    },
    wrongBtn: {
        background: 'rgba(239, 68, 68, 0.15)',
        borderColor: '#ef4444',
        boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)',
        opacity: 1
    },
    indicators: {
        position: 'absolute',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        alignItems: 'flex-end'
    },
    userIndicator: {
        background: 'var(--gradient-brand)',
        color: '#fff',
        fontSize: '0.65rem',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 2px 5px rgba(249, 115, 22, 0.2)'
    },
    oppIndicator: {
        background: 'rgba(255, 255, 255, 0.15)',
        color: 'var(--text-primary)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontSize: '0.65rem',
        fontWeight: '700',
        padding: '1px 5px',
        borderRadius: 'var(--radius-sm)'
    },
    roundSummary: {
        marginTop: 'var(--space-md)',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px dashed var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md)'
    },
    roundSummaryPanel: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    roundSummaryCol: {
        textAlign: 'center'
    },
    summaryLabel: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginBottom: '2px'
    },
    summaryPts: {
        fontSize: '1.2rem',
        fontWeight: '800',
        fontFamily: 'Outfit, sans-serif'
    },

    // Finished Screen Styles
    finishedContainer: {
        textAlign: 'center',
        padding: 'var(--space-md) 0'
    },
    finishedTitle: {
        fontSize: '2.2rem',
        fontWeight: '800',
        color: '#fff',
        marginBottom: 'var(--space-lg)',
        fontFamily: 'Outfit, sans-serif'
    },
    resultCard: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-xl)',
        marginBottom: 'var(--space-xl)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    },
    winnerText: {
        fontSize: '1.6rem',
        fontWeight: '800',
        marginBottom: 'var(--space-xl)',
        letterSpacing: '0.05em',
        fontFamily: 'Outfit, sans-serif'
    },
    finalScores: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 'var(--space-md)'
    },
    finalScoreItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '130px'
    },
    finalAvatar: {
        width: '70px',
        height: '70px',
        borderRadius: 'var(--radius-full)',
        border: '2px solid var(--border-glass)',
        marginBottom: 'var(--space-sm)',
        objectFit: 'cover'
    },
    finalScoreName: {
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        textAlign: 'center'
    },
    finalScoreVal: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: 'var(--orange-400)',
        fontFamily: 'Outfit, sans-serif',
        marginTop: '2px'
    },
    finalScoreVs: {
        fontSize: '1.5rem',
        fontWeight: '900',
        color: 'var(--text-muted)',
        fontStyle: 'italic'
    },
    rewardsBox: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md) var(--space-xl)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)'
    },
    rewardsXp: {
        fontSize: '1.3rem',
        fontWeight: '800',
        color: 'var(--orange-400)',
        fontFamily: 'Outfit, sans-serif'
    },
    finishedActions: {
        display: 'flex',
        gap: 'var(--space-md)'
    }
};
