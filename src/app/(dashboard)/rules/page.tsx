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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Rules & Penalties</h1>
                    <p className="text-slate-500 dark:text-slate-400">Configure automated policy enforcement</p>
                </div>
                <div className="flex flex-wrap gap-3">
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
                        className="inline-flex items-center px-6 py-3 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-sm border border-slate-200 dark:border-slate-700"
                    >
                        <Play className="mr-2 h-4 w-4 fill-current" /> Run Engine
                    </button>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Add New Rule
                    </button>
                </div>
            </div>

            {/* Add Rule Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <Plus className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Rule</h3>
                    </div>
                    <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rule Name</label>
                            <input placeholder="e.g. Late Arrival" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none transition-all dark:text-white font-medium" value={newRule.ruleName} onChange={e => setNewRule({ ...newRule, ruleName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Penalty Type</label>
                            <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none transition-all dark:text-white font-medium appearance-none" value={newRule.penaltyType} onChange={e => setNewRule({ ...newRule, penaltyType: e.target.value as any })}>
                                <option value="warning">Formal Warning</option>
                                <option value="salary_cut">Salary Deduction (Fixed Amount)</option>
                                <option value="suspension">Temporary Suspension</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Penalty Value (Amount/Units)</label>
                            <input type="number" placeholder="e.g. 500" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none transition-all dark:text-white font-medium" value={newRule.penaltyValue} onChange={e => setNewRule({ ...newRule, penaltyValue: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trigger Condition (Logic)</label>
                            <input placeholder="e.g. lateMinutes > 15" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none transition-all dark:text-white font-mono text-sm" value={newRule.condition} onChange={e => setNewRule({ ...newRule, condition: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rule Description</label>
                            <input placeholder="Explain what this rule enforces..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none transition-all dark:text-white font-medium" value={newRule.description} onChange={e => setNewRule({ ...newRule, description: e.target.value })} />
                        </div>
                        <div className="flex items-center md:col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                            <input type="checkbox" id="autoEnforce" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 flex-shrink-0" checked={newRule.autoEnforce} onChange={e => setNewRule({ ...newRule, autoEnforce: e.target.checked })} />
                            <label htmlFor="autoEnforce" className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-300">Automate Enforcement (Apply penalty immediately upon trigger)</label>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700">
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl transition-all">Cancel</button>
                            <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-bold text-sm">Save Rule</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(rule => (
                    <div key={rule.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-md transition-all relative">
                        <button onClick={() => handleDeleteRule(rule.id!)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${rule.penaltyType === 'salary_cut' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate pr-6">{rule.ruleName}</h3>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 h-10">{rule.description}</p>
                        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 text-slate-600 dark:text-slate-400">
                            {rule.condition}
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-700">
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${rule.penaltyType === 'salary_cut' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                                }`}>
                                {rule.penaltyType === 'salary_cut' ? `Ded: ₹${rule.penaltyValue}` : rule.penaltyType}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${rule.autoEnforce ? "text-green-600 bg-green-50 px-3 py-1 rounded-full" : "text-slate-400 bg-slate-50 px-3 py-1 rounded-full"}`}>
                                {rule.autoEnforce ? "Automated" : "Manual"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Violations Section */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-blue-600 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Violations</h2>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Teacher</th>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Rule Triggered</th>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Penalty Applied</th>
                                <th scope="col" className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {violations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center">
                                        <p className="text-slate-400 font-medium italic">No violations recorded yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                violations.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50/10 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {v.teacherName.charAt(0)}
                                                </div>
                                                <span className="ml-3 text-sm font-bold text-slate-900 dark:text-white">{v.teacherName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500 dark:text-slate-400">{v.ruleName}</td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${v.penaltyApplied === 'salary_cut' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                {v.penaltyApplied === 'salary_cut' ? `-₹${v.salaryCutAmount}` : v.penaltyApplied}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-xs font-bold text-slate-400">
                                            {v.date?.seconds ? new Date(v.date.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
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
