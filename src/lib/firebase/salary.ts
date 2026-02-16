import { db } from "@/lib/firebase/config";
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { SalaryTransaction, OrganizationBalance } from "@/types/salary";
import { getTeachers } from "./teachers";
import { getViolations } from "./rules";

export const getOrganizationBalance = async (): Promise<OrganizationBalance> => {
    try {
        const docRef = doc(db, "organization_balance", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as OrganizationBalance;
        } else {
            // Initialize if not exists
            const initial: OrganizationBalance = {
                totalBalance: 1000000, // Default seed money
                lastUpdated: Timestamp.now(),
            };
            await setDoc(docRef, initial);
            return initial;
        }
    } catch (error) {
        console.error("Error fetching balance:", error);
        throw error;
    }
}

export const updateOrganizationBalance = async (amount: number) => { // amount to ADD (negative to deduct)
    try {
        const docRef = doc(db, "organization_balance", "main");
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(docRef);
            if (!sfDoc.exists()) throw "Document does not exist!";

            const newBalance = sfDoc.data().totalBalance + amount;
            transaction.update(docRef, { totalBalance: newBalance, lastUpdated: Timestamp.now() });
        });
    } catch (error) {
        console.error("Error updating balance:", error);
        throw error;
    }
}

export const getSalaryHistory = async (): Promise<SalaryTransaction[]> => {
    try {
        const snapshot = await getDocs(collection(db, "salary_transactions"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalaryTransaction));
    } catch (error) {
        console.error("Error fetching salary history:", error);
        throw error;
    }
}

export const generateMonthlySalaries = async (month: string) => { // month: YYYY-MM
    try {
        const teachers = await getTeachers();
        const startOfMonth = new Date(`${month}-01`);
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

        // Fetch violations for this month
        // Ideally, query violations by date range. fetching all for MVP simplicity and filtering js side
        const allViolations = await getViolations();
        const monthViolations = allViolations.filter(v => {
            const vDate = v.date.toDate();
            return vDate >= startOfMonth && vDate <= endOfMonth;
        });

        const transactions: SalaryTransaction[] = [];

        for (const teacher of teachers) {
            // Check if already generated
            const q = query(collection(db, "salary_transactions"), where("teacherId", "==", teacher.id), where("month", "==", month));
            const existing = await getDocs(q);
            if (!existing.empty) continue;

            const teacherViolations = monthViolations.filter(v => v.teacherId === teacher.id);
            const totalDeductions = teacherViolations.reduce((sum, v) => sum + v.salaryCutAmount, 0);

            const salaryTx: SalaryTransaction = {
                teacherId: teacher.id!,
                teacherName: teacher.fullName,
                month,
                baseSalary: teacher.salaryBase,
                totalDeductions,
                netSalary: teacher.salaryBase - totalDeductions,
                status: "pending",
                deductionDetails: teacherViolations.map(v => ({ ruleName: v.ruleName, amount: v.salaryCutAmount })),
            };

            const docRef = await addDoc(collection(db, "salary_transactions"), salaryTx);
            transactions.push({ id: docRef.id, ...salaryTx });
        }

        return transactions;
    } catch (error) {
        console.error("Error generating salaries:", error);
        throw error;
    }
}

export const paySalary = async (transactionId: string, amount: number) => {
    try {
        await runTransaction(db, async (transaction) => {
            const balanceRef = doc(db, "organization_balance", "main");
            const salaryRef = doc(db, "salary_transactions", transactionId);

            const balanceDoc = await transaction.get(balanceRef);
            if (!balanceDoc.exists()) throw "Balance doc missing";

            const currentBalance = balanceDoc.data().totalBalance;
            if (currentBalance < amount) {
                throw new Error("Insufficient funds");
            }

            transaction.update(balanceRef, {
                totalBalance: currentBalance - amount,
                lastUpdated: Timestamp.now()
            });

            transaction.update(salaryRef, {
                status: "paid",
                paymentDate: Timestamp.now(),
            });
        });
    } catch (error) {
        console.error("Error paying salary:", error);
        throw error;
    }
}
