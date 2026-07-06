import '../styles/globals.css';
import { ToastProvider } from '../components/ToastContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: {
    default: 'Sisinau — Platform E-Learning Premium Indonesia',
    template: '%s | Sisinau'
  },
  description: 'Platform belajar online modern dan gratis untuk pelajar Indonesia. Akses materi pelajaran Fisika, Kimia, Biologi, Matematika, dan lainnya dengan tampilan premium.',
  keywords: ['e-learning', 'belajar online', 'materi pelajaran', 'fisika', 'kimia', 'biologi', 'matematika', 'SMA', 'UTBK', 'TKA', 'platform edukasi Indonesia', 'sisinau'],
  authors: [{ name: 'Tim Sisinau' }],
  creator: 'Sisinau',
  publisher: 'Sisinau',
  metadataBase: new URL('https://sisinau.vercel.app'),
  openGraph: {
    title: 'Sisinau — Platform E-Learning Premium Indonesia',
    description: 'Belajar materi SMA/SMK secara gratis dengan tampilan premium. Upload, bookmark, dan kerjakan kuis interaktif.',
    url: 'https://sisinau.vercel.app',
    siteName: 'Sisinau',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sisinau — Platform E-Learning Premium Indonesia',
    description: 'Belajar materi SMA/SMK secara gratis dengan tampilan premium.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Isi setelah mendaftar di Google Search Console
    // google: 'kode-verifikasi-google',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f0f12" />
        <link rel="canonical" href="https://sisinau.vercel.app" />
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.add('light-theme');
              }
            } catch (e) {}
          })();
        `}} />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
