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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Holistic overview of organizational performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    subtitle={`${stats.activeTeachers} Active`}
                    icon={<Users className="h-6 w-6" />}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Attendance Today"
                    value={`${stats.todayPresent}/${stats.totalTeachers}`}
                    subtitle={`${stats.todayLate} Late arrivals`}
                    icon={<Clock className="h-6 w-6" />}
                    color="bg-green-600"
                />
                <StatCard
                    title="Policy Violations"
                    value={stats.totalViolations}
                    subtitle="Requires review"
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Salary Disbursed"
                    value={`₹${stats.totalSalaryPaid.toLocaleString()}`}
                    subtitle="Current cycle"
                    icon={<IndianRupee className="h-6 w-6" />}
                    color="bg-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1 */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Department Distribution</h3>
                        <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time</div>
                    </div>
                    <div className="relative h-64 flex items-center justify-center">
                        {/* Styled Placeholder SVG for Chart */}
                        <svg className="w-full h-full text-slate-100 dark:text-slate-700/50" viewBox="0 0 400 200">
                            <circle cx="200" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="20" strokeDasharray="150 100" />
                            <circle cx="200" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="20" strokeDasharray="50 200" className="text-blue-600" />
                            <circle cx="200" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="20" strokeDasharray="30 220" className="text-purple-600" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <p className="text-sm font-bold text-slate-400">Visualization Engine</p>
                            <p className="text-xs text-slate-300">Awaiting data stream...</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-50 dark:border-slate-700">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Science</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">42%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Arts</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">35%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Comm.</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">23%</p>
                        </div>
                    </div>
                </div>

                {/* Chart 2 */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance Trends</h3>
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <div className="h-2 w-2 rounded-full bg-slate-200" />
                        </div>
                    </div>
                    <div className="relative h-64 flex items-end justify-between px-4">
                        {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                            <div key={i} className="w-8 bg-slate-50 dark:bg-slate-900 rounded-t-lg relative group">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-blue-600/20 group-hover:bg-blue-600 transition-all rounded-t-lg"
                                    style={{ height: `${h}%` }}
                                />
                            </div>
                        ))}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <p className="text-sm font-bold text-slate-400">Trend Analysis</p>
                            <p className="text-xs text-slate-300">Processing weekly logs...</p>
                        </div>
                    </div>
                    <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`${color} p-3 rounded-xl text-white shadow-lg shadow-${color.split('-')[1]}-600/20 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                    <Clock className="h-4 w-4" />
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
                <div className="flex items-center mt-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full">{subtitle}</span>
                </div>
            </div>
        </div>
    )
}
