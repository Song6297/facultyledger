import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp, getDoc, setDoc } from "firebase/firestore";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

const COLLECTION_NAME = "attendance";

// Helper to get today's date string YYYY-MM-DD
const getTodayDateString = () => {
    return new Date().toISOString().split("T")[0];
};

export const checkIn = async (teacherId: string, teacherName: string) => {
    const date = getTodayDateString();
    const todayStart = new Date();
    todayStart.setHours(9, 0, 0, 0); // Logic: Shift starts at 9:00 AM

    const now = new Date();
    let status: AttendanceStatus = "present";
    let lateMinutes = 0;

    if (now > todayStart) {
        const diff = now.getTime() - todayStart.getTime();
        lateMinutes = Math.floor(diff / 60000); // Minutes
        if (lateMinutes > 15) { // 15 min grace period
            status = "late";
        }
    }

    const record: AttendanceRecord = {
        teacherId,
        teacherName,
        date,
        checkIn: Timestamp.now(),
        checkOut: null,
        lateMinutes,
        status,
    };

    try {
        // Check if already checked in
        const q = query(collection(db, COLLECTION_NAME), where("teacherId", "==", teacherId), where("date", "==", date));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            throw new Error("Already checked in today");
        }

        await addDoc(collection(db, COLLECTION_NAME), record);
        return { status, lateMinutes };
    } catch (error) {
        console.error("Error checking in:", error);
        throw error;
    }
};

export const checkOut = async (teacherId: string) => {
    const date = getTodayDateString();
    try {
        const q = query(collection(db, COLLECTION_NAME), where("teacherId", "==", teacherId), where("date", "==", date));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error("No check-in record found for today");
        }

        const recordDoc = snapshot.docs[0];
        await updateDoc(doc(db, COLLECTION_NAME, recordDoc.id), {
            checkOut: Timestamp.now()
        });
    } catch (error) {
        console.error("Error checking out:", error);
        throw error;
    }
}

export const getTodayAttendance = async () => {
    const date = getTodayDateString();
    try {
        const q = query(collection(db, COLLECTION_NAME), where("date", "==", date));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error) {
        console.error("Error fetching attendance:", error);
        throw error;
    }
}

export const getTeacherAttendance = async (teacherId: string) => {
    try {
        const q = query(collection(db, COLLECTION_NAME), where("teacherId", "==", teacherId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error) {
        console.error("Error fetching teacher attendance:", error);
        throw error;
    }
}
