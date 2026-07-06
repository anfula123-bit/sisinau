import { supabase, isSupabaseConfigured } from './supabaseClient';

// Sisinau Gamification Helper Utility

export const ACTION_XP = {
    READ_MATERI: 20,
    COMPLETE_QUIZ: 50,
    UPLOAD_MATERI: 100
};

export const BADGES = {
    PEMBERANI: { id: "PEMBERANI", name: "Pemberani 🛡️", desc: "Menyelesaikan kuis pertama" },
    PENJELAJAH: { id: "PENJELAJAH", name: "Penjelajah 🧭", desc: "Membaca 3 materi berbeda" },
    KONTRIBUTOR: { id: "KONTRIBUTOR", name: "Kontributor 📤", desc: "Mengunggah materi pertama" },
    CENDEKIAWAN: { id: "CENDEKIAWAN", name: "Cendekiawan 🎓", desc: "Mendapatkan nilai 100 di kuis" }
};

export function addXP(amount, showToast) {
    if (typeof window === 'undefined') return;

    const currentXp = parseInt(localStorage.getItem('userXp') || '0', 10);
    const newXp = currentXp + amount;
    localStorage.setItem('userXp', newXp.toString());

    // Calculate levels
    const oldLevel = Math.floor(currentXp / 200) + 1;
    const newLevel = Math.floor(newXp / 200) + 1;

    showToast(`+${amount} XP diperoleh! 🌟`);

    if (newLevel > oldLevel) {
        setTimeout(() => {
            showToast(`Naik Level! Kamu sekarang Level ${newLevel}! 🏆`, "success");
        }, 1200);
    }

    // Sync to Supabase if configured
    const loggedIn = localStorage.getItem('loggedInUser');
    if (isSupabaseConfigured && loggedIn) {
        supabase
            .from('profiles')
            .update({ xp: newXp })
            .eq('username', loggedIn)
            .then(({ error }) => {
                if (error) console.error("Gagal menyinkronkan XP ke Supabase:", error);
            });
    }

    // Trigger local events to update elements
    window.dispatchEvent(new Event('xpUpdated'));
}

export function unlockBadge(badgeId, showToast) {
    if (typeof window === 'undefined') return;

    const unlocked = JSON.parse(localStorage.getItem('unlockedBadges')) || [];
    if (!unlocked.includes(badgeId)) {
        unlocked.push(badgeId);
        localStorage.setItem('unlockedBadges', JSON.stringify(unlocked));
        
        setTimeout(() => {
            showToast(`Lencana Baru Terbuka: ${BADGES[badgeId].name}! 🏅`, "success");
        }, 2200);

        // Sync to Supabase if configured
        const loggedIn = localStorage.getItem('loggedInUser');
        if (isSupabaseConfigured && loggedIn) {
            supabase
                .from('user_badges')
                .insert({ username: loggedIn, badge_id: badgeId })
                .then(({ error }) => {
                    if (error) console.error("Gagal menyinkronkan Badge ke Supabase:", error);
                });
        }

        window.dispatchEvent(new Event('badgesUpdated'));
    }
}
