"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, FileText, DollarSign, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Teachers", href: "/teachers", icon: Users },
    { name: "Attendance", href: "/attendance", icon: CalendarCheck },
    { name: "Rules & Penalties", href: "/rules", icon: FileText },
    { name: "Salary", href: "/salary", icon: DollarSign },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, userProfile } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <div className="flex h-full flex-col bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 w-64">
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TWMS</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                                        }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center mb-4">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                            {userProfile?.name || user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 first-letter:uppercase">
                            {userProfile?.role || "Admin"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
