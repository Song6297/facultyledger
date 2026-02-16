import { Timestamp } from "firebase/firestore";

export type AttendanceStatus = "present" | "absent" | "late" | "half-day" | "leave";

export interface AttendanceRecord {
    id?: string;
    teacherId: string;
    teacherName: string; // Denormalized for easier querying
    date: string; // YYYY-MM-DD
    checkIn: Timestamp | null;
    checkOut: Timestamp | null;
    lateMinutes: number;
    status: AttendanceStatus;
    notes?: string;
}
