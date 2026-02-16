export type UserRole = "admin" | "principal" | "teacher";

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    role: UserRole;
    department?: string;
    status: "active" | "suspended";
    createdAt: Date;
}
