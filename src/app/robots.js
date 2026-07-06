export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/profil', '/setting', '/bookmarks'],
      },
    ],
    sitemap: 'https://sisinau.vercel.app/sitemap.xml',
  };
}
