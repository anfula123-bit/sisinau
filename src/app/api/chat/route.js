import { supabase, isSupabaseConfigured } from '../../../utils/supabaseClient';

export async function POST(request) {
    try {
        const { username, messages } = await request.json();

        if (!username) {
            return new Response(JSON.stringify({ error: "Username diperlukan." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Format pesan tidak valid." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({
                error: "Groq API Key belum dikonfigurasi di server. Silakan tambahkan GROQ_API_KEY di file .env.local."
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        let currentCount = 0;
        let dbErrorOccurred = false;

        // 1. Periksa/Enforce rate limit melalui Supabase jika terkonfigurasi
        if (isSupabaseConfigured && supabase) {
            try {
                const { data: usage, error: fetchError } = await supabase
                    .from('chatbot_usage')
                    .select('chat_count')
                    .eq('username', username)
                    .eq('chat_date', today)
                    .maybeSingle();

                if (fetchError) {
                    throw fetchError;
                }

                currentCount = usage ? usage.chat_count : 0;

                if (currentCount >= 5) {
                    return new Response(JSON.stringify({
                        error: "Batas chat harian tercapai! Kamu hanya bisa mengirim 5 pesan per hari.",
                        chatCount: currentCount
                    }), {
                        status: 429,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch (dbErr) {
                console.error("Gagal memeriksa kuota di database:", dbErr);
                dbErrorOccurred = true;
            }
        }

        // 2. Kirim permintaan ke Groq API
        try {
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'Anda adalah asisten AI chatbot pintar bernama "Sisinau AI". Tugas Anda adalah membantu pengguna memahami materi pelajaran seperti Fisika, Kimia, Biologi, Matematika, Ekonomi, Geografi, Sejarah, Agama, dan Bahasa. Berikan jawaban yang jelas, mendalam, ramah, dan memotivasi. Gunakan bahasa Indonesia yang santun dan mudah dipahami. Tulis format jawaban menggunakan Markdown jika diperlukan untuk kejelasan rumus atau list.'
                        },
                        ...messages
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!groqResponse.ok) {
                const errorData = await groqResponse.json();
                console.error("Groq API Error:", errorData);
                return new Response(JSON.stringify({
                    error: "Gagal mendapatkan respon dari AI. Silakan coba beberapa saat lagi."
                }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const data = await groqResponse.json();
            const reply = data.choices?.[0]?.message?.content || "";

            // 3. Update penggunaan di Supabase jika berhasil memanggil AI
            let nextCount = currentCount + 1;
            if (isSupabaseConfigured && supabase && !dbErrorOccurred) {
                try {
                    if (currentCount > 0) {
                        const { error: updateError } = await supabase
                            .from('chatbot_usage')
                            .update({ chat_count: nextCount })
                            .eq('username', username)
                            .eq('chat_date', today);

                        if (updateError) throw updateError;
                    } else {
                        const { error: insertError } = await supabase
                            .from('chatbot_usage')
                            .insert({ username, chat_date: today, chat_count: 1 });

                        if (insertError) throw insertError;
                    }
                } catch (dbErr) {
                    console.error("Gagal mengupdate kuota di database:", dbErr);
                }
            }

            return new Response(JSON.stringify({
                reply,
                chatCount: nextCount,
                dbSynced: !dbErrorOccurred && isSupabaseConfigured
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (groqErr) {
            console.error("Gagal menghubungi Groq API:", groqErr);
            return new Response(JSON.stringify({
                error: "Kesalahan koneksi ke server AI."
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (err) {
        console.error("Kesalahan internal API:", err);
        return new Response(JSON.stringify({ error: "Kesalahan server internal." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
