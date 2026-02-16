"use client";

import { useEffect, useState } from "react";
import { getSalaryHistory, generateMonthlySalaries, paySalary, getOrganizationBalance } from "@/lib/firebase/salary";
import { SalaryTransaction, OrganizationBalance } from "@/types/salary";
import { DollarSign, CreditCard, Calendar, CheckCircle, Clock, Plus, AlertCircle } from "lucide-react";
import { logActivity } from "@/lib/utils/activityLogger";
import { useAuth } from "@/context/AuthContext";

export default function SalaryPage() {
    const [transactions, setTransactions] = useState<SalaryTransaction[]>([]);
    const [balance, setBalance] = useState<OrganizationBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [txData, balanceData] = await Promise.all([
                getSalaryHistory(),
                getOrganizationBalance(),
            ]);
            setTransactions(txData);
            setBalance(balanceData);
        } catch (error) {
            console.error("Error fetching salary data:", error);
        } finally {
            setLoading(false);
        }
    };

    const { user, userProfile } = useAuth();

    const handleGenerate = async () => {
        try {
            setLoading(true);
            await generateMonthlySalaries(selectedMonth);

            // Log for institution
            await logActivity({
                userId: 'organization', // System level log
                actionType: 'salary_processed',
                description: `Salary draft generated for period ${selectedMonth}`,
                performedBy: user?.uid || 'system',
                performedByName: userProfile?.name || 'Admin',
                performedByRole: 'admin',
                metadata: { month: selectedMonth }
            });

            await fetchData();
            alert("Salaries generated for " + selectedMonth);
        } catch (error) {
            alert("Failed to generate salaries");
        } finally {
            setLoading(false);
        }
    }

    const handlePay = async (tx: SalaryTransaction) => {
        if (confirm(`Confirm payment of ₹${tx.netSalary} to ${tx.teacherName}?`)) {
            try {
                await paySalary(tx.id!, tx.netSalary);

                // Log for the teacher
                await logActivity({
                    userId: tx.teacherId,
                    actionType: 'salary_processed',
                    description: `Salary processed for ${tx.month}: ₹${tx.netSalary}`,
                    performedBy: user?.uid || 'system',
                    performedByName: userProfile?.name || 'Admin',
                    performedByRole: 'admin',
                    metadata: { txId: tx.id, amount: tx.netSalary }
                });

                await fetchData();
                alert("Payment successful");
            } catch (error: any) {
                alert("Payment failed: " + error.message);
            }
        }
    }

    const filteredTransactions = transactions.filter(t => t.month === selectedMonth);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Salary Management</h1>
                <p className="text-slate-500 dark:text-slate-400">Payroll processing and organization balance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Balance Card */}
                <div className="relative overflow-hidden bg-blue-600 rounded-2xl p-8 shadow-lg shadow-blue-600/20 text-white">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <DollarSign className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-100 mb-2">Organization Balance</h2>
                        <div className="text-5xl font-black flex items-center mb-6">
                            <span className="text-2xl mr-2 text-blue-200">₹</span>
                            {balance?.totalBalance.toLocaleString()}
                        </div>
                        <div className="flex items-center text-blue-100 text-xs font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                            <Calendar className="h-3 w-3 mr-2" />
                            Last sync: {balance?.lastUpdated?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Controls Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Payroll Controls</h2>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Process for Month</label>
                            <div className="flex gap-3">
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none transition-all dark:text-white font-medium"
                                />
                                <button
                                    onClick={handleGenerate}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-bold text-sm whitespace-nowrap"
                                >
                                    Generate Draft
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-blue-600 rounded-full" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Draft Transactions: {selectedMonth}</h3>
                </div>

                <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-medium italic">Processing records...</div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                <CreditCard className="h-8 w-8" />
                            </div>
                            <p className="text-slate-400 font-medium">{selectedMonth} payroll hasn't been generated yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <tr>
                                        <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Teacher</th>
                                        <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Earnings</th>
                                        <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Adjustments</th>
                                        <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Net Payable</th>
                                        <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th scope="col" className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredTransactions.map(tx => (
                                        <tr key={tx.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                                                        {tx.teacherName.charAt(0)}
                                                    </div>
                                                    <div className="ml-4 font-bold text-slate-900 dark:text-white">{tx.teacherName}</div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600 dark:text-slate-400">₹{tx.baseSalary.toLocaleString()}</td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold ${tx.totalDeductions > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {tx.totalDeductions > 0 ? `-₹${tx.totalDeductions}` : '₹0'}
                                                    </span>
                                                    {tx.deductionDetails?.slice(0, 1).map((d, i) => (
                                                        <span key={i} className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{d.ruleName}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">₹{tx.netSalary.toLocaleString()}</div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${tx.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                {tx.status !== 'paid' ? (
                                                    <button
                                                        onClick={() => handlePay(tx)}
                                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-bold text-xs"
                                                    >
                                                        Finalize Payment
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col items-end">
                                                        <span className="flex items-center text-green-600 font-bold text-xs">
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Paid
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            {tx.paymentDate?.toDate().toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
