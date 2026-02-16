"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TeacherProfile } from "@/types/teacher";
import { Activity } from "@/types/activity";
import {
    ArrowLeft, Mail, Phone, Building, Briefcase,
    Calendar, DollarSign, FileText, Trash2, Edit,
    AlertTriangle, Users
} from "lucide-react";
import Link from "next/link";
import { deleteTeacher } from "@/lib/firebase/teachers";
import { logActivity } from "@/lib/utils/activityLogger";
import { useAuth } from "@/context/AuthContext";

export default function TeacherDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, userProfile } = useAuth();

    const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'salary'>('profile');

    useEffect(() => {
        if (id) {
            fetchTeacher();
            fetchActivities();
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

    const fetchActivities = async () => {
        try {
            const q = query(
                collection(db, "activities"),
                where("userId", "==", id),
                orderBy("timestamp", "desc")
            );
            const querySnapshot = await getDocs(q);
            const activityData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Activity[];
            setActivities(activityData);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    const handleDelete = async () => {
        if (!isAdmin) {
            alert("Only administrators can terminate faculty records.");
            return;
        }

        if (confirm("Are you sure you want to terminate this faculty record? This action cannot be undone.")) {
            try {
                await deleteTeacher(id as string);

                // Log the termination
                await logActivity({
                    userId: id as string,
                    actionType: 'profile_update',
                    description: `Faculty record terminated for ${teacher?.fullName}`,
                    performedBy: user?.uid || 'system',
                    performedByName: userProfile?.name || 'Admin',
                    performedByRole: 'admin',
                    metadata: { action: 'termination' }
                });

                router.push("/teachers");
            } catch (error) {
                console.error("Error deleting teacher:", error);
                alert("Failed to delete teacher");
            }
        }
    };

    const isAdmin = userProfile?.role === 'admin';
    const isPrincipal = userProfile?.role === 'principal';
    const isManagement = isAdmin || isPrincipal;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 animate-pulse font-bold uppercase tracking-widest text-xs">Synchronizing Neural Records...</p>
        </div>
    );

    if (!teacher) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
            <div className="bg-red-50 p-6 rounded-full text-red-500"><AlertTriangle className="h-12 w-12" /></div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Faculty Record Not Found</h2>
            <Link href="/teachers" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to directory
            </Link>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/teachers" className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:scale-110 transition-transform">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{teacher.fullName}</h1>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {teacher.status}
                            </span>
                        </div>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{teacher.designation} • {teacher.department}</p>
                    </div>
                </div>
                {isManagement && (
                    <div className="flex gap-3">
                        <button className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm font-bold text-sm hover:bg-slate-50 transition-all">
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </button>
                        {isAdmin && (
                            <button onClick={handleDelete} className="flex items-center px-6 py-3 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-sm font-bold text-sm hover:bg-red-100 transition-all">
                                <Trash2 className="mr-2 h-4 w-4" /> Terminate
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-600 p-8 rounded-[2rem] shadow-lg shadow-blue-600/20 text-white relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-400/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Attendance Reliability</p>
                    <div className="text-5xl font-black mb-2">94.2<span className="text-2xl font-bold opacity-60">%</span></div>
                    <div className="h-1.5 w-full bg-blue-900/30 rounded-full mt-6">
                        <div className="h-full w-[94%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Total Violations</p>
                    <div className="flex items-end justify-between">
                        <div className="text-5xl font-black text-slate-900 dark:text-white">03</div>
                        <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl"><AlertTriangle className="h-6 w-6" /></div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-6 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" /> Requires attention
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Salary Balance</p>
                    <div className="text-5xl font-black text-slate-900 dark:text-white flex items-center">
                        <span className="text-2xl mr-1 text-slate-300">₹</span>{teacher.salaryBase?.toLocaleString()}
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-6">Standard monthly cycle</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-700 gap-8 overflow-x-auto">
                {[
                    { id: 'profile', label: 'Faculty Profile', icon: <Users /> },
                    { id: 'timeline', label: 'Activity Audit', icon: <Calendar /> },
                    { id: 'salary', label: 'Payroll Logs', icon: <DollarSign /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-4 px-2 whitespace-nowrap text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <span className="scale-75 opacity-70">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {activeTab === 'profile' && (
                    <>
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                                <div className="relative inline-block mb-6">
                                    <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
                                        {teacher.photoURL ? (
                                            <img src={teacher.photoURL} alt={teacher.fullName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-4xl font-black text-slate-400">
                                                {teacher.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{teacher.fullName}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{teacher.designation}</p>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-slate-500">Contact Intel</h4>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-sm font-bold">
                                        <div className="bg-white/5 p-2.5 rounded-xl"><Mail className="h-4 w-4 text-blue-400" /></div>
                                        <span className="truncate">{teacher.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold">
                                        <div className="bg-white/5 p-2.5 rounded-xl"><Phone className="h-4 w-4 text-blue-400" /></div>
                                        <span>{teacher.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 italic uppercase tracking-tighter flex items-center gap-4">
                                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                                    Employment Metadata
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <DataPoint label="Department" value={teacher.department} icon={<Building />} />
                                    <DataPoint label="Contract Type" value={teacher.contractType} icon={<Briefcase />} />
                                    <DataPoint label="Hire Date" value={teacher.joiningDate?.toDate().toLocaleDateString()} icon={<Calendar />} />
                                    <DataPoint label="Bank Entity" value={teacher.bankAccount?.bankName} icon={<Briefcase />} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 italic uppercase tracking-tighter flex items-center gap-4">
                                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                                    Verified Documents
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:bg-white transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><FileText className="h-5 w-5 text-slate-400" /></div>
                                            <span className="text-sm font-bold text-slate-600">Employment_Contract.pdf</span>
                                        </div>
                                        <button className="text-[10px] font-black uppercase text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">View</button>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:bg-white transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><FileText className="h-5 w-5 text-slate-400" /></div>
                                            <span className="text-sm font-bold text-slate-600">Certificates_Pack.zip</span>
                                        </div>
                                        <button className="text-[10px] font-black uppercase text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Download</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'timeline' && (
                    <div className="lg:col-span-12 space-y-8 max-w-3xl mx-auto w-full">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Audit Trail</h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 px-4 py-1 bg-slate-100 rounded-full inline-block">Real-time Activity Logs</p>
                        </div>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                            {activities.length > 0 ? (
                                activities.map((activity, i) => (
                                    <div key={activity.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                            <div className="h-2 w-2 rounded-full bg-blue-600 group-hover:bg-white" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                                            <div className="flex items-center justify-between space-x-2 mb-2">
                                                <div className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{activity.actionType.replace('_', ' ')}</div>
                                                <time className="font-mono text-[10px] font-bold text-slate-400">{activity.timestamp?.toDate().toLocaleString()}</time>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{activity.description}</p>
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated By:</div>
                                                <div className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{activity.performedByName} ({activity.performedByRole})</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-400 col-span-full">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full w-fit mx-auto mb-4 border border-slate-100 dark:border-slate-700"><Briefcase className="h-10 w-10 opacity-20" /></div>
                                    <p className="font-bold text-sm italic">No activity logs recorded for this entity.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'salary' && isAdmin && (
                    <div className="lg:col-span-12 text-center py-20">
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-full w-fit mx-auto mb-6">
                            <DollarSign className="h-12 w-12 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Restricted Payroll Financials</h3>
                        <p className="text-slate-500 max-w-md mx-auto text-sm font-bold">Comprehensive historical payroll records and dynamic disbursement history for this faculty member.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DataPoint({ label, value, icon }: any) {
    return (
        <div className="flex items-start gap-4 group">
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:text-blue-600 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200 italic">{value || 'Not Defined'}</p>
            </div>
        </div>
    )
}
