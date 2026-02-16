"use client";

import { useEffect, useState } from "react";
import { getSalaryHistory, generateMonthlySalaries, paySalary, getOrganizationBalance } from "@/lib/firebase/salary";
import { SalaryTransaction, OrganizationBalance } from "@/types/salary";
import { DollarSign, CreditCard, Calendar, CheckCircle, Clock } from "lucide-react";

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

    const handleGenerate = async () => {
        try {
            setLoading(true);
            await generateMonthlySalaries(selectedMonth);
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
                await fetchData();
                alert("Payment successful");
            } catch (error: any) {
                alert("Payment failed: " + error.message);
            }
        }
    }

    const filteredTransactions = transactions.filter(t => t.month === selectedMonth);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balance Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization Balance</h2>
                    <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <span className="mr-1">₹</span>
                        {balance?.totalBalance.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Last updated: {balance?.lastUpdated?.toDate().toLocaleDateString()}</p>
                </div>

                {/* Controls Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                        />
                        <button
                            onClick={handleGenerate}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
                        >
                            Generate {selectedMonth} Status
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transactions for {selectedMonth}</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No salary records generated for this month yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Base Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Deductions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Net Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tx.teacherName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{tx.baseSalary}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            {tx.totalDeductions > 0 ? `-₹${tx.totalDeductions}` : '-'}
                                            {tx.deductionDetails && tx.deductionDetails.length > 0 && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {tx.deductionDetails.map((d, i) => (
                                                        <div key={i}>{d.ruleName}: ₹{d.amount}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">₹{tx.netSalary}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {tx.status !== 'paid' && (
                                                <button
                                                    onClick={() => handlePay(tx)}
                                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {tx.status === 'paid' && (
                                                <span className="text-gray-400 text-xs">
                                                    Paid on {tx.paymentDate?.toDate().toLocaleDateString()}
                                                </span>
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
    );
}
