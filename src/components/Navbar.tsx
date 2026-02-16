"use client";

import { Bell } from "lucide-react";

export default function Navbar() {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard</h2>
            <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300">
                    <Bell className="h-6 w-6" />
                </button>
                {/* Placeholder for user dropdown or settings */}
            </div>
        </header>
    );
}
