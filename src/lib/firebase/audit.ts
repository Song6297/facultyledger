import { db } from "@/lib/firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export interface AuditLog {
    id?: string;
    action: string; // e.g., "Added Teacher", "Paid Salary"
    userId: string; // ID of the admin/user performing the action
    details?: string;
    timestamp: Timestamp;
}

export const logAction = async (action: string, userId: string, details?: string) => {
    try {
        await addDoc(collection(db, "audit_logs"), {
            action,
            userId,
            details: details || "",
            timestamp: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
        // Don't throw, just log, so we don't block main actions
    }
}
