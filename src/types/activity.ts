export type ActivityType =
    | 'profile_update'
    | 'salary_change'
    | 'contract_update'
    | 'attendance_marked'
    | 'attendance_edited'
    | 'violation_recorded'
    | 'salary_processed'
    | 'document_uploaded'
    | 'rule_created'
    | 'performance_remark';

export interface Activity {
    id?: string;
    userId: string; // The teacherId or subject of the action
    actionType: ActivityType;
    description: string;
    performedBy: string; // auth.uid
    performedByName: string;
    performedByRole: 'admin' | 'principal';
    timestamp: any; // Firestore Timestamp
    metadata?: Record<string, any>;
}
