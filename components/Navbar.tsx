"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">My Gym</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className={pathname?.startsWith("/dashboard") ? "font-semibold" : ""}>Dashboard</Link>
          <Link href="/dashboard/customers" className={pathname === "/dashboard/customers" ? "font-semibold" : ""}>Customers</Link>
          <Link href="/dashboard/reports" className={pathname === "/dashboard/reports" ? "font-semibold" : ""}>Reports</Link>
        </nav>
      </div>
    </header>
  );
}


