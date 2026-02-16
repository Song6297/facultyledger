"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, FileText, DollarSign, BarChart3, Settings, LogOut, ShieldAlert, FolderOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Teachers", href: "/teachers", icon: Users },
    { name: "Attendance", href: "/attendance", icon: CalendarCheck },
    { name: "Rules & Penalties", href: "/rules", icon: ShieldAlert },
    { name: "Salary", href: "/salary", icon: DollarSign },
    { name: "Audit Logs", href: "/audit", icon: BarChart3 },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Documents", href: "/documents", icon: FolderOpen },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, userProfile } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <div className="flex h-full flex-col bg-[#1e293b] text-slate-300 w-64 border-r border-slate-800">
            <div className="flex items-center px-6 h-16 mb-6 mt-4">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white mr-3">
                    <Users className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">TWMS</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-3">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        // Role-based visibility
                        const isManagement = userProfile?.role === 'admin' || userProfile?.role === 'principal';
                        const isAdmin = userProfile?.role === 'admin';

                        if (item.name === "Audit Logs" && !isAdmin) return null;
                        if ((item.name === "Salary" || item.name === "Teachers" || item.name === "Rules & Penalties" || item.name === "Analytics") && !isManagement) return null;

                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                        }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 mt-auto border-t border-slate-800/50">
                <div className="flex items-center px-4 py-3 mb-4 rounded-lg bg-slate-800/30">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                        <Users className="h-5 w-5" />
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">
                            {userProfile?.name || "User"}
                        </p>
                        <p className="text-xs text-slate-500 first-letter:uppercase">
                            {userProfile?.role || "Admin"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
