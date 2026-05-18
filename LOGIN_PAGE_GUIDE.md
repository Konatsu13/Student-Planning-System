# 📚 COMPREHENSIVE LOGIN PAGE GUIDE - Untuk Project Sekolah

**Dokumentasi Lengkap untuk Pemula oleh Programmer Profesional**

---

## 📖 **DAFTAR ISI**
1. [Line-by-Line Code Analysis](#line-by-line-code-analysis)
2. [Struktur Program & Konsep](#struktur-program--konsep)
3. [Redirect ke Home/Dashboard](#redirect-ke-homedashboard)
4. [Menambah Logo .PNG](#menambah-logo-png)
5. [Yang Bisa Dikembangkan](#yang-bisa-dikembangkan)
6. [Frontend & Backend Structure](#frontend--backend-structure)
7. [Database Deep Dive](#database-deep-dive)
8. [Flow Diagram Lengkap](#flow-diagram-lengkap)

---

# 🔍 **PART 1: LINE-BY-LINE CODE ANALYSIS**

## **File 1: `app/(auth)/layout.tsx`** - Master Layout untuk Halaman Login

```tsx
// ❌ JANGAN SENTUH
1   import type { Metadata } from "next";
    │
    └─> Mengimpor tipe Metadata dari Next.js
        Fungsi: Untuk set title halaman & deskripsi di browser tab
        Analogi: Ini seperti kartu nama halaman kamu di browser
```

```tsx
// ❌ JANGAN SENTUH
2   import { Geist, Geist_Mono } from "next/font/google";
    │
    └─> Import font dari Google Fonts (Geist)
        Fungsi: Font untuk typography/teks yang lebih bagus
        Analogi: Sama seperti download font di Canva
```

```tsx
// ❌ JANGAN SENTUH
3   import "../globals.css";
    │
    └─> Import file CSS global untuk styling
        Fungsi: CSS yang berlaku di semua halaman
        Lokasi: app/globals.css
```

```tsx
// ✅ BOLEH UBAH
6-9 const geistSans = Geist({
      variable: "--font-geist-sans",
      subsets: ["latin"],
    });
    │
    └─> Setup font untuk text normal
        variable: Nama CSS variable untuk dipakai nanti
        subsets: Bahasa yang disupport (latin = Indonesia OK)

    Contoh ubah ke font lain:
    import { Inter } from "next/font/google";
    const inter = Inter({ subsets: ["latin"] });
```

```tsx
// ✅ BOLEH UBAH - SUPER PENTING!
16-19 export const metadata: Metadata = {
        title: "Login - Student Planning Digital",
        description: "Create an account or login...",
      };
      │
      └─> Metadata halaman (SEO)
          title: Text di browser tab (ubah sesuai project)
          description: Deskripsi di search engine
          
    UBAH KE:
    export const metadata: Metadata = {
      title: "Login - Aplikasi Kalender Siswa",
      description: "Masuk atau daftar untuk mengelola jadwal sekolah",
    };
```

```tsx
// ❌ JANGAN UBAH - CRITICAL!
21-34 export default function RootLayout({
        children,
      }: Readonly<{
        children: React.ReactNode;
      }>) {
        return (
          <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="select-none min-h-full flex flex-col overflow-x-hidden">
              {children}
            </body>
          </html>
        );
      }
      │
      └─> Root HTML struktur untuk halaman ini
          children: Komponen login yang akan dirender di sini
          
    Penjelasan:
    - <html>: Tag HTML utama
    - className: CSS class untuk styling (h-full = height full)
    - <body>: Container body
      - select-none: Teks tidak bisa di-select/copy
      - min-h-full: Minimal tinggi = full screen
      - flex flex-col: Layout vertikal
      - overflow-x-hidden: Hide scroll horizontal
    - {children}: Tempat login form dirender
```

```tsx
// ❌ JANGAN UBAH
36-40 export const viewport = {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
      };
      │
      └─> Mobile responsive settings
          width: Lebar viewport sesuai device
          initialScale: Zoom awal 100%
          maximumScale: User tidak bisa zoom > 100%
```

**Summary Layout.tsx:**
```
Layout.tsx adalah "template" untuk semua halaman login
Analogi: Seperti frame/bingkai yang akan diisi konten login
```

---

## **File 2: `app/(auth)/login/page.tsx`** - Controller/Orchestrator

```tsx
// ✅ CLIENT COMPONENT
1   'use client';
    │
    └─> Directive React - ini adalah Client Component
        Fungsi: Bisa pakai state, event, browser API
        vs Server Component: Tidak bisa pakai useState
        
    BASIC PERBEDAAN:
    'use client'        ← Bisa pakai state, event
    (default)           ← Server-side rendering saja
```

```tsx
// ✅ IMPORT STATE MANAGEMENT
3   import { useState } from 'react';
    │
    └─> Import useState hook dari React
        Fungsi: Untuk membuat "memory" komponen
        Analogi: Seperti variable global tapi untuk 1 komponen
        
    PENJELASAN HOOK:
    useState(initial_value) 
      ├─ Menyimpan nilai
      └─ Return: [value, setValue] → array 2 item
      
    CONTOH:
    const [step, setStep] = useState('login');
    // step = nilai sekarang = 'login'
    // setStep = function untuk ubah step
    
    Cara ubah:
    setStep('register');  ← step sekarang = 'register'
```

```tsx
// ✅ IMPORT KOMPONEN
4-6 import LoginForm from './_components/loginform';
    import RegisterForm from './_components/registerform';
    import OtpForm from './_components/otpform';
    │
    └─> Import 4 komponen form dari folder _components
        Fungsi: Modularisasi - pisahkan setiap halaman
        
    STRUKTUR:
    page.tsx (Main Controller)
        ├── LoginForm (Halaman Login)
        ├── RegisterForm (Halaman Daftar)
        ├── OtpForm (Halaman OTP)
        └── NewPasswordForm (Halaman Reset Password)
```

```tsx
// ✅ DEFINE TYPE UNTUK STATE
18  type AuthStep = 'login' | 'register' | 'otp' | 'newPassword' | 'success';
    │
    └─> Define tipe data yang boleh ada di AuthStep
        Fungsi: Type safety - step hanya boleh value ini
        
    PENJELASAN:
    type AuthStep = 'A' | 'B' | 'C';
    const [step, setStep] = useState<AuthStep>('login');
    
    ✓ setStep('login') ← OK
    ✗ setStep('invalid') ← ERROR! Tidak dalam list
```

```tsx
// ✅ DEFINE STATE MANAGEMENT
19-20 const [step, setStep] = useState<AuthStep>('login');
      const [email, setEmail] = useState('');
      │
      └─> Inisial state:
          step: 'login' (default halaman login)
          email: '' (untuk simpan email saat register)
          
    FLOW:
    User register email:
      email@gmail.com
            ↓
      setEmail('email@gmail.com')
            ↓
      setStep('otp')  ← Pindah ke halaman OTP
```

```tsx
// ✅ HANDLER FUNCTIONS - ORCHESTRATION LOGIC
22-24 const handleRegisterSuccess = () => {
        setStep('success');
      };
      │
      └─> Dipanggil saat Register BERHASIL
          Fungsi: Ubah step ke 'success'
          
    FLOW:
    RegisterForm → onClick Create button
              ↓
      supabase.auth.signUp() ← ke database
              ↓
      Jika BERHASIL ← call onSuccess()
              ↓
      handleRegisterSuccess() ← dipanggil
              ↓
      setStep('success') ← tampil halaman sukses
```

```tsx
// ✅JSX RETURN - RENDER LOGIC
27  return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {/* JSX elements di sini */}
      </div>
    );
    │
    └─> Container utama untuk semua halaman
        className: Tailwind CSS styling
        - min-h-screen: Minimal 100% tinggi layar
        - flex items-center justify-center: Center vertikal & horizontal
        - bg-white: Background putih
```

```tsx
// ✅ CONDITIONAL RENDERING - IF ELSE LOGIC
29-31 {step === 'success' && (
        <div>Halaman Sukses</div>
      )}
      
      {step === 'login' && (
        <LoginForm ... />
      )}
      │
      └─> IF ELSE DALAM JSX
          Syntax: {kondisi && <elemen>}
          
    PENJELASAN:
    step === 'login' ← Cek apakah step == 'login'
    &&               ← AND operator (kedua kondisi harus true)
    <LoginForm />    ← Tampil komponen ini jika true
    
    ANALOGI LOOPING:
    - Setiap kali state berubah → render ulang
    - Cek kondisi → tampil komponen yang sesuai
    - Loop: mount → render → update → render → unmount
```

**Summary page.tsx:**
```
page.tsx adalah "Director" yang orchestrate perpindahan halaman:
- Manage state (step, email)
- Render komponen sesuai step
- Handle perpindahan antar halaman
```

---

## **File 3: `app/(auth)/login/_components/loginform.tsx`** - LOGIN HALAMAN

```tsx
// ✅ CLIENT COMPONENT
1   'use client';
    │
    └─> Browser component - bisa pakai state & event
```

```tsx
// ✅ IMPORTS
3-6 import { useState } from 'react';
    import { useRouter } from 'next/navigation';
    import { supabase } from '@/app/utils/supabase';
    import { CheckCircle2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
    │
    └─> useState: State management
        useRouter: Navigate ke halaman lain
        supabase: Database connector
        Icons: Visual elements (Mail icon, Lock icon, dll)
```

```tsx
// ✅ INTERFACE PROPS - KONTRAK KOMPONEN
8-11 interface LoginFormProps {
       onSwitchToRegister: () => void;
       onSwitchToForgotPassword: () => void;
     }
     │
     └─> Define apa props yang diterima komponen ini
         Props: Data dari parent ke child
         
     ANALOGI:
     Parent (page.tsx) kirim:
     <LoginForm 
       onSwitchToRegister={() => setStep('register')}
       onSwitchToForgotPassword={() => setStep('otp')}
     />
     
     Child (LoginForm) terima:
     const { onSwitchToRegister, onSwitchToForgotPassword } = props;
```

```tsx
// ✅ DESTRUCTURE PROPS & ROUTER HOOK
13-14 export default function LoginForm({ 
        onSwitchToRegister, 
        onSwitchToForgotPassword 
      }) {
        const router = useRouter();
        │
        └─> Extract props & get router instance
            router: Untuk navigate ke halaman lain
            
        CONTOH PAKAI:
        router.push('/dashboard') ← Go to dashboard
        router.push('/login') ← Back to login
        router.back() ← Browser back button
```

```tsx
// ✅ STATE DECLARATIONS - MEMORY
15-20 const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [rememberMe, setRememberMe] = useState(false);
      │
      └─> Semua state yang perlu komponen ini:
      
      email: Input email user
      password: Input password user
      loading: Loading state (true saat submit)
      error: Pesan error (misal: "Email atau password salah")
      showPassword: Toggle show/hide password
      rememberMe: Checkbox "Remember me"
```

```tsx
// ✅ HANDLER FUNCTION - FORM SUBMISSION
22-48 const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();  // ← PENTING! Prevent form refresh
        setError('');        // ← Clear error sebelumnya
        
        // VALIDASI (IF ELSE LOGIC)
        if (!email.trim() || !password.trim()) {
          setError('Email and password are required');
          return;  // ← Exit function, jangan lanjut
        }
        
        setLoading(true);  // ← Show loading spinner
        
        try {
          // BACKEND CALL - Kirim ke Supabase
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          // ERROR HANDLING (IF ELSE)
          if (signInError) throw signInError;
          
          // SUCCESS - Redirect
          router.push('/dashboard');  ← GO HOME!
          
        } catch (err) {
          // CATCH ERROR
          setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
          // ALWAYS EXECUTE (cleanup)
          setLoading(false);  ← Hide loading spinner
        }
      };
      │
      └─> FLOW DIAGRAM:
      
      User click LOGIN button
            ↓
      handleSubmit() dipanggil
            ↓
      e.preventDefault() ← Jangan refresh halaman!
            ↓
      Cek email & password (IF ELSE)
            ├─ Kosong? → Error, keluar
            └─ Ada? → Lanjut
            ↓
      setLoading(true) ← Show spinner
            ↓
      supabase.auth.signInWithPassword() ← BACKEND CALL
            ├─ Network request ke server
            └─ Tunggu response
            ↓
      Response datang
            ├─ ERROR? → catch block → setError()
            └─ OK? → router.push('/dashboard')
            ↓
      finally { setLoading(false) } ← Always
```

```tsx
// ✅ TRY-CATCH-FINALLY PENJELASAN
try {
  // Code yang mungkin error
  await supabase.auth.signInWithPassword(...)
} catch (err) {
  // Jika ada error, jalankan ini
  setError('Error message');
} finally {
  // Selalu jalankan ini (error atau tidak)
  setLoading(false);
}

ANALOGI:
Kamu mau beli makanan:
try {    ← Coba
  Pergi ke warung
  Pesan makan
}
catch {  ← Jika ada masalah
  Warung tutup → Pergi ke tempat lain
}
finally { ← Pasti dilakukan
  Pulang ke rumah
}
```

```tsx
// ✅ JSX RETURN - UI RENDERING
64-75 <div className="w-full max-w-md mx-auto px-6">
       {/* Header */}
       <div className="text-center mb-8">
         <div className="flex justify-center mb-4">
           <div className="bg-cyan-100 p-3 rounded-full">
             <CheckCircle2 className="w-8 h-8 text-cyan-500" />
           </div>
         </div>
         <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
         <p className="text-gray-500 text-sm mt-2">Sign in to continue</p>
       </div>
       │
       └─> HEADER SECTION
           Tailwind styling:
           - w-full: Width 100%
           - max-w-md: Max width medium (28rem = 448px)
           - mx-auto: Center horizontal
           - px-6: Padding horizontal
           - text-center: Text align center
           - mb-8: Margin bottom (8 * 4px = 32px)
           - bg-cyan-100: Background cyan
           - p-3: Padding 3
           - rounded-full: Border radius full (circle)
           - text-2xl: Font size besar
           - font-bold: Bold text
           - text-gray-900: Dark gray text color
```

```tsx
// ✅ FORM INPUT - EMAIL
78-94 <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="..."
            />
          </div>
        </div>
        │
        └─> FORM INPUT HANDLING:
        
        <input value={email} /> ← Current value dari state
        onChange={(e) => setEmail(e.target.value)} ← Update state
        
        FLOW:
        User ketik di input
              ↓
        onChange event trigger
              ↓
        e.target.value = text yang diketik
              ↓
        setEmail(text)
              ↓
        State update
              ↓
        Component re-render
              ↓
        Input value update
        
        LOOP EFFECT:
        Input → onChange → setState → Render → Input update → Loop
```

```tsx
// ✅ CONDITIONAL SHOW PASSWORD
103-116 <input
           type={showPassword ? 'text' : 'password'}
           ...
         />
         <button
           type="button"
           onClick={() => setShowPassword(!showPassword)}
         >
           {showPassword ? <EyeOff /> : <Eye />}
         </button>
         │
         └─> IF ELSE TERNARY OPERATOR:
         
         showPassword ? 'text' : 'password'
         ├─ true  (showPassword === true) → type='text' (show)
         └─ false (showPassword === false) → type='password' (hide)
         
         onClick={() => setShowPassword(!showPassword)}
         ├─ true → !true = false
         └─ false → !false = true
         
         TOGGLE EFFECT:
         Click button
              ↓
         showPassword = !showPassword (toggle)
              ↓
         type attribute change
              ↓
         Password show/hide
```

```tsx
// ✅ ERROR MESSAGE CONDITIONAL
140-145 {error && (
          <div className="bg-red-50 border border-red-200 ...">
            {error}
          </div>
        )}
        │
        └─> Tampil error message jika ada:
        
        {error && <div>} ← Hanya tampil jika error !== ''
        
        FLOW:
        User submit form
              ↓
        error = '' (kosong, tidak ada error)
              ↓
        {error && ...} → false && ... → TIDAK TAMPIL
              ↓
        User input salah
              ↓
        error = 'Email or password salah'
              ↓
        {error && ...} → true && ... → TAMPIL error div
```

**Summary LoginForm:**
```
Login form memiliki:
1. State management (email, password, loading, error)
2. Validasi input (IF ELSE)
3. Backend call (try-catch)
4. Conditional rendering ({kondisi && <elemen>})
5. Ternary operator (true ? a : b)
```

---

## **File 4: `app/(auth)/login/_components/registerform.tsx`** - REGISTER HALAMAN

Struktur sama dengan LoginForm, tapi:

```tsx
// PERBEDAAN UTAMA:

// 1. Lebih banyak state (full name, confirm password)
const [fullName, setFullName] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

// 2. Validasi lebih kompleks
if (!fullName.trim()) {
  setError('Full name is required');
  return;
}

// 3. Call ke Supabase berbeda
const { data, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: fullName } },
});

// 4. INSERT ke tb_user setelah sign up
if (data.user) {
  const { error: profileError } = await supabase.from('tb_user').insert([
    {
      id: data.user.id,
      email,
      username: fullName.toLowerCase().replace(/\s+/g, '_'),
      password: '',
      created_at: new Date().toISOString(),
    },
  ]);
}

// 5. Call onSuccess() (parent function)
onSuccess();
```

---

# 💡 **PART 2: STRUKTUR PROGRAM & KONSEP**

## **A. STRUCTURE CONCEPTS**

### **1. If-Else Logic**

```tsx
// Simple IF
if (condition) {
  // do something
}

// IF-ELSE
if (condition) {
  // do A
} else {
  // do B
}

// NESTED IF
if (email) {
  if (password) {
    // Both ada
  } else {
    // Email ada, password kosong
  }
}

// TERNARY (Short IF-ELSE)
condition ? valueA : valueB;

// CONTOH:
showPassword ? 'text' : 'password'
loading ? 'Loading...' : 'Submit'

// LOGICAL OPERATORS
&& (AND) - Keduanya harus true
|| (OR) - Salah satu harus true
! (NOT) - Negasi/kebalikan

// CONTOH:
if (!email.trim() || !password.trim()) {
  // Email KOSONG ATAU Password KOSONG
}

if (email && password && password === confirmPassword) {
  // Email ada AND Password ada AND Password match
}
```

### **2. Looping Concepts**

```tsx
// IMPLICIT LOOPING - React renderization

// Setiap state change → component re-render
setEmail('test@mail.com');
// React automatically:
// 1. Update state
// 2. Call function lagi
// 3. Re-render JSX
// 4. Update DOM

// CONDITIONAL LOOPING - Show/Hide
{step === 'login' && <LoginForm />}
{step === 'register' && <RegisterForm />}
{step === 'otp' && <OtpForm />}

// Ini "loop" dalam arti:
// - Terus cek kondisi setiap render
// - Render component yang sesuai
// - Repeat

// ACTUAL LOOP - Array mapping
const items = ['email', 'password', 'name'];
return (
  <>
    {items.map((item, index) => (
      <input key={index} placeholder={item} />
    ))}
  </>
);

// Output:
// <input placeholder="email" />
// <input placeholder="password" />
// <input placeholder="name" />
```

### **3. OOP Concepts (Dalam React)**

```tsx
// CLASS vs FUNCTIONAL COMPONENT

// OLD: Class Component (OOP style)
class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '' };
  }
  
  handleChange = (e) => {
    this.setState({ email: e.target.value });
  }
  
  render() {
    return <input value={this.state.email} onChange={this.handleChange} />;
  }
}

// NEW: Functional Component (lebih simple, pakai hooks)
function LoginForm() {
  const [email, setEmail] = useState('');
  
  return (
    <input 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
    />
  );
}

// REACT CONCEPTS (Functional Style):

// 1. Components are functions
export default function LoginForm() {}
// ↑ Fungsi yang return JSX

// 2. Props = function parameters
function LoginForm({ onSwitchToRegister }) {}
// ↑ Receive data dari parent

// 3. State = function memory
const [email, setEmail] = useState('');
// ↑ Simpan data yang berubah-ubah

// 4. Hooks = Function utilities
- useState: State management
- useRouter: Navigation
- useEffect: Side effects
- useContext: Global state
```

### **4. Asynchronous Programming**

```tsx
// SYNCHRONOUS (Block execution)
console.log('A');
console.log('B');
console.log('C');
// Output: A, B, C (sequentially)

// ASYNCHRONOUS (Non-block)
console.log('A');
setTimeout(() => console.log('B'), 1000);
console.log('C');
// Output: A, C, B (B delayed 1 second)

// PROMISE
const promise = new Promise((resolve, reject) => {
  if (success) {
    resolve('Success!');
  } else {
    reject('Failed!');
  }
});

promise.then(success => console.log(success))
       .catch(error => console.error(error));

// ASYNC-AWAIT (Better syntax)
async function login() {
  try {
    const result = await supabase.auth.signInWithPassword({...});
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// DALAM KODE KITA:
const handleSubmit = async (e) => {  // ← async
  const { error } = await supabase.auth.signInWithPassword(...);
  // ↑ await tunggu response dari server
};
```

---

# 🏠 **PART 3: REDIRECT KE HOME/DASHBOARD**

## **Current Setup:**
```tsx
// loginform.tsx (line 42)
router.push('/dashboard');
```

## **Untuk Redirect ke HOME (bukan Dashboard):**

**Option A: Ubah path ke home**
```tsx
// loginform.tsx
// OLD:
router.push('/dashboard');

// NEW:
router.push('/');  // ← Home page
```

**Option B: Buat halaman home sendiri**
```tsx
// app/page.tsx (atau app/(dashboard)/page.tsx)
export default function Home() {
  return <h1>Welcome Home!</h1>;
}

// loginform.tsx
router.push('/');  // ← Go to app/page.tsx
```

**Option C: Conditional redirect**
```tsx
// loginform.tsx
const { data, error } = await supabase.auth.signInWithPassword({...});

if (data.user?.user_metadata?.role === 'admin') {
  router.push('/admin');
} else {
  router.push('/dashboard');
}
```

**Option D: Setup redirect di Supabase**
```typescript
// app/utils/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseKey);

// Setup auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User sudah login
    // Auto redirect ke dashboard
  }
});
```

---

# 🖼️ **PART 4: MENAMBAH LOGO .PNG**

## **Step 1: Simpan Logo**
```
app/
├── assets/
│   └── logo.png  ← Letakkan di sini
└── (auth)/
```

## **Step 2: Import di Layout**

```tsx
// app/(auth)/layout.tsx
import Image from 'next/image';

// ... existing imports

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* LOGO */}
          <Image
            src="/assets/logo.png"
            alt="Student Planning Logo"
            width={100}
            height={100}
            priority
          />
          
          {/* LOGIN FORM */}
          {children}
        </div>
      </body>
    </html>
  );
}
```

## **Step 3: Atau di Login Page**

```tsx
// app/(auth)/login/page.tsx
import Image from 'next/image';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* LOGO */}
      <div className="text-center mb-8">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={80}
          height={80}
        />
      </div>
      
      {/* Form content */}
    </div>
  );
}
```

## **Step 4: Styling Logo**

```tsx
<div className="mb-8">
  <Image
    src="/assets/logo.png"
    alt="Logo"
    width={100}
    height={100}
    className="rounded-full shadow-lg mx-auto"
  />
</div>

// Tailwind classes:
// - rounded-full: Circular
// - shadow-lg: Shadow effect
// - mx-auto: Center horizontal
// - mb-8: Margin bottom
```

---

# 🚀 **PART 5: YANG BISA DIKEMBANGKAN**

## **Level 1: Easy (Buat nilai A)**

1. **Ubah Styling**
   - Warna button dari biru ke hijau
   - Background color
   - Font size
   - Border radius

   ```tsx
   // loginform.tsx (line 151)
   // OLD:
   className="bg-blue-700 hover:bg-blue-800"
   
   // NEW (Hijau):
   className="bg-green-700 hover:bg-green-800"
   
   // Warna lain:
   // - red: bg-red-700
   // - purple: bg-purple-700
   // - yellow: bg-yellow-700
   ```

2. **Tambah Text/Label**
   - Ubah "Welcome Back" jadi "Selamat Datang"
   - Ubah button text
   - Ubah placeholder text

3. **Tambah Input Field**
   ```tsx
   // registerform.tsx
   const [phone, setPhone] = useState('');
   
   // Di form, tambah:
   <div>
     <label>Phone Number</label>
     <input
       type="tel"
       value={phone}
       onChange={(e) => setPhone(e.target.value)}
       placeholder="+62 812-3456-7890"
     />
   </div>
   ```

4. **Tambah Logo/Image**
   - Sudah dijelaskan di atas

## **Level 2: Medium (Buat nilai B)**

1. **Email Verification**
   ```tsx
   // Setelah register, kirim verification code
   // User harus confirm email sebelum bisa login
   ```

2. **Remember Me Functionality**
   ```tsx
   // Simpan email di localStorage
   if (rememberMe) {
     localStorage.setItem('rememberedEmail', email);
   }
   
   // Load saat halaman dibuka
   useEffect(() => {
     const saved = localStorage.getItem('rememberedEmail');
     if (saved) setEmail(saved);
   }, []);
   ```

3. **Password Strength Indicator**
   ```tsx
   // Tampil weak/medium/strong saat user ketik password
   function getPasswordStrength(pwd) {
     if (pwd.length < 6) return 'Weak';
     if (pwd.length < 10) return 'Medium';
     return 'Strong';
   }
   ```

4. **Social Login (Google/GitHub)**
   - Uncomment code yang ada
   - Setup di Supabase

## **Level 3: Hard (Buat nilai A+)**

1. **Two-Factor Authentication (2FA)**
   - After login, send code ke email/SMS
   - User harus confirm code

2. **Rate Limiting**
   - Limit login attempts
   - Block setelah 5 kali gagal

3. **Session Management**
   ```tsx
   // Check if user masih login
   // Auto logout jika token expired
   // Show user profile
   ```

4. **Dark Mode**
   ```tsx
   // Toggle light/dark theme
   // Simpan preference di localStorage
   ```

5. **Multi-Language Support**
   ```tsx
   // English, Indonesian, Mandarin
   // Switch language dengan dropdown
   ```

---

# 🏗️ **PART 6: FRONTEND & BACKEND STRUCTURE**

## **Frontend Architecture**

```
┌─────────────────────────────────────────┐
│        BROWSER (Frontend)               │
├─────────────────────────────────────────┤
│                                         │
│  app/(auth)/login/page.tsx              │
│  │  Controller yang manage state        │
│  │  Render komponen sesuai step         │
│  │                                      │
│  ├── LoginForm.tsx                      │
│  │   ├── UI: Input email & password     │
│  │   ├── Validasi: if-else logic       │
│  │   ├── Event: onChange, onClick       │
│  │   └── Submit: Call Supabase API      │
│  │                                      │
│  ├── RegisterForm.tsx                   │
│  │   ├── UI: Multiple inputs            │
│  │   ├── Validasi: Password match       │
│  │   └── Submit: Create user & profile  │
│  │                                      │
│  ├── OtpForm.tsx                        │
│  │   ├── 6-digit OTP input              │
│  │   └── Verify code                    │
│  │                                      │
│  └── NewPasswordForm.tsx                │
│      └── Reset password                 │
│                                         │
│  utils/supabase.ts                      │
│  └── Supabase client instance           │
│      (Bridge ke backend)                │
│                                         │
└─────────────────────────────────────────┘
         │
         │ HTTPS Request
         ↓
```

## **Backend Architecture**

```
┌─────────────────────────────────────────┐
│      SUPABASE CLOUD (Backend)           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ AUTH SERVICE ────────────────────┐  │
│  │  api/v1/auth                      │  │
│  │  ├── /signup       (POST)         │  │
│  │  ├── /signin       (POST)         │  │
│  │  ├── /logout       (POST)         │  │
│  │  ├── /refresh      (POST)         │  │
│  │  └── /verify-otp   (POST)         │  │
│  │                                   │  │
│  │  Database: auth.users             │  │
│  │  ├── id (UUID)                    │  │
│  │  ├── email                        │  │
│  │  ├── password (bcrypt hash)       │  │
│  │  └── sessions                     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ STORAGE SERVICE ─────────────────┐  │
│  │ database/public                   │  │
│  │ ├── tb_user (table)               │  │
│  │ │   ├── id (FK to auth.users)     │  │
│  │ │   ├── email                     │  │
│  │ │   ├── username                  │  │
│  │ │   ├── password (empty)          │  │
│  │ │   └── created_at                │  │
│  │ │                                 │  │
│  │ └── tb_schedules, tb_tasks (dll)  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ EMAIL SERVICE ───────────────────┐  │
│  │ Send verification emails          │  │
│  │ Send password reset emails        │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## **Request-Response Flow**

```
REGISTER FLOW:

Frontend (Browser)
  │
  ├─ User Input:
  │  fullName: "John Doe"
  │  email: "john@mail.com"
  │  password: "secure123"
  │
  ├─ Frontend Validasi (IF-ELSE)
  │  ✓ Name not empty?
  │  ✓ Email valid format?
  │  ✓ Password >= 6 chars?
  │  ✓ Confirm password match?
  │
  └─ HTTPS POST Request
          │
          ├─ URL: https://yabzjdlnzuvamoftvmktv.supabase.co/auth/v1/signup
          ├─ Body:
          │  {
          │    "email": "john@mail.com",
          │    "password": "secure123",
          │    "data": { "full_name": "John Doe" }
          │  }
          │
          ├─ Headers:
          │  Authorization: Bearer ANON_KEY
          │  Content-Type: application/json
          │
          ↓
Backend (Supabase)
  │
  ├─ Validate Request
  │  ✓ API key valid?
  │  ✓ Email format valid?
  │  ✓ Password >= 6 chars?
  │
  ├─ Check Database
  │  - Email sudah ada?
  │  - Duplikat?
  │
  ├─ Hash Password
  │  "secure123" → bcrypt → $2b$10$N9qo8uL...
  │
  ├─ Create User (auth.users)
  │  INSERT:
  │  {
  │    id: "uuid-123",
  │    email: "john@mail.com",
  │    password: "$2b$10$N9qo8uL...",
  │    created_at: now()
  │  }
  │
  └─ HTTPS Response (JSON)
          │
          ├─ Status: 200 OK
          ├─ Body:
          │  {
          │    "user": {
          │      "id": "uuid-123",
          │      "email": "john@mail.com"
          │    }
          │  }
          │
          ↓
Frontend (Browser)
  │
  ├─ Receive Response
  │  const { data } = response;
  │  const userId = data.user.id;
  │
  ├─ INSERT ke tb_user
  │  HTTPS POST:
  │  {
  │    "id": "uuid-123",
  │    "email": "john@mail.com",
  │    "username": "john_doe",
  │    "password": "",
  │    "created_at": now()
  │  }
  │
  ├─ Show Success Message
  │  Redirect ke halaman login
  │
  └─ Done!
```

---

# 💾 **PART 7: DATABASE DEEP DIVE**

## **Table Structure: tb_user**

```sql
CREATE TABLE public.tb_user (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  username text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tb_user_pkey PRIMARY KEY (id)
);

PENJELASAN KOLOM:
┌──────────────┬──────────────────┬────────────────────────────┐
│ Nama Kolom   │ Tipe Data        │ Penjelasan                 │
├──────────────┼──────────────────┼────────────────────────────┤
│ id           │ uuid PRIMARY KEY │ Unique identifier          │
│              │ DEFAULT random   │ Auto-generate ketika insert│
│              │                  │                            │
│ email        │ text UNIQUE      │ Email user (tidak boleh    │
│              │ NOT NULL         │ duplikat, wajib diisi)     │
│              │                  │                            │
│ password     │ text NOT NULL    │ Biasanya kosong (di       │
│              │                  │ auth.users password)       │
│              │                  │                            │
│ username     │ text UNIQUE      │ Username untuk profil      │
│              │                  │ (optional, unique)         │
│              │                  │                            │
│ created_at   │ timestamptz      │ Waktu pembuatan akun       │
│              │ DEFAULT now()    │ Auto-insert current time   │
└──────────────┴──────────────────┴────────────────────────────┘
```

## **Relasi dengan auth.users**

```
┌─────────────────────────────────────────────────────┐
│                   SUPABASE AUTH                     │
│  auth.users (Built-in, managed by Supabase)        │
│  ┌─────────────────────────────────────────────┐   │
│  │ id (UUID): abc-123-def-456                  │   │
│  │ email: john@mail.com                        │   │
│  │ password: $2b$10$N9qo8uL... (bcrypt hash)   │   │
│  │ created_at: 2026-05-18 10:00:00             │   │
│  │ user_metadata: { full_name: "John Doe" }   │   │
│  └─────────────────────────────────────────────┘   │
│               ↑ Foreign Key Reference              │
│               │ (Jika user dihapus)                │
└───────────────┼─────────────────────────────────────┘
                │
    ┌───────────┴────────────────────────────────────┐
    │                                                │
    ↓                                                │
┌─────────────────────────────────────────────────┐ │
│        PUBLIC DATABASE (Supabase)               │ │
│  public.tb_user (Table yang kita buat)         │ │
│  ┌───────────────────────────────────────────┐ │ │
│  │ id: abc-123-def-456 ◄─ FOREIGN KEY       │ │ │
│  │ email: john@mail.com                      │ │ │
│  │ username: john_doe                        │ │ │
│  │ password: ""                              │ │ │
│  │ created_at: 2026-05-18 10:00:00           │ │ │
│  └───────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────┘ │
                                                    │
    ┌───────────────────────────────────────────────┘
    │ CASCADE DELETE
    │ Jika auth.users.id dihapus
    │ → tb_user row dengan id yang sama juga dihapus
```

## **Cara Mengubah Table Tujuan**

### **Scenario 1: Ganti dari tb_user ke users**

**Step 1: Create tabel baru di Supabase SQL**
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE NOT NULL,
  created_at timestamp DEFAULT now()
);
```

**Step 2: Update registerform.tsx**
```tsx
// OLD:
const { error: profileError } = await supabase
  .from('tb_user')  // ← Tabel lama
  .insert([...]);

// NEW:
const { error: profileError } = await supabase
  .from('users')  // ← Tabel baru
  .insert([{
    id: data.user.id,
    full_name: fullName,
    email,
    created_at: new Date().toISOString(),
  }]);
```

**Step 3: Test**
- Register user baru
- Cek di Supabase → data masuk ke `users` table

### **Scenario 2: Tambah Column Baru ke tb_user**

```sql
-- Add column baru
ALTER TABLE public.tb_user ADD COLUMN phone_number TEXT;
ALTER TABLE public.tb_user ADD COLUMN avatar_url TEXT;
ALTER TABLE public.tb_user ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Drop column (delete)
ALTER TABLE public.tb_user DROP COLUMN phone_number;

-- Modify column type
ALTER TABLE public.tb_user ALTER COLUMN username SET NOT NULL;
```

**Update registerform.tsx:**
```tsx
const { error: profileError } = await supabase.from('tb_user').insert([
  {
    id: data.user.id,
    email,
    username: fullName.toLowerCase().replace(/\s+/g, '_'),
    password: '',
    phone_number: '+62812345678',  // ← Kolom baru
    avatar_url: null,               // ← Kolom baru
    is_verified: false,             // ← Kolom baru
    created_at: new Date().toISOString(),
  },
]);
```

### **Scenario 3: Query Data dari Table**

```tsx
// Get user profile setelah login
const getCurrentUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Query dari tb_user
  const { data, error } = await supabase
    .from('tb_user')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return data;
};

// Usage di component:
useEffect(() => {
  const profile = await getCurrentUserProfile();
  console.log(profile);
  // Output:
  // {
  //   id: "uuid",
  //   email: "john@mail.com",
  //   username: "john_doe",
  //   created_at: "2026-05-18 10:00:00"
  // }
}, []);
```

---

# 📊 **PART 8: FLOW DIAGRAM LENGKAP**

## **Complete Register Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. USER INTERFACE                           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Register Form                                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ Full Name:      John Doe                    [Icon] │  │    │
│  │  │ Email:          john@mail.com              [Icon] │  │    │
│  │  │ Password:       ••••••••••               [Show] │  │    │
│  │  │ Confirm Pwd:    ••••••••••               [Show] │  │    │
│  │  │                                                │  │    │
│  │  │                 [Create Button]             │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │  Already have account? [Login]                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│                    User click "Create"                          │
│                         │                                       │
│                         ↓                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              2. FRONTEND VALIDATION (IF-ELSE)                   │
│                                                                 │
│  handleSubmit() {                                               │
│    ├─ Cek fullName ada? NO  → Error: "Name required"           │
│    ├─ Cek email ada? NO     → Error: "Email required"          │
│    ├─ Cek password >= 6? NO → Error: "Min 6 chars"            │
│    ├─ Cek confirm match? NO → Error: "Password not match"     │
│    └─ SEMUA OK? → Lanjut ke step 3                             │
│                                                                 │
│  Jika ada error: tampil di UI, STOP di sini                   │
└─────────────────────────────────────────────────────────────────┘
          │
          │ Validasi OK
          ↓

┌─────────────────────────────────────────────────────────────────┐
│           3. LOADING STATE & SHOW SPINNER                       │
│                                                                 │
│  setLoading(true);                                              │
│  ← Button disable, spinner show                                 │
│  ← Prevent double-click                                         │
└─────────────────────────────────────────────────────────────────┘
          │
          ↓

┌─────────────────────────────────────────────────────────────────┐
│        4. TRY BLOCK - SIGN UP KE SUPABASE AUTH                  │
│                                                                 │
│  const { data, error } = await supabase.auth.signUp({          │
│    email: "john@mail.com",                                      │
│    password: "secure123",                                       │
│    options: {                                                   │
│      data: { full_name: "John Doe" }                            │
│    }                                                            │
│  });                                                            │
│                                                                 │
│  HTTPS Request ke:                                              │
│  supabase.co/auth/v1/signup                                     │
│                                                                 │
│  ├─ Validasi request (API key, format, dll)                    │
│  ├─ Cek email belum terdaftar                                  │
│  ├─ Hash password (bcrypt)                                     │
│  ├─ INSERT ke auth.users table                                 │
│  ├─ Generate session token                                     │
│  └─ Return user object + token                                 │
│                                                                 │
│  Response kembali ke frontend:                                  │
│  {                                                              │
│    data: {                                                      │
│      user: {                                                    │
│        id: "uuid-123-456",                                      │
│        email: "john@mail.com",                                  │
│        user_metadata: { full_name: "John Doe" }                │
│      },                                                         │
│      session: { access_token: "eyJa...", refresh_token: "..." }│
│    },                                                           │
│    error: null                                                  │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
          │
          │ Cek error
          ├─ Ada error (email exist, invalid format, dll)
          │       ↓
          │   GOTO: CATCH BLOCK
          │
          └─ Tidak ada error (success)
                  ↓

┌─────────────────────────────────────────────────────────────────┐
│      5. INSERT PROFIL KE tb_user (PUBLIC DATABASE)              │
│                                                                 │
│  if (data.user) {  // Jika user berhasil dibuat                │
│    await supabase.from('tb_user').insert([{                    │
│      id: "uuid-123-456",        ← FK to auth.users             │
│      email: "john@mail.com",                                    │
│      username: "john_doe",                                      │
│      password: "",              ← Kosong (tidak pakai)         │
│      created_at: "2026-05-18 10:00:00"                         │
│    }]);                                                         │
│  }                                                              │
│                                                                 │
│  HTTPS POST ke:                                                 │
│  supabase.co/rest/v1/tb_user                                    │
│                                                                 │
│  Response:                                                      │
│  - 201 Created ✓                                               │
│  - 401 Unauthorized (RLS policy issue)                         │
│  - 404 Not Found (table tidak ada)                             │
│                                                                 │
│  Jika error, catch di profileError (tapi jangan block flow)    │
└─────────────────────────────────────────────────────────────────┘
          │
          ↓

┌─────────────────────────────────────────────────────────────────┐
│          6. SUCCESS - CALL onSuccess() HANDLER                  │
│                                                                 │
│  onSuccess();  ← Dipanggil dari parent (page.tsx)              │
│                                                                 │
│  Parent function:                                               │
│  const handleRegisterSuccess = () => {                          │
│    setStep('success');  ← Ubah step                            │
│  };                                                             │
│                                                                 │
│  Akibat: step berubah → React re-render                         │
│          → Tampil halaman Success                               │
└─────────────────────────────────────────────────────────────────┘
          │
          ↓

┌─────────────────────────────────────────────────────────────────┐
│        7. FINALLY BLOCK - CLEANUP                               │
│                                                                 │
│  finally {                                                      │
│    setLoading(false);  ← Hide spinner                          │
│  }                                                              │
│                                                                 │
│  Selalu dijalankan apakah success atau error!                  │
└─────────────────────────────────────────────────────────────────┘
          │
          ↓

┌─────────────────────────────────────────────────────────────────┐
│     ALTERNATIVE: CATCH BLOCK - ERROR HANDLING                   │
│                                                                 │
│  catch (err) {                                                  │
│    const errorMsg = err instanceof Error                        │
│      ? err.message                                              │
│      : 'Registration failed';                                   │
│                                                                 │
│    setError(errorMsg);  ← Tampil error message                 │
│  }                                                              │
│                                                                 │
│  Error ditampilkan di UI:                                       │
│  ┌──────────────────────────────────────┐                      │
│  │ ✗ Email already registered           │                      │
│  └──────────────────────────────────────┘                      │
│                                                                 │
│  User bisa coba lagi dengan email berbeda                      │
└─────────────────────────────────────────────────────────────────┘
          │
          ↓

┌─────────────────────────────────────────────────────────────────┐
│                    8. DONE!                                     │
│                                                                 │
│  ├─ success: Redirect ke login (atau auto login)              │
│  └─ error: Tampil error, tunggu user retry                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## **Complete Login Flow**

```
USER INPUT
└─→ FRONTEND VALIDASI (IF-ELSE)
    └─→ LOADING STATE
        └─→ supabase.auth.signInWithPassword()
            ├─→ BACKEND VERIFY PASSWORD (bcrypt)
            │   ├─→ Find user by email
            │   ├─→ Hash input password
            │   ├─→ Compare dengan stored hash
            │   └─→ If match → Generate token
            │
            ├─→ ERROR? (Catch block)
            │   └─→ setError() + Show message
            │
            └─→ SUCCESS? (Finally block)
                ├─→ Token saved ke localStorage
                ├─→ router.push('/dashboard')
                └─→ setLoading(false)
```

---

## **Key Takeaways untuk Project Sekolah**

```
✅ YANG SUDAH BERES:
- Authentication system (signup/login)
- Form validation
- Error handling
- Database integration
- Responsive UI

❓ NEXT STEPS:
1. Setup dashboard page (app/(dashboard)/page.tsx)
2. Add navbar/sidebar navigation
3. Create schedule management feature
4. Add task management
5. Setup logout functionality
6. Add user profile page

💡 UNTUK PRESENTASI:
- Explain architecture (Frontend → Backend → Database)
- Show code flow (line-by-line)
- Demo functionality (register → login → redirect)
- Highlight OOP & async concepts
- Explain security (password hashing, JWT token)
```

---

**END OF DOCUMENTATION**

Dokumentasi ini mencakup semua yang kamu tanyakan sebagai seorang programmer profesional yang mengajar student baru. Semua konsep dijelaskan dengan analogi dan contoh kode yang mudah dipahami!

