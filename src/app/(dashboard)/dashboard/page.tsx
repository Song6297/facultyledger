"use client";

import { useEffect, useState } from "react";
import { getTeachers } from "@/lib/firebase/teachers";
import { getTodayAttendance } from "@/lib/firebase/attendance";
import { getViolations } from "@/lib/firebase/rules";
import { Users, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalTeachers: 0,
        todayPresent: 0,
        todayLate: 0,
        violations: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [teachers, attendance, violations] = await Promise.all([
                    getTeachers(),
                    getTodayAttendance(),
                    getViolations(),
                ]);

                setStats({
                    totalTeachers: teachers.length,
                    todayPresent: attendance.filter(a => a.status === 'present' || a.status === 'late').length,
                    todayLate: attendance.filter(a => a.status === 'late' || (a.lateMinutes > 0)).length,
                    violations: violations.length,
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading overview...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                />
                <StatCard
                    title="Present Today"
                    value={stats.todayPresent}
                    icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                />
                <StatCard
                    title="Late Arrivals"
                    value={stats.todayLate}
                    icon={<Clock className="h-5 w-5 text-yellow-600" />}
                />
                <StatCard
                    title="Violations"
                    value={stats.violations}
                    icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-64 flex flex-col items-center justify-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mb-2 text-gray-300" />
                    <p>Attendance Trends will appear here as you collect data.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-64 flex flex-col items-center justify-center text-gray-500">
                    <Clock className="h-12 w-12 mb-2 text-gray-300" />
                    <p>Recent activity will be logged here.</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                {icon}
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}

import { BarChart3 } from "lucide-react";
