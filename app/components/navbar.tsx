import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-gray-800 text-white flex items-center justify-between px-4">
      <Link href="\" className="h-16">
        Home
      </Link>
      <Link href="\" className="h-16">
        About
      </Link>
      <Link href="\" className="h-16">
        Contact
      </Link>
      <Link href="\" className="h-16">
        Profile
      </Link>
    </nav>
  )
} 

