"use client";

import { useEffect, useState } from "react";
import { getTeachers } from "@/lib/firebase/teachers";
import { TeacherProfile } from "@/types/teacher";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, FileText, Users } from "lucide-react";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const data = await getTeachers();
            setTeachers(data);
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter((teacher) =>
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Teachers</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your workforce</p>
                </div>
                <Link
                    href="/teachers/add"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Teacher
                </Link>
            </div>

            <div className="relative group max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search teachers by name or email..."
                    className="pl-12 w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-medium">Loading teachers...</div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <Users className="h-8 w-8" />
                        </div>
                        <p className="text-slate-400 font-medium">No teachers found. Add one to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Teacher</th>
                                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Department</th>
                                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th scope="col" className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredTeachers.map((teacher) => (
                                    <tr key={teacher.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110 overflow-hidden">
                                                    {teacher.photoURL ? (
                                                        <img className="h-10 w-10 object-cover" src={teacher.photoURL} alt="" />
                                                    ) : (
                                                        teacher.fullName.charAt(0)
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{teacher.fullName}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{teacher.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">{teacher.designation}</div>
                                            <div className="text-xs text-slate-400 font-medium">{teacher.contractType}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500 dark:text-gray-400">
                                            {teacher.department}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${teacher.status === 'active' ? 'bg-green-100 text-green-800' :
                                                teacher.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                {teacher.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <Link href={`/teachers/${teacher.id}`} className="inline-flex items-center px-4 py-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-xl transition-all font-bold text-xs">
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
