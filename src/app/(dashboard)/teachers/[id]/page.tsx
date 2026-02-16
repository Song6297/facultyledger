"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TeacherProfile } from "@/types/teacher";
import { ArrowLeft, Mail, Phone, Building, Briefcase, Calendar, DollarSign, FileText, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { deleteTeacher } from "@/lib/firebase/teachers";

export default function TeacherDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTeacher();
        }
    }, [id]);

    const fetchTeacher = async () => {
        try {
            const docRef = doc(db, "teachers", id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setTeacher({ id: docSnap.id, ...docSnap.data() } as TeacherProfile);
            }
        } catch (error) {
            console.error("Error fetching teacher:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this teacher? This action cannot be undone.")) {
            try {
                await deleteTeacher(id as string);
                router.push("/teachers");
            } catch (error) {
                console.error("Error deleting teacher:", error);
                alert("Failed to delete teacher");
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading profile...</div>;
    if (!teacher) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Teacher not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/teachers" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Profile</h1>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </button>
                    <button onClick={handleDelete} className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center text-center space-y-4">
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-300 overflow-hidden">
                        {teacher.photoURL ? (
                            <img src={teacher.photoURL} alt={teacher.fullName} className="h-full w-full object-cover" />
                        ) : (
                            teacher.fullName.charAt(0)
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{teacher.fullName}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{teacher.designation}</p>
                        <span className={`mt-2 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${teacher.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {teacher.status}
                        </span>
                    </div>
                </div>

                {/* Details Card */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 mb-4">Contact & Work</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>{teacher.email}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{teacher.phone}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Building className="h-4 w-4 mr-2" />
                                <span>{teacher.department}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Briefcase className="h-4 w-4 mr-2" />
                                <span>{teacher.contractType}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 mb-4">Financial Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span>Base Salary: ₹{teacher.salaryBase}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Building className="h-4 w-4 mr-2" />
                                <span>Bank: {teacher.bankAccount?.bankName}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <FileText className="h-4 w-4 mr-2" />
                                <span>Acc: {teacher.bankAccount?.accountNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
