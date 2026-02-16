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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Attendance</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Teacher</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Check In</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Check Out</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {teachers.map((teacher) => {
                                const record = attendance.find(r => r.teacherId === teacher.id);
                                const isCheckedIn = !!record;
                                const isCheckedOut = !!record?.checkOut;

                                return (
                                    <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                                                    {teacher.fullName.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.fullName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatTime(record?.checkIn || null)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatTime(record?.checkOut || null)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record?.status || 'absent')}`}>
                                                {record?.status || 'Absent'}
                                            </span>
                                            {record?.lateMinutes && record.lateMinutes > 0 ? (
                                                <span className="ml-2 text-xs text-red-500 font-medium">
                                                    (+{record.lateMinutes} min)
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {!isCheckedIn ? (
                                                <button
                                                    onClick={() => handleCheckIn(teacher)}
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                                                >
                                                    Check In
                                                </button>
                                            ) : !isCheckedOut ? (
                                                <button
                                                    onClick={() => handleCheckOut(teacher.id!)} // Assuming teacher.id is available, checkOut currently needs string
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Check Out
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 cursor-not-allowed">Completed</span>
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
