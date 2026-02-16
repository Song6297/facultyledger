import { Timestamp } from "firebase/firestore";

export type PenaltyType = "salary_cut" | "warning" | "suspension";

export interface Rule {
    id?: string;
    ruleName: string;
    description: string;
    penaltyType: PenaltyType;
    penaltyValue: number; // Amount for salary_cut, or 0 for others
    autoEnforce: boolean;
    condition: string; // e.g. "late > 15", "absent"
}

export interface Violation {
    id?: string;
    teacherId: string;
    teacherName: string;
    ruleId: string;
    ruleName: string;
    date: Timestamp;
    penaltyApplied: PenaltyType;
    salaryCutAmount: number;
    notes?: string;
}
