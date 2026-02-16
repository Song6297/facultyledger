export type UserRole = "admin" | "principal" | "teacher";

export interface UserProfile {
    uid?: string;
    name: string;
    email: string;
    displayName?: string;
    role: UserRole;
    department?: string;
    status: "active" | "suspended";
    createdAt: string;
}
