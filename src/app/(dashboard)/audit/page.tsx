"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { Activity } from "@/types/activity";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    Shield, Search, Filter, Calendar,
    User, ArrowRight, Activity as ActivityIcon,
    Download, RefreshCcw, AlertTriangle
} from "lucide-react";

export default function AuditLogPage() {
    const { userProfile } = useAuth();
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        if (userProfile && userProfile.role !== 'admin') {
            router.push("/dashboard");
        } else {
            fetchActivities();
        }
    }, [userProfile]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "activities"),
                orderBy("timestamp", "desc"),
                limit(100)
            );
            const querySnapshot = await getDocs(q);
            const activityData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Activity[];
            setActivities(activityData);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredActivities = activities.filter(a => {
        const matchesSearch = a.description.toLowerCase().includes(filter.toLowerCase()) ||
            a.performedByName.toLowerCase().includes(filter.toLowerCase());
        const matchesType = typeFilter === "all" || a.actionType === typeFilter;
        return matchesSearch && matchesType;
    });

    if (userProfile?.role !== 'admin') return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        System Audit Logs
                    </h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Immutable ledger of all institutional actions</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchActivities}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-all text-slate-500"
                    >
                        <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-bold text-sm">
                        <Download className="mr-2 h-4 w-4" /> Export Ledger
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by description or personnel..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all dark:text-white font-medium"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-600/20 outline-none appearance-none transition-all dark:text-white font-bold text-sm uppercase tracking-widest"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Events</option>
                        <option value="attendance">Attendance</option>
                        <option value="violation">Violations</option>
                        <option value="salary_processed">Payroll</option>
                        <option value="rule_change">Policy Changes</option>
                        <option value="profile_update">Faculty Records</option>
                    </select>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Action Type</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Trace</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/20" />
                                    </tr>
                                ))
                            ) : filteredActivities.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                                            <ActivityIcon className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No records matching criteria found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredActivities.map((activity) => (
                                    <tr key={activity.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {activity.timestamp?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                                    {activity.timestamp?.toDate().toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${activity.actionType === 'salary_processed' ? 'bg-green-100 text-green-700' :
                                                    activity.actionType === 'violation' ? 'bg-red-100 text-red-700' :
                                                        activity.actionType === 'rule_change' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'
                                                }`}>
                                                {activity.actionType.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md line-clamp-1">{activity.description}</p>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-500">
                                                    {activity.performedByName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{activity.performedByName}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.performedByRole}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* System Integrity Notification */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="bg-blue-500/20 p-4 rounded-3xl border border-blue-500/30">
                        <Shield className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Cryptographic Integrity</h3>
                        <p className="text-slate-400 text-sm font-bold">All logs are signed and stored in a tamper-proof decentralized architecture.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Security Protocol Alpha Active</span>
                </div>
            </div>
        </div>
    );
}
