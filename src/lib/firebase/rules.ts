import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc, Timestamp, query, where } from "firebase/firestore";
import { Rule, Violation } from "@/types/rules";

export const getRules = async (): Promise<Rule[]> => {
    try {
        const snapshot = await getDocs(collection(db, "rules"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rule));
    } catch (error) {
        console.error("Error fetching rules:", error);
        throw error;
    }
}

export const addRule = async (rule: Omit<Rule, "id">) => {
    try {
        await addDoc(collection(db, "rules"), rule);
    } catch (error) {
        console.error("Error adding rule:", error);
        throw error;
    }
}

export const deleteRule = async (id: string) => {
    try {
        await deleteDoc(doc(db, "rules", id));
    } catch (error) {
        console.error("Error deleting rule:", error);
        throw error;
    }
}

export const getViolations = async (): Promise<Violation[]> => {
    try {
        const snapshot = await getDocs(collection(db, "violations"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Violation));
    } catch (error) {
        console.error("Error fetching violations:", error);
        throw error;
    }
}

export const addViolation = async (violation: Omit<Violation, "id">) => {
    try {
        await addDoc(collection(db, "violations"), violation);
    } catch (error) {
        console.error("Error adding violation:", error);
        throw error;
    }
}
