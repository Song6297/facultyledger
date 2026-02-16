import { getTodayAttendance } from "@/lib/firebase/attendance";
import { getRules, addViolation } from "@/lib/firebase/rules";
import { Rule, Violation } from "@/types/rules";
import { Timestamp } from "firebase/firestore";

export const runRuleEngine = async () => {
    try {
        const [attendanceRecords, rules] = await Promise.all([
            getTodayAttendance(),
            getRules(),
        ]);

        const activeRules = rules.filter(r => r.autoEnforce);
        let violationsCount = 0;

        for (const record of attendanceRecords) {
            // Skip if teacher already has a violation for this rule today? 
            // For simplicity, we just check conditions.

            for (const rule of activeRules) {
                let isViolation = false;

                // Simple condition parsing
                // Supports: "late > X", "absent"
                if (rule.condition.includes("late")) {
                    const threshold = parseInt(rule.condition.split(">")[1].trim());
                    if (record.status === "late" && record.lateMinutes > threshold) {
                        isViolation = true;
                    }
                } else if (rule.condition.includes("absent")) {
                    if (record.status === "absent") { // Note: 'absent' status logic needs to be robust (e.g. end of day check)
                        isViolation = true;
                    }
                }

                if (isViolation) {
                    // Check if violation already exists for today to prevent duplicates
                    // (Skipping duplicate check for MVP speed, but highly recommended)

                    const violation: Omit<Violation, "id"> = {
                        teacherId: record.teacherId,
                        teacherName: record.teacherName,
                        ruleId: rule.id!,
                        ruleName: rule.ruleName,
                        date: Timestamp.now(),
                        penaltyApplied: rule.penaltyType,
                        salaryCutAmount: rule.penaltyType === 'salary_cut' ? rule.penaltyValue : 0,
                        notes: `Auto-enforced: ${rule.condition}`,
                    };

                    await addViolation(violation);
                    violationsCount++;
                }
            }
        }

        return { success: true, violationsCount };

    } catch (error) {
        console.error("Rule engine failed:", error);
        return { success: false, error };
    }
};
