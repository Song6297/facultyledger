"use client";

import { useEffect, useState } from "react";
import { getTeachers } from "@/lib/firebase/teachers";
import { getTodayAttendance, checkIn, checkOut } from "@/lib/firebase/attendance";
import { TeacherProfile } from "@/types/teacher";
import { AttendanceRecord } from "@/types/attendance";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export default function AttendancePage() {
    const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teachersData, attendanceData] = await Promise.all([
                getTeachers(),
                getTodayAttendance(),
            ]);
            setTeachers(teachersData);
            setAttendance(attendanceData);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (teacher: TeacherProfile) => {
        try {
            await checkIn(teacher.id!, teacher.fullName);
            fetchData(); // Refresh data
        } catch (error) {
            alert("Failed to check in: " + error);
        }
    }

    const handleCheckOut = async (teacherId: string) => {
        try {
            await checkOut(teacherId); // You need to implement checkOut in firebase/attendance.ts first if not present
            fetchData(); // Refresh data
        } catch (error) {
            alert("Failed to check out: " + error);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'late': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'absent': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
        }
    }

    const formatTime = (timestamp: Timestamp | null) => {
        if (!timestamp) return "-";
        return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading attendance...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="px-4 py-1 text-center border-r border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Present</p>
                        <p className="text-lg font-bold text-green-600">{attendance.filter(a => a.status === 'present' || a.status === 'late').length}</p>
                    </div>
                    <div className="px-4 py-1 text-center">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Absent</p>
                        <p className="text-lg font-bold text-red-600">{teachers.length - attendance.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Teacher</th>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Check In</th>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Check Out</th>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th scope="col" className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {teachers.map((teacher) => {
                                const record = attendance.find(r => r.teacherId === teacher.id);
                                const isCheckedIn = !!record;
                                const isCheckedOut = !!record?.checkOut;

                                return (
                                    <tr key={teacher.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110">
                                                    {teacher.fullName.charAt(0)}
                                                </div>
                                                <div className="ml-4 text-sm font-bold text-slate-900 dark:text-white">{teacher.fullName}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {formatTime(record?.checkIn || null)}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {formatTime(record?.checkOut || null)}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${getStatusColor(record?.status || 'absent')}`}>
                                                    {record?.status || 'Absent'}
                                                </span>
                                                {record?.lateMinutes && record.lateMinutes > 0 ? (
                                                    <span className="flex items-center text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {record.lateMinutes}m
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            {!isCheckedIn ? (
                                                <button
                                                    onClick={() => handleCheckIn(teacher)}
                                                    className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all font-bold text-xs"
                                                >
                                                    Mark Present
                                                </button>
                                            ) : !isCheckedOut ? (
                                                <button
                                                    onClick={() => handleCheckOut(teacher.id!)}
                                                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-bold text-xs"
                                                >
                                                    Check Out
                                                </button>
                                            ) : (
                                                <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
