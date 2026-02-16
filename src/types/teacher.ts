import { Timestamp } from "firebase/firestore";

export interface TeacherProfile {
    id?: string; // Firestore Doc ID
    userId: string; // Linked to users collection
    fullName: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    joiningDate: Timestamp;
    contractType: "permanent" | "contract" | "visiting";
    salaryBase: number;
    bankAccount: {
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    };
    photoURL?: string;
    documents: {
        name: string;
        url: string;
        type: string;
    }[];
    status: "active" | "suspended" | "terminated";
    createdAt: Timestamp;
}
