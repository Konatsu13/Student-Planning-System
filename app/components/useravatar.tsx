import Image from 'next/image';

interface UserAvatarProps {
  gender: string;      // Menerima data "Laki-laki" atau "Perempuan" dari komponen induk
  size?: number;       
  className?: string;  
}

export default function UserAvatar({ gender, size = 40, className = "" }: UserAvatarProps) {
  // Tentukan path gambar berdasarkan jenis kelamin (case-insensitive & robust)
  const isFemale = ['perempuan', 'female', 'p', 'w'].includes(gender?.toLowerCase()?.trim() || '');
  const avatarSrc = isFemale 
    ? '/assets/avatar-w.jpeg' 
    : '/assets/avatar-m.jpeg'; 

  return (
    <Image
      src={avatarSrc}
      alt={`Avatar ${gender}`}
      width={size}
      height={size}
      className={`rounded-full object-cover border border-gray-200 ${className}`}
    />
  );
}