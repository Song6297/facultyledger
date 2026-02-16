import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc, Timestamp, query, where } from "firebase/firestore";
import { TeacherProfile } from "@/types/teacher";

const COLLECTION_NAME = "teachers";

export const addTeacher = async (teacher: Omit<TeacherProfile, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...teacher,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding teacher: ", error);
        throw error;
    }
};

export const getTeachers = async (): Promise<TeacherProfile[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as TeacherProfile[];
    } catch (error) {
        console.error("Error fetching teachers: ", error);
        throw error;
    }
};

export const updateTeacher = async (id: string, updates: Partial<TeacherProfile>) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, updates);
    } catch (error) {
        console.error("Error updating teacher: ", error);
        throw error;
    }
};

export const deleteTeacher = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Error deleting teacher: ", error);
        throw error;
    }
};
