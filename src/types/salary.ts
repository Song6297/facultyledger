import { Timestamp } from "firebase/firestore";

export interface SalaryTransaction {
    id?: string;
    teacherId: string;
    teacherName: string;
    month: string; // YYYY-MM
    baseSalary: number;
    totalDeductions: number;
    netSalary: number;
    status: "pending" | "paid";
    paymentDate?: Timestamp;
    deductionDetails: {
        ruleName: string;
        amount: number;
    }[];
}

export interface OrganizationBalance {
    id?: string;
    totalBalance: number;
    lastUpdated: Timestamp;
}
