import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ActivityType } from "@/types/activity";

interface LogParams {
    userId: string;
    actionType: ActivityType;
    description: string;
    performedBy: string;
    performedByName: string;
    performedByRole: 'admin' | 'principal';
    metadata?: Record<string, any>;
}

export const logActivity = async (params: LogParams) => {
    try {
        await addDoc(collection(db, "activities"), {
            ...params,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};
