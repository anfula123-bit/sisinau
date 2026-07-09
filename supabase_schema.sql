-- Supabase Schema for Sisinau E-Learning Platform

-- 1. Users table (stores user authentication credentials)
CREATE TABLE IF NOT EXISTS public.users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles table (stores user profile metadata & gamification data)
CREATE TABLE IF NOT EXISTS public.profiles (
    username VARCHAR(255) PRIMARY KEY REFERENCES public.users(username) ON DELETE CASCADE,
    name VARCHAR(255),
    birth_date VARCHAR(255) DEFAULT '12 Oktober 2005',
    address VARCHAR(255) DEFAULT 'Jakarta, Indonesia',
    bio TEXT DEFAULT 'Pelajar yang antusias belajar sains dan pemrograman di Sisinau.',
    avatar_url TEXT DEFAULT 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Badges table (stores badges unlocked by users)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES public.users(username) ON DELETE CASCADE,
    badge_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, badge_id)
);

-- 4. Materials table (stores learning documents / PDFs)
CREATE TABLE IF NOT EXISTS public.materials (
    id SERIAL PRIMARY KEY,
    kategori VARCHAR(100) NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    file_url TEXT NOT NULL, -- Public URL of the PDF document
    uploaded_by VARCHAR(255) REFERENCES public.users(username) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookmarks table (stores user-saved materials)
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES public.users(username) ON DELETE CASCADE,
    material_id INTEGER REFERENCES public.materials(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, material_id)
);

-- 6. Quiz Stats table (stores user learning achievements in quizzes)
CREATE TABLE IF NOT EXISTS public.quiz_stats (
    username VARCHAR(255) PRIMARY KEY REFERENCES public.users(username) ON DELETE CASCADE,
    completed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample PDF materials into public.materials for default access
INSERT INTO public.materials (kategori, judul, deskripsi, file_url) VALUES 
('Fisika', 'Menghitung Kecepatan', 'Cara menghitung kecepatan benda bergerak.', '/dummy materi.pdf'),
('Fisika', 'Quantum Tunneling', 'Fenomena partikel menembus penghalang energi.', '/dummy materi.pdf'),
('Fisika', 'Relativitas Waktu', 'Konsep waktu relatif menurut Einstein.', '/dummy materi.pdf'),
('Fisika', 'God Particle', 'Penjelasan tentang Higgs Boson.', '/dummy materi.pdf'),
('Kimia', 'Ikatan Kimia', 'Jenis-jenis ikatan kimia antar atom.', '/dummy materi.pdf'),
('Kimia', 'Reaksi Redoks', 'Reaksi oksidasi dan reduksi.', '/dummy materi.pdf'),
('Kimia', 'Larutan Elektrolit', 'Cara kerja larutan dalam menghantarkan listrik.', '/dummy materi.pdf'),
('Biologi', 'Sel dan Organel', 'Struktur dasar penyusun makhluk hidup.', '/dummy materi.pdf'),
('Biologi', 'Sistem Pencernaan', 'Proses pencernaan makanan dalam tubuh manusia.', '/dummy materi.pdf'),
('Ekonomi', 'Permintaan dan Penawaran', 'Hubungan antara harga dan jumlah barang.', '/dummy materi.pdf'),
('Ekonomi', 'Inflasi', 'Penyebab dan dampak kenaikan harga umum.', '/dummy materi.pdf'),
('Geografi', 'Lapisan Bumi', 'Struktur dan komposisi bumi.', '/dummy materi.pdf'),
('Geografi', 'Perubahan Iklim', 'Dampak aktivitas manusia terhadap iklim global.', '/dummy materi.pdf'),
('Sejarah', 'Kerajaan Majapahit', 'Sejarah kejayaan kerajaan Majapahit.', '/dummy materi.pdf'),
('Sejarah', 'Proklamasi Kemerdekaan', 'Peristiwa penting 17 Agustus 1945.', '/dummy materi.pdf'),
('Agama', 'Nilai Kejujuran', 'Pentingnya kejujuran dalam kehidupan sehari-hari.', '/dummy materi.pdf'),
('Agama', 'Toleransi', 'Menjaga keharmonisan antar umat beragama.', '/dummy materi.pdf'),
('Matematika', 'Persamaan Linear', 'Cara menyelesaikan persamaan linear satu variabel.', '/dummy materi.pdf'),
('Matematika', 'Trigonometri', 'Fungsi dan penerapan trigonometri.', '/dummy materi.pdf'),
('Bahasa', 'Teks Eksposisi', 'Ciri-ciri dan struktur teks eksposisi.', '/dummy materi.pdf'),
('Bahasa', 'Puisi', 'Unsur dan makna dalam puisi.', '/dummy materi.pdf')
ON CONFLICT DO NOTHING;

-- 7. Comments table (stores discussions per material)
CREATE TABLE IF NOT EXISTS public.comments (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES public.materials(id) ON DELETE CASCADE,
    fallback_key VARCHAR(255),
    username VARCHAR(255) REFERENCES public.profiles(username) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Disable Row Level Security (RLS) to allow public anonymous read/write operations (highly recommended for test/school projects)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- 9. Grant all privileges on tables to anon and authenticated roles
GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.user_badges TO anon, authenticated, service_role;
GRANT ALL ON public.materials TO anon, authenticated, service_role;
GRANT ALL ON public.bookmarks TO anon, authenticated, service_role;
GRANT ALL ON public.quiz_stats TO anon, authenticated, service_role;
GRANT ALL ON public.comments TO anon, authenticated, service_role;

-- 10. Grant all privileges on all sequences to anon and authenticated roles (required for auto-incrementing IDs)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 11. Chatbot Usage table (stores daily chat usage per user)
CREATE TABLE IF NOT EXISTS public.chatbot_usage (
    username VARCHAR(255) REFERENCES public.users(username) ON DELETE CASCADE,
    chat_date DATE DEFAULT CURRENT_DATE,
    chat_count INTEGER DEFAULT 1,
    PRIMARY KEY (username, chat_date)
);

ALTER TABLE public.chatbot_usage DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.chatbot_usage TO anon, authenticated, service_role;



