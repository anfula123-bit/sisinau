'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastContext';
import { addXP, unlockBadge } from '../../utils/gamification';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

const CATEGORIES = ["Fisika", "Kimia", "Biologi", "Ekonomi", "Geografi", "Sejarah", "Agama", "Matematika", "Bahasa"];

export default function UploadPage() {
    const router = useRouter();
    const showToast = useToast();

    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("Klik untuk memilih file PDF");
    const [kategori, setKategori] = useState("Kategori");
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedInUser');
        if (!loggedIn) {
            router.replace('/login');
        }
    }, [router]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.type !== 'application/pdf') {
                showToast("Hanya file PDF yang didukung!", "error");
                return;
            }
            setFile(selected);
            setFileName(selected.name);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('fileUpload').click();
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file || kategori === 'Kategori' || !judul.trim() || !deskripsi.trim()) {
            showToast("Harap isi Judul, Deskripsi, pilih Kategori, dan masukkan file PDF.", "error");
            return;
        }

        const loggedIn = localStorage.getItem('loggedInUser');

        if (isSupabaseConfigured) {
            try {
                let publicUrl = '/dummy materi.pdf';

                // Try to upload the actual PDF file to Supabase storage bucket 'materials'
                const fileExt = file.name.split('.').pop();
                const path = `${loggedIn}/${Date.now()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('materials')
                    .upload(path, file);

                if (uploadError) {
                    console.error("Gagal mengunggah file ke Supabase Storage:", uploadError.message || uploadError);
                }

                if (uploadData && !uploadError) {
                    const { data: urlData } = supabase
                        .storage
                        .from('materials')
                        .getPublicUrl(path);
                    if (urlData) {
                        publicUrl = urlData.publicUrl;
                    }
                }

                // Insert metadata into materials table
                const { error: dbError } = await supabase
                    .from('materials')
                    .insert({
                        kategori,
                        judul: judul.trim(),
                        deskripsi: deskripsi.trim(),
                        file_url: publicUrl,
                        uploaded_by: loggedIn
                    });

                if (dbError) throw dbError;

            } catch (err) {
                console.error("Gagal mengunggah ke Supabase:", err);
                showToast("Gagal menyimpan ke server database!", "error");
                return;
            }
        } else {
            const customMateri = JSON.parse(localStorage.getItem('customMateri')) || {};
            
            const newMateri = {
                judul: judul.trim(),
                deskripsi: deskripsi.trim(),
                fileUrl: '/dummy materi.pdf', // Simulate storage location
                uploadedBy: loggedIn
            };

            if (!customMateri[kategori]) {
                customMateri[kategori] = [];
            }
            customMateri[kategori].push(newMateri);

            localStorage.setItem('customMateri', JSON.stringify(customMateri));
        }
        
        // Award XP & Check badge
        addXP(100, showToast);
        unlockBadge("KONTRIBUTOR", showToast);

        showToast(`Materi "${judul}" berhasil diunggah ke kategori ${kategori}!`);

        setTimeout(() => {
            router.push(`/list-materi?kategori=${kategori}`);
        }, 1000);
    };

    return (
        <main className="upload-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <div className="upload-container">
                <h2>Upload Materi 📤</h2>

                <form onSubmit={handleUpload}>
                    {/* Dropzone */}
                    <div 
                        className={`upload-dropzone ${file ? 'active' : ''}`} 
                        id="uploadBox"
                        onClick={triggerFileInput}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
                        <p id="dropzoneText">
                            {file ? <span className="file-name">📄 {fileName}</span> : fileName}
                        </p>
                        <input 
                            type="file" 
                            id="fileUpload" 
                            accept=".pdf" 
                            onChange={handleFileChange}
                            hidden 
                        />
                    </div>

                    {/* Form inputs */}
                    <div className="upload-form">
                        <select 
                            id="kategoriSelect" 
                            className="form-select" 
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            required
                        >
                            <option value="Kategori" disabled>Pilih Kategori</option>
                            {CATEGORIES.map((cat, i) => (
                                <option key={i} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Judul Materi" 
                            value={judul}
                            onChange={(e) => setJudul(e.target.value)}
                            required 
                        />
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Deskripsi Materi" 
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            required 
                        />

                        <button type="submit" className="btn btn--primary" style={{ marginTop: '8px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
