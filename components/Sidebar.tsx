"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const item = (href: string, label: string) => (
    <Link
      href={href}
      className={`block px-3 py-2 rounded hover:bg-gray-100 ${pathname === href ? "bg-gray-100 font-medium" : ""}`}
    >
      {label}
    </Link>
  );
  return (
    <aside className="w-60 border-r p-3 h-[calc(100vh-56px)] sticky top-14 hidden md:block">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Navigation</div>
      <div className="space-y-1">
        {item("/dashboard", "Overview")}
        {item("/dashboard/customers", "Customers")}
        {item("/dashboard/customers?filter=due", "Due Customers")}
        {item("/dashboard/reports", "Reports")}
      </div>
    </aside>
  );
}


