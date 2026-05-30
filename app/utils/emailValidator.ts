import disposableDomains from 'disposable-email-domains';

export async function checkEmail(email: string): Promise<boolean> {
  if (!email || !email.includes('@')) return false;

  // Ambil domain setelah tanda '@'
  const domain = email.split('@')[1].toLowerCase().trim();

  // Cek apakah domain ada di daftar hitam ribuan email sementara
  if (disposableDomains.includes(domain)) {
    return false; // Email palsu terdeteksi
  }

  return true; // Email aman dan valid
}