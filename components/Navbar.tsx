"use client";

import { Search, Bell, Settings, Plus } from "lucide-react";

export default function Navbar({ onNewMembership }: { onNewMembership: () => void }) {
  return (
    <header className="flex items-center justify-between h-16 px-6 transition-colors duration-300">
      {/* Dashboard Title */}
      <h1 className="text-xl font-bold text-gray-900">
        
      </h1>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative flex-shrink-0 w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-100 border border-transparent focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 placeholder-gray-500 transition-colors"
          />
        </div>

        {/* Create Button */}
        <button
          onClick={onNewMembership}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Membership
        </button>

        {/* Bell Icon */}
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Settings Icon */}
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
          <img
            src="https://via.placeholder.com/32"
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
