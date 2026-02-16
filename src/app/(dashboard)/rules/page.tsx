"use client";

import { useEffect, useState } from "react";
import { getRules, addRule, deleteRule, getViolations } from "@/lib/firebase/rules";
import { runRuleEngine } from "@/lib/logic/ruleEngine";
import { Rule, Violation } from "@/types/rules";
import { Plus, Trash2, AlertTriangle, Play } from "lucide-react";

export default function RulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRule, setNewRule] = useState<Partial<Rule>>({
        ruleName: "",
        description: "",
        penaltyType: "warning",
        penaltyValue: 0,
        autoEnforce: false,
        condition: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rulesData, violationsData] = await Promise.all([
                getRules(),
                getViolations(),
            ]);
            setRules(rulesData);
            setViolations(violationsData);
        } catch (error) {
            console.error("Error fetching rules data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addRule(newRule as Rule);
            setShowAddForm(false);
            setNewRule({
                ruleName: "",
                description: "",
                penaltyType: "warning",
                penaltyValue: 0,
                autoEnforce: false,
                condition: "",
            });
            fetchData();
        } catch (error) {
            alert("Failed to add rule");
        }
    }

    const handleDeleteRule = async (id: string) => {
        if (confirm("Delete this rule?")) {
            try {
                await deleteRule(id);
                fetchData();
            } catch (error) {
                alert("Failed to delete rule");
            }
        }
    }

    return (
        <div className="space-y-8">
            {/* Rules Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rules & Penalties</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                if (confirm("Run rule enforcement on today's attendance?")) {
                                    setLoading(true);
                                    const result = await runRuleEngine();
                                    setLoading(false);
                                    if (result.success) {
                                        alert(`Rule check complete. ${result.violationsCount} violations added.`);
                                        fetchData();
                                    } else {
                                        alert("Error running rules.");
                                    }
                                }
                            }}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            <Play className="mr-2 h-4 w-4" /> Run Check
                        </button>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Rule
                        </button>
                    </div>
                </div>

                {showAddForm && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Rule</h3>
                        <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Rule Name" required className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newRule.ruleName} onChange={e => setNewRule({ ...newRule, ruleName: e.target.value })} />
                            <select className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newRule.penaltyType} onChange={e => setNewRule({ ...newRule, penaltyType: e.target.value as any })}>
                                <option value="warning">Warning</option>
                                <option value="salary_cut">Salary Cut</option>
                                <option value="suspension">Suspension</option>
                            </select>
                            <input type="number" placeholder="Penalty Value (e.g. 500)" className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newRule.penaltyValue} onChange={e => setNewRule({ ...newRule, penaltyValue: Number(e.target.value) })} />
                            <input placeholder="Condition (e.g. late_minutes > 15)" className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newRule.condition} onChange={e => setNewRule({ ...newRule, condition: e.target.value })} />
                            <input placeholder="Description" className="border p-2 rounded md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newRule.description} onChange={e => setNewRule({ ...newRule, description: e.target.value })} />
                            <div className="flex items-center md:col-span-2">
                                <input type="checkbox" id="autoEnforce" className="mr-2" checked={newRule.autoEnforce} onChange={e => setNewRule({ ...newRule, autoEnforce: e.target.checked })} />
                                <label htmlFor="autoEnforce" className="text-sm text-gray-700 dark:text-gray-300">Auto Enforce</label>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save Rule</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rules.map(rule => (
                        <div key={rule.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 relative">
                            <button onClick={() => handleDeleteRule(rule.id!)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{rule.ruleName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{rule.description}</p>
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded mb-2">
                                {rule.condition}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rule.penaltyType === 'salary_cut' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {rule.penaltyType === 'salary_cut' ? `-₹${rule.penaltyValue}` : rule.penaltyType}
                                </span>
                                <span className={rule.autoEnforce ? "text-green-600" : "text-gray-400"}>
                                    {rule.autoEnforce ? "Auto-Enforced" : "Manual"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Violations Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Violations</h2>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Teacher</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Rule</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Penalty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {violations.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No violations recorded.</td></tr>
                            ) : (
                                violations.map(v => (
                                    <tr key={v.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{v.teacherName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{v.ruleName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                            {v.penaltyApplied === 'salary_cut' ? `-₹${v.salaryCutAmount}` : v.penaltyApplied}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {v.date?.seconds ? new Date(v.date.seconds * 1000).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
