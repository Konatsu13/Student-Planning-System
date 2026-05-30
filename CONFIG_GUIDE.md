# Panduan Penggunaan Version & Multilingual (i18n)

## 📦 Struktur File Konfigurasi

```
config/
├── version.ts      # Konfigurasi versi aplikasi
└── i18n.ts        # Konfigurasi multilingual
```

---

## 🔄 Mengubah Versi Aplikasi

Edit file `config/version.ts`:

```typescript
export const APP_VERSION = '1.1.0'; // Ubah di sini
export const EDITION = 'Pro Edition'; // Atau edition
```

Versi otomatis terupdate di:
- ✅ Sidebar
- ✅ Landing Page
- ✅ Profile Page

**Tidak perlu ubah di tiap file!**

---

## 🌐 Sistem Multilingual (i18n)

### Struktur i18n

File: `config/i18n.ts` sudah menyiapkan sistem terjemahan untuk:
- **Indonesian (id)** - Default
- **English (en)** - Sudah tersedia

### Cara Menambah Teks Baru

1. **Buka** `config/i18n.ts`
2. **Tambahkan** teks dalam struktur `TRANSLATIONS`:

```typescript
export const TRANSLATIONS = {
  id: {
    'feature.title': 'Judul Fitur',
    'feature.description': 'Deskripsi Fitur',
  },
  en: {
    'feature.title': 'Feature Title',
    'feature.description': 'Feature Description',
  },
};
```

### Menggunakan Teks di Komponen

**Opsi 1: Gunakan helper function `t()`**

```typescript
import { t } from '@/config/i18n';

// Di komponen
const text = t('auth.login.title'); // Ambil dari current language
const textEng = t('auth.login.title', 'en'); // Ambil versi English
```

**Opsi 2: Implementasi Language Switcher (Tutorial)**

```typescript
'use client';

import { useState } from 'react';
import { t, type Language, SUPPORTED_LANGUAGES } from '@/config/i18n';

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>('id');

  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      
      <h1>{t('landing.hero.title', language)}</h1>
      <p>{t('landing.hero.subtitle', language)}</p>
    </div>
  );
}
```

---

## 📋 Contoh Penggunaan

### Contoh 1: Update Versi
```typescript
// Dalam config/version.ts
export const APP_VERSION = '2.0.0'; // Dari 1.0.0
export const EDITION = 'Enterprise Edition'; // Dari Basic Edition
```
✅ Otomatis update di semua tempat!

### Contoh 2: Menambah Teks Multilingual
```typescript
// Dalam config/i18n.ts
export const TRANSLATIONS = {
  id: {
    'dashboard.welcome': 'Selamat datang di Dashboard',
  },
  en: {
    'dashboard.welcome': 'Welcome to Dashboard',
  },
};

// Dalam komponen
import { t } from '@/config/i18n';

<h1>{t('dashboard.welcome')}</h1>
```

---

## 🎯 Checklist Fitur Selesai

- ✅ Version variable (APP_VERSION)
- ✅ Version terupdate otomatis di 3 halaman
- ✅ i18n structure siap untuk multilingual
- ✅ Helper function `t()` untuk mengakses teks
- ✅ Teks untuk Indonesian & English sudah tersedia

---

## 📝 Next Steps

1. **Setup Language Selector** (opsional)
   - Tambahkan tombol/dropdown untuk ganti bahasa
   - Simpan preferensi ke localStorage/Supabase

2. **Translate Komponen Lain**
   - Update semua hardcoded text ke i18n
   - Gunakan helper function `t()`

3. **Tambah Bahasa Baru**
   - Edit `SUPPORTED_LANGUAGES` di `config/i18n.ts`
   - Tambahkan teks untuk bahasa baru di `TRANSLATIONS`

---

## 🔗 File yang Sudah Update

- `config/version.ts` (Baru)
- `config/i18n.ts` (Baru)
- `app/components/sidebar.tsx` (Updated)
- `app/(landing)/page.tsx` (Updated)
- `app/(dashboard)/profile/page.tsx` (Updated)
