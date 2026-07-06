import '../styles/globals.css';
import { ToastProvider } from '../components/ToastContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Sisinau — Premium E-Learning Platform',
  description: 'Platform belajar online modern untuk pelajar Indonesia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f0f12" />
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
