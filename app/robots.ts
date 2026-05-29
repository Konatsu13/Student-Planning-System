import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Proteksi halaman admin/database jika ada
    },
    sitemap: 'https://student-planning-system.vercel.app/sitemap.xml',
  }
}