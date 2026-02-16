"use client";

import { useEffect, useState } from "react";
import { getTeachers } from "@/lib/firebase/teachers";
import { getTodayAttendance } from "@/lib/firebase/attendance";
import { getViolations } from "@/lib/firebase/rules";
import { Users, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Activity } from "@/types/activity";
import Link from "next/link";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalTeachers: 0,
        todayPresent: 0,
        todayLate: 0,
        violations: 0,
    });
    const [activities, setActivities] = useState<Activity[]>([]);
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

                // Fetch recent activities
                const q = query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(5));
                const activitySnap = await getDocs(q);
                setActivities(activitySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)));
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Overview</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={<Users className="h-6 w-6" />}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Present Today"
                    value={stats.todayPresent}
                    icon={<CheckCircle className="h-6 w-6" />}
                    color="bg-green-600"
                />
                <StatCard
                    title="Late Arrivals"
                    value={stats.todayLate}
                    icon={<Clock className="h-6 w-6" />}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Violations"
                    value={stats.violations}
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color="bg-red-600"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart Container */}
                <div className="xl:col-span-2 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Attendance Trends</h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="relative w-48 h-32 mb-6">
                            <svg className="w-full h-full text-slate-200 dark:text-slate-700" viewBox="0 0 100 50" fill="none" preserveAspectRatio="none">
                                <path d="M0 45 L20 35 L40 42 L60 20 L80 30 L100 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">Attendance Trends will appear here as you collect data.</p>
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-sm text-slate-400">Loading activity...</p>
                        ) : activities.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No recent activity detected.</p>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity, i) => (
                                    <ActivityItem
                                        key={activity.id}
                                        name={activity.performedByName}
                                        message={activity.description}
                                        time={activity.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        color={
                                            activity.actionType === 'salary_processed' ? 'bg-green-500' :
                                                activity.actionType === 'violation_recorded' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                        }
                                    />
                                ))}
                                <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-700">
                                    <Link href="/audit" className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 text-center block">
                                        View All Audit Logs
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center transition-all hover:shadow-md hover:scale-[1.02]">
            <div className={`${color} p-4 rounded-xl text-white mr-5 shadow-lg shadow-inherit/20`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{value}</p>
            </div>
        </div>
    );
}

function ActivityItem({ name, message, time, color }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className={`mt-1 h-8 w-8 rounded-full ${color} shrink-0 shadow-sm`} />
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {message}
                </p>
                <p className="text-xs text-slate-400 font-medium">{time}</p>
            </div>
        </div>
    );
}
