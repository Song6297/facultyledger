"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTeacher } from "@/lib/firebase/teachers";
import { TeacherProfile } from "@/types/teacher";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function AddTeacherPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TeacherProfile>>({
        fullName: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        contractType: "permanent",
        salaryBase: 0,
        status: "active",
        bankAccount: {
            accountNumber: "",
            bankName: "",
            ifscCode: "",
        },
        documents: [],
    });

    // TODO: Handle user ID mapping (create auth user first?)
    // For now, we'll generate a placeholder userId or handle it later.

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("bankAccount.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                bankAccount: {
                    ...prev.bankAccount!,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In a real app, you might want to create a Firebase Auth user here too using a Cloud Function or secondary app.
            // For this MVP, we just create the teacher profile record.
            await addTeacher({
                ...formData,
                userId: "placeholder-uid-" + Date.now(), // Placeholder
                salaryBase: Number(formData.salaryBase),
            } as any); // Type assertion for MVP speed

            router.push("/teachers");
        } catch (error) {
            console.error("Error adding teacher:", error);
            alert("Failed to add teacher");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/teachers" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Teacher</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Personal Info</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input name="fullName" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input name="email" type="email" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input name="phone" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Professional Info</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                            <input name="department" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                            <input name="designation" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Type</label>
                            <select name="contractType" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2">
                                <option value="permanent">Permanent</option>
                                <option value="contract">Contract</option>
                                <option value="visiting">Visiting</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Financial Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Salary</label>
                            <input name="salaryBase" type="number" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                            <input name="bankAccount.bankName" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                            <input name="bankAccount.accountNumber" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IFSC Code</label>
                            <input name="bankAccount.ifscCode" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save & Add Teacher
                    </button>
                </div>
            </form>
        </div>
    );
}
