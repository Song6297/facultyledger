"use client";

import { useEffect, useState } from "react";
import { getTeachers } from "@/lib/firebase/teachers";
import { getTodayAttendance } from "@/lib/firebase/attendance";
import { getViolations } from "@/lib/firebase/rules";
import { getSalaryHistory } from "@/lib/firebase/salary";
import { Users, AlertTriangle, IndianRupee, Clock } from "lucide-react";

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalTeachers: 0,
        activeTeachers: 0,
        todayPresent: 0,
        todayLate: 0,
        totalViolations: 0,
        totalSalaryPaid: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [teachers, attendance, violations, salaries] = await Promise.all([
                getTeachers(),
                getTodayAttendance(),
                getViolations(),
                getSalaryHistory()
            ]);

            const paidSalaries = salaries.filter(s => s.status === 'paid');
            const totalPaid = paidSalaries.reduce((sum, s) => sum + s.netSalary, 0);

            setStats({
                totalTeachers: teachers.length,
                activeTeachers: teachers.filter(t => t.status === 'active').length,
                todayPresent: attendance.filter(a => a.status === 'present' || a.status === 'late').length,
                todayLate: attendance.filter(a => a.status === 'late' || (a.lateMinutes > 0)).length,
                totalViolations: violations.length,
                totalSalaryPaid: totalPaid,
            });

        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    subtitle={`${stats.activeTeachers} Active`}
                    icon={<Users className="h-6 w-6 text-blue-600" />}
                />
                <StatCard
                    title="Attendance Today"
                    value={`${stats.todayPresent}/${stats.totalTeachers}`}
                    subtitle={`${stats.todayLate} Late arrivals`}
                    icon={<Clock className="h-6 w-6 text-green-600" />}
                />
                <StatCard
                    title="Total Violations"
                    value={stats.totalViolations}
                    subtitle="All time"
                    icon={<AlertTriangle className="h-6 w-6 text-orange-600" />}
                />
                <StatCard
                    title="Salary Disbursed"
                    value={`₹${stats.totalSalaryPaid.toLocaleString()}`}
                    subtitle="Total Paid"
                    icon={<IndianRupee className="h-6 w-6 text-purple-600" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Department Distribution</h3>
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        {/* Placeholder for chart */}
                        Chart Component Placeholder
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attendance Trends</h3>
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        {/* Placeholder for chart */}
                        Chart Component Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
        </div>
    )
}
