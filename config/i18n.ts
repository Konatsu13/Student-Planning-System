// Konfigurasi i18n (Internasionalisasi/Multilingual)
// Struktur dasar untuk mendukung berbagai bahasa

export type Language = 'id' | 'en';

export const SUPPORTED_LANGUAGES: { [key in Language]: string } = {
  id: 'Bahasa Indonesia',
  en: 'English',
};

export const DEFAULT_LANGUAGE: Language = 'id';

// Template struktur teks multilingual
// Gunakan format ini untuk menambahkan teks baru:
// const TRANSLATIONS = {
//   id: { key: 'value' },
//   en: { key: 'value' }
// }

export const TRANSLATIONS = {
  id: {
    // Auth Pages
    'auth.login.title': 'Selamat Datang Kembali',
    'auth.login.subtitle': 'Masuk untuk melanjutkan',
    'auth.register.title': 'Buat Akun Anda',
    'auth.register.subtitle': 'Mari kita mulai perjalanan belajarmu.',
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.name': 'Nama Lengkap',
    'auth.gender': 'Jenis Kelamin',
    'auth.login_button': 'Masuk',
    'auth.register_button': 'Buat',
    'auth.have_account': 'Sudah punya akun?',
    'auth.no_account': 'Belum punya akun?',

    // Sidebar
    'sidebar.menu': 'Menu Utama',
    'sidebar.home': 'Beranda',
    'sidebar.schedule': 'Jadwal',
    'sidebar.notifications': 'Notifikasi',
    'sidebar.profile': 'Profil',
    'sidebar.logout': 'Keluar Sesi',

    // Landing Page
    'landing.hero.title': 'Student Planning Digital',
    'landing.hero.subtitle': 'Kelola kehidupan akademikmu dengan mudah menggunakan sistem perencanaan semua-dalam-satu. Jadwalkan kelas, pantau tenggat waktu tugas, dan susun perjalanan belajarmu dengan lebih cerdas, teratur, & produktif setiap hari.',
    'landing.cta': 'Bergabung Sekarang',
    'landing.footer.tagline': 'Pintar, Terorganisir, & Produktif Setiap Hari.',

    // Profile
    'profile.about': 'Tentang',
    'profile.edit': 'Ubah Profil',
    'profile.save': 'Simpan',
    'profile.cancel': 'Batal',

    // Common
    'common.version': 'Versi',
    'common.copyright': '© 2026 Student Planning Digital. Hak Cipta Dilindungi.',
    'common.language': 'Bahasa',
  },
  en: {
    // Auth Pages
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitle': 'Sign in to continue',
    'auth.register.title': 'Create Your Account',
    'auth.register.subtitle': "Let's start your learning journey.",
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.gender': 'Gender',
    'auth.login_button': 'Login',
    'auth.register_button': 'Create',
    'auth.have_account': 'Already have an account?',
    'auth.no_account': "Don't have an account?",

    // Sidebar
    'sidebar.menu': 'Main Menu',
    'sidebar.home': 'Home',
    'sidebar.schedule': 'Schedule',
    'sidebar.notifications': 'Notifications',
    'sidebar.profile': 'Profile',
    'sidebar.logout': 'Logout',

    // Landing Page
    'landing.hero.title': 'Student Planning Digital',
    'landing.hero.subtitle': 'Manage your academic life easily using an all-in-one planning system. Schedule classes, monitor assignment deadlines, and organize your learning journey more smartly, organized, & productively every day.',
    'landing.cta': 'Join Now',
    'landing.footer.tagline': 'Smart, Organized, & Productive Every Day.',

    // Profile
    'profile.about': 'About',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',

    // Common
    'common.version': 'Version',
    'common.copyright': '© 2026 Student Planning Digital. All rights reserved.',
    'common.language': 'Language',
  },
};

// Fungsi helper untuk mendapatkan teks
export const t = (key: string, language: Language = DEFAULT_LANGUAGE): string => {
  const keys = key.split('.');
  let value: any = TRANSLATIONS[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Jika key tidak ditemukan, return key itu sendiri
    }
  }

  return typeof value === 'string' ? value : key;
};
