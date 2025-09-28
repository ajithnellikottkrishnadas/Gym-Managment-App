"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ShoppingBag,
  BarChart,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const item = (href: string, label: string, Icon: any) => (
<Link
  href={href}
  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${
    pathname === href
      ? "bg-white text-gray-900 font-semibold shadow-md"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`}
>
  <Icon className="w-5 h-5" />
  {!collapsed && <span>{label}</span>}
</Link>

  );

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      }  max-h-screen flex flex-col transition-all duration-300`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6">
        {collapsed ? (
          <div className="w-8 h-8 bg-gray-300 rounded-lg" />
        ) : (
          <span className="font-bold text-xl text-gray-900">My Gym</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {item("/dashboard", "Dashboard", Home)}
        {item("/dashboard/customers", "Customers", Users)}
        {item("/dashboard/reports", "Reports", BarChart)}
      </nav>

      {/* Footer */}
      <div className="p-4 flex flex-col gap-3">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center p-2 rounded-lg bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </aside>
  );
}
